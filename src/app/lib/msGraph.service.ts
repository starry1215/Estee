import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { AuthService } from './auth.service';

import { endOfDay, startOfDay } from 'date-fns/esm';
import { IGraphMultiItem } from './msGraph.data';
import { IAEventInfo } from '../calendar/calendar.data';
import { HttpClient } from '@angular/common/http';
import { IAConfig } from '../app-config.model';

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
            //.select('displayName,mail,mailboxSettings,userPrincipalName,userType')
            .get();

        console.log('[graphSvc][user] user = ', user);
    }

    /*     
    async subscribeCalendarNotification(): Promise<{ isFault: boolean, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        try {
            const d: Date = new Date();
            d.setDate(d.getDate() + 3);
            const data = {
                changeType: "created,updated,deleted",
                notificationUrl: OAuthSettings.redirectUri,
                resource: 'me/mailFolders(\'Inbox\')/messages', //"/users/" + this.msalSvc.instance.getActiveAccount().username! + "/events",
                expirationDateTime: zonedTimeToUtc(startOfDay(d), 'UTC'),
                latestSupportedTlsVersion: 'v1_2'
            };

            const ret: any = await this.authSvc.graphClient
                .api('/subscriptions')
                .post(data);

            return { isFault: false };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    } 
    */

    async getCalendarByDate(d: Date, account?: string): Promise<{ isFault: boolean, data?: IAEventInfo[], errorMessage?: string }> {
        console.log('--- get calendar for account: ', account);
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

    async getMail(event: IAEventInfo): Promise<{ isFault: boolean, data?: any, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        try {
            const ret: IGraphMultiItem<MicrosoftGraph.Event> = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/messages') // + "?$expand=microsoft.graph.eventMessage/event($filter=id eq \'" + event.id + "\')")
                .expand(`microsoft.graph.eventMessage/event($select=id,subject;$filter=id eq '${event.id}')`)
                //.filter(`id eq '${event.id}'`)
                .select('microsoft.graph.eventMessage/event')
                .top(10)
                .get();

            return { isFault: false };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async extendEvent(event: IAEventInfo, durationInMinute: number): Promise<{ isFault: boolean, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        console.log('[graphSvc] extend event with ', arguments);

        const endDateTime = new Date(event.endDate);
        endDateTime.setMinutes(endDateTime.getMinutes() + durationInMinute);
        console.log('[graphSvc] extend with end time = ', endDateTime);

        try {
            const ret: MicrosoftGraph.Event = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/events/' + event.id)
                .patch({ end: { dateTime: endDateTime.toISOString().replace('Z', ''), timeZone: 'UTC' } });

            return { isFault: false };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async addEvent(subject: string, startDate: Date, endDate: Date, isAllDay: boolean = false): Promise<{ isFault: boolean, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        console.log('[graphSvc] create adhoc event between ', startDate, endDate);

        try {
            const ret: MicrosoftGraph.Event = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/calendar/events')
                .post({
                    subject: subject,
                    start: { dateTime: isAllDay ? startDate.toISOString().replace(/T.*Z$/, '') : startDate.toISOString().replace('Z', ''), timeZone: 'UTC' },
                    end: { dateTime: isAllDay ? endDate.toISOString().replace(/T.*Z$/, '') : endDate.toISOString().replace('Z', ''), timeZone: 'UTC' },
                    isAllDay: isAllDay
                });

            return { isFault: false };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async stopEvent(event: IAEventInfo, stopDateTime: Date): Promise<{ isFault: boolean, data?: Date, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        console.log('[graphSvc] stop event with', arguments);

        const endDateTime: Date = stopDateTime;
        endDateTime.setSeconds(0, 0);
        //if (endDateTime.getSeconds() > 0) {
        //    endDateTime.setMinutes(endDateTime.getMinutes() - 1);
        //}

        console.log('[graphSvc] stop with end time = ', endDateTime);

        try {
            const ret: MicrosoftGraph.Event = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/events/' + event.id)
                .patch({ end: { dateTime: endDateTime.toISOString().replace('Z', ''), timeZone: 'UTC' } });

            return { isFault: false, data: endDateTime };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }
    }

    async cancelEvent(eventId: string, comment?: string): Promise<{ isFault: boolean, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        console.log('[graphSvc] cancel event with', arguments);

        try {
            //how to get the status === 202 ?
            const ret: MicrosoftGraph.Event = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/events/' + eventId + '/cancel')
                .header('observe', 'response')
                .header('reponseType', 'raw') //?
                .post({ comment: comment })

            return { isFault: false };
        }
        catch (error) {
            return { isFault: true, errorMessage: error.toString() };
        }

        /*         
        return this.http.post<void>(this.GRAPH_USER_ENDPOINT + this._account.username + '/events/' + eventID + '/cancel', { comment: comment }, { observe: 'response' }).pipe(
                    map((res: HttpResponse<void>) => {
                        return res.status === 202 ? true : false;
                    })
                ) 
        */
    }

    async declineEvent(eventId: string): Promise<{ isFault: boolean, errorMessage?: string }> {
        if (!this.authSvc.graphClient) {
            return { isFault: true, errorMessage: 'No graph client' };
        }

        console.log('[graphSvc] decline event with', arguments);

        try {
            const ret: MicrosoftGraph.Event = await this.authSvc.graphClient
                .api('/users/' + this.msalSvc.instance.getActiveAccount().username! + '/events/' + eventId + '/decline')
                .post({});

            return { isFault: false };
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

    /*     getSupportedTimezone(): Observable<{ alias: string, displayName: string }[]> {
            return this.http.get(this.GRAPH_ME_ENDPOINT + 'outlook/supportedTimeZones').pipe(
                map((res: {
                    "@odata.context": string,
                    value: {
                        alias: string,
                        displayName: string
                    }[]
                }) => {
                    return res.value;
                })
            );
        } */
}