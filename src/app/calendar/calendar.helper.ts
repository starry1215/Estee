
import { IAEventInfo } from "./calendar.data";

export class CalendarHelper {
    private static _targetDate: Date;

    public static setTargetDate(date: string, time?: string): Date {
        const now: Date = new Date();
        if (date) {
            time = time || now.getHours() + ':' + now.getMinutes();
            this._targetDate = new Date(date + ' ' + time);
            this._targetDate.setSeconds(now.getSeconds(), now.getMilliseconds());
        }
        else {
            this._targetDate = now;
        }

        return this._targetDate;
    }

    public static padTime(d: number): string {
        if (d.toString().padStart) {
            return d.toString().padStart(2, '0');
        }

        return d < 10 ? '0' + d : d.toString();
    }

    public static isTimeInRange(d: Date, dMin: Date, dMax: Date, includeMax: boolean = true): boolean {
        //compare only HH:mm
        //if (!CalendarHelper.isSameDay(dMax, d)) {
        //    return false;
        //}

        const dm: number = d.getTime();
        const dminm: number = dMin.getTime();
        const dmaxm: number = dMax.getTime();

        return dm >= dminm && (includeMax ? dm <= dmaxm : dm < dmaxm) ? true : false;
        /*
        const dhm: string = CalendarHelper.padTime(d.getHours()) + CalendarHelper.padTime(d.getMinutes());
        const dhmMin: string = CalendarHelper.padTime(dMin.getHours()) + CalendarHelper.padTime(dMin.getMinutes());
        const dhmMax: string = CalendarHelper.padTime(dMax.getHours()) + CalendarHelper.padTime(dMax.getMinutes());

        return CalendarHelper.isTimeInRangeByHM(dhm, dhmMin, dhmMax, includeMax);
        */
    }

    public static isTimeInRangeByHM(h: string, hmin: string, hmax: string, includeMax: boolean = true): boolean {
        return h >= hmin && (includeMax ? h <= hmax : h < hmax) ? true : false;
    }

    public static getFloorDate(date: Date, gap: number = 15, reviseCrossDay: boolean = false): Date {
        const d: Date = new Date(date);
        
        if (reviseCrossDay) {
            if (!CalendarHelper.isSameDay(date, new Date(this._targetDate))) {
                d.setDate(d.getDate() + 1);
                d.setHours(0, 0, 0, 0);
            }
        }
        
        const minute: number = d.getMinutes();
        d.setMinutes(gap * (Math.floor(minute / gap)), 0, 0);

        return d;
    }

    public static getCeilDate(date: Date, gap: number = 15, reviseCrossDay: boolean = false): Date {
        const d: Date = new Date(date);

        if (reviseCrossDay) {
            if (!CalendarHelper.isSameDay(date, new Date(this._targetDate))) {
                d.setDate(d.getDate() - 1);
                d.setHours(23, 55, 0, 0);
            }
        }

        const minute: number = d.getMinutes();
        d.setMinutes(gap * (Math.ceil(minute / gap)), 0, 0);

        return d;
    }

    public static getRoundTimeMinute(date: Date, gap: number = 15): Date {
        const minutes: number = date.getMinutes();
        const offsetInGap: number = minutes % gap;
        const minuteToAdd: number = offsetInGap > (gap / 2) ? gap * (Math.ceil(minutes / gap)) : minutes - offsetInGap;

        date.setMinutes(minuteToAdd);

        return date;
    }

    public static getNearestTime(date: Date, gap: number = 15, next?: Date): Date {
        const minute: number = date.getMinutes();
        const remainder: number = minute % gap;
        const offset: number = gap - remainder;

        const newDate: Date = new Date(date);
        newDate.setMinutes(minute + offset);
        return next ? (newDate.getTime() >= next.getTime() ? null : newDate) : newDate;
    }

    public static getCurrentAndNextEvent(eventList: IAEventInfo[], startDate: Date, getNext: boolean = true): { current?: IAEventInfo, next?: IAEventInfo } {
        if (!eventList || eventList.length === 0) {
            return { current: null, next: null };
        }
        
        const now: Date = startDate ?? new Date(this._targetDate);

        let currentEventIndex: number = -1;
        const current: IAEventInfo = eventList.find((ev: IAEventInfo, index: number) => {
            if (ev.isAllDay) {
                return true;
            }
            
            const inRange: boolean = CalendarHelper.isTimeInRange(now, ev.startDate, ev.endDate, false);
            if (inRange) {
                currentEventIndex = index;
            }

            return inRange;
        });

        let next: IAEventInfo;
        if (getNext) {
            next = eventList.find(c => CalendarHelper.isTimeInRange(current?.endDate || now, current?.endDate || now, c.startDate));
        }

        return {
            current: current,
            next: next
        };
    }

    public static getEventDuration(event: IAEventInfo): number {
        return Math.round((event.endDate.getTime() - event.startDate.getTime()) / 60000);
    }

    public static getEventProgressMinute(event: IAEventInfo, baseDate: Date): number {
        const d: Date = new Date(baseDate);
        d.setSeconds(0, 0);
        const begin: Date = new Date(event.startDate);
        begin.setSeconds(0, 0);

        return Math.round((d.getTime() - begin.getTime()) / 60000);
    }

    public static isEventCrossDays(startDate: Date, endDate: Date): boolean {
        return CalendarHelper.getDateYMDFormat(endDate) > CalendarHelper.getDateYMDFormat(startDate);
    }

    public static isSameDay(date: Date, baseDate: Date): boolean {
        return CalendarHelper.getDateYMDFormat(date) === CalendarHelper.getDateYMDFormat(baseDate);
    }

    public static getDateYMDFormat(date: Date, connector: string = '-'): string {
        return date.getFullYear() + connector + date.getMonth() + connector + date.getDate();
    }

    public static getTime(date: Date): string {
        return date ? CalendarHelper.padTime(date.getHours()) + ':' + CalendarHelper.padTime(date.getMinutes()) : '';
    }
}