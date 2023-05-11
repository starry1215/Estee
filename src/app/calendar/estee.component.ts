import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountInfo } from "@azure/msal-browser";
import { Subject, of, timer } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthService } from "../lib/auth.service";
import { MSGraphService } from '../lib/msGraph.service';
import { ErrorType, IAEventInfo } from "./calendar.data";
import { CalendarHelper } from "./calendar.helper";
import { EsteeConfigInfo, PlayMode, RoomEventInfo, RoomStatus } from "./estee.data";
import { CacheService } from "../lib/cache.service";

@Component({
    selector: 'ca-estee-entry',
    templateUrl: './estee.component.html',
    styleUrls: ['./estee.component.css']
})
export class EsteeEntryComponent implements OnInit, OnDestroy {
    private readonly CALENDAR_UPDATE_SEED: number = 30;
    private readonly INCOMING_NOTIFY_INTERVAL: number = 15;
    private readonly _destroying$ = new Subject<void>();

    private _nextCalendarQueryCounter: number = 0;
    _account: AccountInfo;
    _isOnline: boolean = false;
    _roomInfos: {
        id: string;
        displayName: string;
        email: string;
        calendarMap?: { [id: string]: IAEventInfo };
        calendars: IAEventInfo[];
        current?: RoomEventInfo;
        next?: RoomEventInfo;
        roomStatus: RoomStatus;
    }[] = [];

    _errorMessage: string;
    _enumRoomStatus: typeof RoomStatus = RoomStatus;
    _date: Date;
    _currentPlayMode: PlayMode = PlayMode.Calendar;
    _nextPlayMode: PlayMode = PlayMode.Calendar;
    _enumPlayMode: typeof PlayMode = PlayMode;
    _loading: boolean = false;
    _config: EsteeConfigInfo;
    _nextPlaylistIndex: number = 0;
    _img64Data: string;
    _timeoutHwnd: any;

    constructor(
        private authSvc: AuthService,
        private graphSvc: MSGraphService,
        private cacheSvc: CacheService) {
        this.updateNextCalendarQueryCounter('init');
    }

    ngOnInit(): void {
        this._account = this.authSvc.activeAccount;

        timer(2000, 1000).pipe(
            takeUntil(this._destroying$)
        ).subscribe(async () => {
            // update date
            this._date = new Date();

            // online status
            const isOnlineCurrent = window.navigator.onLine;
            const isOnlinePrev = this._isOnline;
            this._isOnline = isOnlineCurrent;

            if (isOnlinePrev && !isOnlineCurrent) {
                this._errorMessage = 'No internet ...';
            }
            else if (!isOnlinePrev && isOnlineCurrent) {
                this._errorMessage = '';
                const isCalendarChanged: boolean = await this.getCalendar();
                if (isCalendarChanged) {
                    this.updateStatusEveryZeroSecond('online status changed');
                }
            }

            // get calendar
            if (this._nextCalendarQueryCounter-- === 0) {
                const isCalendarChanged: boolean = await this.getCalendar();
                if (isCalendarChanged) {
                    this.updateStatusEveryZeroSecond('calendar changed');
                }
            }

            if (this._date.getSeconds() === 0) {
                this.updateStatusEveryZeroSecond('zero second');
            }
        });

        this.loadConfig();
    }

    ngOnDestroy(): void {
        this._destroying$.next();
        this._destroying$.complete();
    }

    private loadConfig(): void {
        this.cacheSvc.getConfig(true).subscribe((res: { config: EsteeConfigInfo, errorMsg?: string }) => {
            console.log('[cal] config = ', res);
            if (!res.config || !res.config.playlist) {
                throw 'No config or wrong config format';
            }

            this._config = res.config;
            res.config.rooms.forEach((room: { email: string, displayName: string }) => {
                this._roomInfos.push({
                    id: 'room-' + room.email,
                    email: room.email,
                    displayName: room.displayName,
                    calendars: [],
                    roomStatus: RoomStatus.Available
                })
            });
        });
    }

    private updateNextCalendarQueryCounter(reason?: string): void {
        this._nextCalendarQueryCounter = Math.floor((1 + Math.random()) * this.CALENDAR_UPDATE_SEED);
    }

    private async getCalendar(): Promise<boolean> {
        let isCalendarChanged: boolean = false;
        try {
            if (!this._account || !this._isOnline) {
                return;
            }

            for (let room of this._roomInfos) {
                let isRoomCalendarChanged: boolean = false;
                const ret: { isFault: boolean, data?: IAEventInfo[], errorMessage?: string } = await this.graphSvc.getCalendarByDate(this._date, room.email);
                if (!ret.isFault) {
                    isRoomCalendarChanged = !room.calendarMap || ret.data?.length !== Object.keys(room.calendarMap).length;
                    if (!isRoomCalendarChanged) {
                        for (let ev of ret.data) {
                            if (!room.calendarMap[ev.id] || room.calendarMap[ev.id].etag !== ev.etag) {
                                isRoomCalendarChanged = true;
                                break;
                            }
                        }
                    }
                    // calendar is change
                    if (isRoomCalendarChanged) {
                        room.calendarMap = ret.data.reduce((acc, cur) => {
                            acc[cur.id] = cur;
                            return acc;
                        }, {});

                        room.calendars = ret.data;
                        console.log(`[cal] calendar is changed for room ${room.displayName}`, room.calendars);
                    }

                    isCalendarChanged ||= isRoomCalendarChanged;
                }
            }

            return isCalendarChanged;
        }
        catch (ex) {
            console.error('[cal] get calendar exception = ', ex);
        }
        finally {
            this.updateNextCalendarQueryCounter('calendar finish');
        }
    }

