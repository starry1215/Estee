import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AccountInfo } from "@azure/msal-browser";
import { Subject, of, timer } from "rxjs";
import { catchError, concatMap, map, takeUntil } from "rxjs/operators";
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
    _playMode: PlayMode = PlayMode.Calendar;
    _enumPlayMode: typeof PlayMode = PlayMode;
    _loading: boolean = false;
    _playlists: { name: string }[] = [];
    _nextPlaylistIndex: number = 0;
    _isPlayingMedia: boolean = false;

    private _videoRef: ElementRef;
    @ViewChild("video", { static: false })
    set video(v: ElementRef) {
        this._videoRef = v;
        this._videoRef.nativeElement.addEventListener('ended', (event) => {
            this._isPlayingMedia = false;
        });
    }

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
                console.log('--- query calendar due to network change');
                const isCalendarChanged: boolean = await this.getCalendar();
                if (isCalendarChanged) {
                    this.updateStatusEveryZeroSecond();
                }
            }

            // get calendar
            if (this._nextCalendarQueryCounter-- === 0) {
                const isCalendarChanged: boolean = await this.getCalendar();
                if (isCalendarChanged) {
                    this.updateStatusEveryZeroSecond('countdown is 0');
                }
            }

            if (this._date.getSeconds() === 0) {
                this.updateStatusEveryZeroSecond();
            }
        });

        // load config
        this.cacheSvc.getConfig(true).subscribe((res: { config: EsteeConfigInfo, errorMsg?: string }) => {
            console.log('---- config res: ', res);
            if (!res.config || !res.config.playlist) {
                throw 'No config or wrong config format';
            }

            this._playlists = res.config.playlist;
            res.config.rooms.forEach((room: { email: string, displayName: string}) => {
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

    ngOnDestroy(): void {
        this._destroying$.next();
        this._destroying$.complete();
    }

    private updateNextCalendarQueryCounter(reason?: string): void {
        this._nextCalendarQueryCounter = Math.floor((1 + Math.random()) * this.CALENDAR_UPDATE_SEED);
        console.log('--- next counter by : ', reason, this._nextCalendarQueryCounter);
    }

    private async getCalendar(): Promise<boolean> {
        let isCalendarChanged: boolean = false;
        try {
            if (!this._account || !this._isOnline) {
                return;
            }

            for (let room of this._roomInfos) {
                const ret: { isFault: boolean, data?: IAEventInfo[], errorMessage?: string } = await this.graphSvc.getCalendarByDate(this._date, room.email);
                if (!ret.isFault) {
                    isCalendarChanged ||= !room.calendarMap || ret.data?.length !== Object.keys(room.calendarMap).length;
                    if (!isCalendarChanged) {
                        for (let ev of ret.data) {
                            if (!room.calendarMap[ev.id] || room.calendarMap[ev.id].etag !== ev.etag) {
                                isCalendarChanged = true;
                                break;
                            }
                        }
                    }
                    // calendar is change
                    if (isCalendarChanged) {
                        room.calendarMap = ret.data.reduce((acc, cur) => {
                            acc[cur.id] = cur;
                            return acc;
                        }, {});

                        room.calendars = ret.data;
                        console.log('[cal] calendar is changed', room.calendars);
                    }
                }
            }

            return isCalendarChanged;
        }
        catch (ex) {
            console.error('--- exception: ', ex);
        }
        finally {
            this.updateNextCalendarQueryCounter('calendar finish');
        }
    }

    private updateStatusEveryZeroSecond(reason: string = '0s'): void {
        console.log('[cal] update status by', reason);

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

            console.log('---room: ', room);
        }

        console.log('--- available counter: ', availableCounter);
        this._playMode = availableCounter === this._roomInfos.length ? PlayMode.Advertisement : PlayMode.Calendar;
        if (this._playMode == PlayMode.Advertisement) {
            if (!this._isPlayingMedia) {
                this.playNextMedia();
            }
        }
        else {
            console.log('--- ', this._videoRef);
            if (this._isPlayingMedia) {
                this._videoRef?.nativeElement.pause();
            }
            
            this._isPlayingMedia = false;
        }
        console.log('--- playmode: ', this._playMode);
    }

    logout(): void {
        this.authSvc.signout();
    }

    async playNextMedia(): Promise<void> {
        if (this._playlists.length === 0) {
            return;
        }

        if (this._playlists.length <= this._nextPlaylistIndex) {
            this._nextPlaylistIndex = this._nextPlaylistIndex % this._playlists.length;
        }
        const mediaRes: { isFault: boolean, b64Data?: string, mediaData?: Blob, mime?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] } = await this.cacheSvc.loadMediaStream(this._playlists[this._nextPlaylistIndex].name, 50);
        if (mediaRes.isFault) {
            return;
        }

        try {
            this._videoRef.nativeElement.muted = true;
            this._videoRef.nativeElement.src = URL.createObjectURL(mediaRes.mediaData);
            this._videoRef.nativeElement.load();
            this._videoRef.nativeElement.play();
            this._isPlayingMedia = true;
            this._nextPlaylistIndex++;
        }
        catch (ex) {
            console.error('--- playNextMedia ex: ', ex);
            this._isPlayingMedia = false;
        }   
    }
}