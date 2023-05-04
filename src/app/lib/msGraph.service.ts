import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { AuthService } from './auth.service';

import { endOfDay, startOfDay } from 'date-fns/esm';
import { IGraphMultiItem } from './msGraph.data';
import { IAEventInfo } from '../calendar/calendar.data';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { EsteeConfigInfo } from '../calendar/estee.data';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MSGraphService {
    readonly CONFIG_FILE: string = environment.system.configFile;
    readonly CONFIG_FOLDER: string = environment.system.configRootFolder;
    _driveID: string;

    constructor(
        private http: HttpClient,
        private authSvc: AuthService,
        private msalSvc: MsalService) {
    }

    async getUserProfile(): Promise<void> {
        if (!this.authSvc.graphClient) {
            return;
        }

        const user: MicrosoftGraph.User = await this.authSvc.graphClient
            .api('/users/' + this.msalSvc.instance.getActiveAccount().username!)
            .get();

        console.log('[graphSvc][user] user = ', user);
    }

    async getCalendarByDate(d: Date, account?: string): Promise<{ isFault: boolean, data?: IAEventInfo[], errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        const date: Date = d;
        try {
            const endDate: Date = endOfDay(date);
            endDate.setDate(endDate.getDate() + 1);

            const ret: IGraphMultiItem<MicrosoftGraph.Event> = await this.authSvc.graphClient
                .api(`/users/${account || this.msalSvc.instance.getActiveAccount().username!}/calendar/calendarView`)
                .query({
                    startDateTime: startOfDay(date).toISOString(),
                    endDateTime: endDate.toISOString()
                })
                //.select('subject,organizer,isOrganizer,start,end,allowNewTimeProposals,webLink,isAllDay,sensitivity')
                .orderby('start/dateTime')
                .top(50)
                .get();

            return { isFault: false, data: ret.value.map((ev: MicrosoftGraph.Event) => new IAEventInfo(ev)) };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async getStreamFile(relPath: string, options?: { responseType: string }): Promise<{ isFault: boolean, data?: { content: Blob, mimeType?: string }, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        try {
            if (!this._driveID) {
                const drive: MicrosoftGraph.Drive = await this.authSvc.graphClient
                    .api(this.authSvc.isPersonalAccount ? '/users/' + this.msalSvc.instance.getActiveAccount().username! + '/drive' : '/sites/root')
                    .get();
                this._driveID = drive.id;
            }

            const file: MicrosoftGraph.DriveItem = await this.authSvc.graphClient
                .api((this.authSvc.isPersonalAccount ? '/drives/' + this._driveID : '/sites/' + this._driveID + '/drive') + '/root:/' + this.CONFIG_FOLDER + '/' + relPath)
                .get();

            if (!file['@microsoft.graph.downloadUrl']) {
                return { isFault: false };
            }

            const contentRaw: Blob = await lastValueFrom(this.http.get(file['@microsoft.graph.downloadUrl'], { responseType: 'blob' }));
            return { isFault: false, data: { content: contentRaw, mimeType: file.file.mimeType } };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async getConfig(): Promise<{ isFault: boolean, data?: EsteeConfigInfo, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        //get first-layer document under root document library
        // /sites/{site-id}/drive/items/root/children
        // /drives/{drive-id}/items/root/children
        try {
            if (!this._driveID) {
                const drive: MicrosoftGraph.Drive = await this.authSvc.graphClient
                    .api(this.authSvc.isPersonalAccount ? '/users/' + this.msalSvc.instance.getActiveAccount().username! + '/drive' : '/sites/root')
                    .get();
                this._driveID = drive.id;
            }

            /*
            const driveItemId: string = 'root';
            const driveItems: IGraphMultiItem<MicrosoftGraph.DriveItem> = await this.authSvc.graphClient
                .api(this.authSvc.isPersonalAccount ? '/drives/' + this._driveID + '/items/' + driveItemId + '/children' : '/sites/' + this._driveID + '/drive/items/root/children')
                .get();
            
            const deskBookingFolder: MicrosoftGraph.DriveItem = driveItems.value.find(dv => dv.folder && dv.name === 'DeskBooking');
            if (!deskBookingFolder) {
                return { isFault: false };
            }

            const driveItemsUnderBookingFoler: IGraphMultiItem<MicrosoftGraph.DriveItem> = await this.authSvc.graphClient
                .api('/drives/' + drive.id + '/items/' + deskBookingFolder.id + '/children')
                .get();
            
            const configFile: MicrosoftGraph.DriveItem = driveItemsUnderBookingFoler.value.find(dv => dv.file && dv.name === 'config.json');
            */
            const configFile: MicrosoftGraph.DriveItem = await this.authSvc.graphClient
                .api((this.authSvc.isPersonalAccount ? '/drives/' + this._driveID : '/sites/' + this._driveID + '/drive') + '/root:/' + this.CONFIG_FOLDER + '/' + this.CONFIG_FILE)
                .get();

            if (!configFile) {
                return { isFault: true, errorMessage: 'Error: No config file' };
            }
            if (!configFile['@microsoft.graph.downloadUrl']) {
                return { isFault: true, errorMessage: 'Error: No config file download url' };
            }

            const configRaw: string = await this.http.get(configFile['@microsoft.graph.downloadUrl'], { responseType: 'text' }).toPromise();
            const config: EsteeConfigInfo = JSON.parse(configRaw);

            return { isFault: false, data: config };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }
}