    private updateStatusEveryZeroSecond(reason: string = '0s'): void {
        console.log(`[cal] update status by ${reason}`);

        let availableCounter: number = 0;
        for (let room of this._roomInfos) {
            const { current, next } = CalendarHelper.getCurrentAndNextEvent(room.calendars, this._date);
            room.current = current ? { raw: current, startTime: CalendarHelper.getTime(current.startDate), endTime: CalendarHelper.getTime(current.endDate), subject: current.subject } : null;
            room.next = next ? { raw: next, startTime: CalendarHelper.getTime(next.startDate), endTime: CalendarHelper.getTime(next.endDate), subject: next.subject } : null;

            if (room.current) {
                room.roomStatus = RoomStatus.InUse;
                const dateNotify: Date = new Date(room.current.raw.endDate);
                dateNotify.setMinutes(dateNotify.getMinutes() - this.INCOMING_NOTIFY_INTERVAL);
                if (CalendarHelper.isTimeInRange(this._date, dateNotify, room.current.raw.endDate)) {
                    room.current.endInMinutes = Math.ceil((room.current.raw.endDate.getTime() - this._date.getTime()) / 60000);
                }
            }
            else if (room.next) {
                const dateNotify: Date = new Date(this._date);
                dateNotify.setMinutes(dateNotify.getMinutes() + this.INCOMING_NOTIFY_INTERVAL);
                if (CalendarHelper.isTimeInRange(room.next.raw.startDate, this._date, dateNotify, true)) {
                    room.roomStatus = RoomStatus.Incoming;
                    room.next.startInMinutes = Math.ceil((room.next.raw.startDate.getTime() - this._date.getTime()) / 60000);
                }
                else {
                    room.roomStatus = RoomStatus.Available;
                    availableCounter++;
                }
            }
            else {
                room.roomStatus = RoomStatus.Available;
                availableCounter++;
            }

            console.log('[cal] room = ', room);
        }

        this._nextPlayMode = availableCounter === this._roomInfos.length ? PlayMode.Playlist : PlayMode.Calendar;
        console.log(`[cal] next playmode is ${this._nextPlayMode}`);
        if (this._nextPlayMode === PlayMode.Calendar) {
            if (this._timeoutHwnd) {
                console.log(`[cal] stop playing medias`);
                this.clearMediaTimeout();
            }

            this._currentPlayMode = this._nextPlayMode;
        }
        else {
            if (this._timeoutHwnd) {
                // do nothing, just wait for timeout
                console.log(`[cal] do nothing?`);
            }
            else {
                console.log(`[cal] start playing media`);
                this.playNextMedia();
                this._currentPlayMode = this._nextPlayMode;
            }
        }
    }

    logout(): void {
        this.authSvc.signout();
    }

    async playNextMedia(): Promise<void> {
        if (this._config.playlist.contents.length === 0) {
            return;
        }

        // when all media are finished, switch to Calendar mode
        if (this._nextPlaylistIndex >= this._config.playlist.contents.length) {
            console.log(`[cal] media carousel is finished, switch to calendar for ${this._config.roomIdleDuration}s`);
            this._nextPlaylistIndex = 0;
            this._currentPlayMode = PlayMode.Calendar;
            this._timeoutHwnd = setTimeout(() => {
                this._currentPlayMode = this._nextPlayMode;
                if (this._currentPlayMode === PlayMode.Playlist) {
                    console.log(`[cal] resume to play media`);
                    this.playNextMedia();
                }
                else {
                    this.clearMediaTimeout();
                }
            }, this._config.roomIdleDuration * 1000);

            return;
        }

        const mediaSetting: { name: string, duration?: number } = this._config.playlist.contents[this._nextPlaylistIndex];
        mediaSetting.duration = mediaSetting.duration || this._config.playlist.duration;

        const media: { isFault: boolean, b64Data?: string, mediaData?: Blob, mime?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] } = await this.cacheSvc.loadMediaStream(this._config.playlist.folder + '/' + mediaSetting.name, 50);
        if (media.isFault) {
            return;
        }

        this._img64Data = media.b64Data;
        this._nextPlaylistIndex++;
        this._timeoutHwnd = setTimeout(() => {
            this.playNextMedia();
        }, mediaSetting.duration * 1000);
    }

    private clearMediaTimeout(): void {
        clearTimeout(this._timeoutHwnd);
        this._timeoutHwnd = null;
    }
}