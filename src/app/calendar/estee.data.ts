import { IAEventInfo } from "./calendar.data"

export enum PlayMode {
    Calendar = 'Calendar',
    Advertisement = 'Advertisement'
}

export enum RoomStatus {
    InUse = 'InUse',
    Available = 'Available',
    Incoming = 'Incoming'
}

export class RoomEventInfo {
    raw?: IAEventInfo;
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    subject: string;
    startInMinutes?: number;
    endInMinutes?: number;
}

export class EsteeConfigInfo {
    rooms: { email: string, displayName: string }[];
    playlist: { name: string }[];
}