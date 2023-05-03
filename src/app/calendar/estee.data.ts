import { IAEventInfo } from "./calendar.data"

export enum PlayMode {
    Calendar = 'Calendar',
    Playlist = 'Playlist'
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
    roomIdleDuration: number;
    rooms: { email: string, displayName: string }[];
    playlist: { 
        duration: number,
        folder: string,
        contents:  {
            name: string,
            duration?: number
        }[]
    };

    constructor(raw?: any) {
        console.log('--- raw config: ', raw);
        this.roomIdleDuration = raw?.roomIdleDuration || 300;
        this.rooms = raw?.rooms || [];
        if (raw?.playlist) {
            this.playlist = {
                duration: raw?.playlist.duration || 5,
                folder: raw?.playlist.folder || 'playlist',
                contents: raw?.playlist.contents || []
            };
        }
        else {
            this.playlist = {
                duration: 5,
                folder: 'playlist',
                contents: []
            };
        }
    }
}