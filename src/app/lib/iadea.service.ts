import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { APIHardwareWrapper } from './iadea-rest/hardware/hardware.wrapper';
import { IGetLEDLightRxData } from './iadea-rest/hardware/hardware.light.get';
import { ISetLEDLightRxData } from './iadea-rest/hardware/hardware.light.post';
import { APIAuthWrapper } from './iadea-rest/auth/auth.wrapper';
import { IGetTokenRxData } from './iadea-rest/auth/auth.token.post';

@Injectable()
export class IAdeaService {
    private Auth: APIAuthWrapper;
    private Hardware: APIHardwareWrapper;

    constructor(private http: HttpClient) {
        this.Hardware = new APIHardwareWrapper(http);
        this.Auth = new APIAuthWrapper(http);
    }

    isIAdeaDevice(userAgentStr: string): boolean {
        return userAgentStr.match(/.*ADAPI\/([\d\.]+) \(UUID:([\d\w-]+)\).*A-SMIL\//) ? true : false;
    }

    getToken(host: string, password: string): Observable<{ token?: string, passwordRequired: boolean, retry_timeout: number, error?: any }> {
        return this.Auth.GetToken.send(host, null, null, null, { grant_type: 'password', username: 'admin', password: password || '' }, null).pipe(
            map((res: IGetTokenRxData) => {
                return {
                    token: res.access_token,
                    passwordRequired: false,
                    retry_timeout: 0
                };
            }),
            catchError((res: HttpErrorResponse) => {
                return of({
                    passwordRequired: res.error && res.error.error === 'invalid_client' ? true : false,
                    error: res.error,
                    retry_timeout: res.error && res.error.retry_timeout ? res.error.retry_timeout : 0
                });
            })
        )
    }

    getLEDColor(host: string, token: string = ''): Observable<{ id: number, name: string, color: string, mode?: string }[]> {
        return this.Hardware.GetLight.send(host, token, null, null, null).pipe(
            map((res: IGetLEDLightRxData[]) => {
                if (res) {
                    return res.map(r => {
                        return {
                            id: r.id,
                            name: r.name,
                            color: r.color,
                            mode: r.mode
                        }
                    });
                }

                return [];
            })
        );
    }

    setLEDColor(host: string, token: string, id: number, name: string, color: string, mode: string = 'on', brightness: number, persistent: boolean = false): Observable<{ error?: any, ledColor?: string, id?: number }> {
        //set name = 'frame' will turn on all led bar (ex: frameLeft, frameRight)
        //do not set name but set id will only set one led bar.
        return this.Hardware.SetLight.send(host, token, null, null, { id: id, name: name, brightness: brightness, color: color, mode: mode, persistent: persistent }).pipe(
            map((res: ISetLEDLightRxData[]) => {
                const found = res.find(light => light.id === id);
                if (found) {
                    return {
                        id: id,
                        ledColor: found.color
                    };
                }

                return { error: 'Could not find match LED id = ' + id + ' on response' };
            })
        );
    }
}