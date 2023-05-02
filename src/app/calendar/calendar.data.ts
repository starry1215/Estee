import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { CalendarHelper } from './calendar.helper';

export const BOOK_RECOMMAND_DURATIONS: number[] = [15, 30, 45, 60, 90, 105, 120];

export class IAEventInfo {
    id: string;
    etag?: string;
    attendees?: MicrosoftGraph.Attendee[];
    body?: {
        contentType?: string;
        content?: string;
    };
    createdDateTime?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    isAllDay?: boolean;
    isOrganizer?: boolean;
    organizer?: MicrosoftGraph.Recipient;
    subject?: string;
    webLink?: string;
    allowNewTimeProposals?: boolean;
    isPrivate?: boolean;

    constructor(raw?: MicrosoftGraph.Event) {
        if (raw) {
            this.id = raw.id;
            this.etag = raw['@odata.etag'];
            this.attendees = raw.attendees;
            this.body = raw.body;
            this.startDate = raw.start?.dateTime ? new Date(raw.start?.dateTime + 'Z') : null;  
            this.endDate = raw.end?.dateTime ? new Date(raw.end?.dateTime + 'Z') : null;

            //trigger all-day event as independent event
            this.isAllDay = raw.isAllDay;
            this.isOrganizer = raw.isOrganizer;
            this.organizer = raw.organizer;
            this.isPrivate = raw.sensitivity === 'private';
            this.subject = this.isPrivate ? 'lang.word.privateEvent' : raw.subject;
            this.webLink = raw.webLink;
            this.allowNewTimeProposals = raw.allowNewTimeProposals;  
        }
    }
}

export class ICalendarAlert {
    type?: string;
    date?: Date;
    detail?: string;
    detailParams?: { [paramIndex: string]: any };
    isView?: boolean;
}

export enum ErrorType {
    Size,
    Format,
    API,
    Network,
    Internal,
    Notify
}

export enum CalendarAction {
    EndEvent,
    CancelEvent,
    Extend,
    AddEvent,
    Refresh,
    FindRoom,
    Notification,
    GetDrive,
    QRCode,
    Disconnect,
    AdjustDate,
    None
}

export enum Orientation {
    Portrait,
    Landscape
}

export class ITimelineData {
    hour?: number;
    minute?: number;
    str?: string;
}

export interface ITimelineBusyEvent {
    subject: string;
    begin: number;
    end: number;
    fakeID: string;
    isExpired?: boolean;
    isInProcess?: boolean;
    source: IAEventInfo;
    isOverlap?: boolean;
    overlapOffsetLeft?: number;
    overlapWidth?: number;
    overlapRaio?: number;
    highlight?: boolean;
}

export interface ICalendarResponse<T> {
    "@odata.context": string;
    value: T;
}

export interface IDriveItemInfo {
    cTag: string,
    createdBy: {
        user: {
            displayName: string,
            email: string,
            id: string
        }
    },
    createdDateTime: string,
    eTag: string,
    folder?: {
        childCount: number
    },
    file?: {
        hashes: {
            quickXorHash: string
        },
        mimeType: string
    },
    lastModifiedBy: {
        user: {
            displayName: string,
            email: string,
            id: string
        }
    },
    lastModifiedDateTime: string,
    name: string, //file or folder name
    id: string,
    size: number,
    webUrl: string,
    parentReference: {
        driveId: string,
        driveType: string,
        id: string,
        path: string
    }
}

export class EventBookData {
    subject?: string;
    durationInMinute?: number;
    startDate?: Date;
    endDate?: Date;
    isAllDay?: boolean;
}