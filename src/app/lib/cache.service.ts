
import { Injectable } from '@angular/core';
import { from, lastValueFrom, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { IAConfig, IALocalConfig } from '../app-config.model';
import { AppConfigService } from '../app-config.service';
import { ErrorType } from '../calendar/calendar.data';
import { Helper } from './helper';
import { MSGraphService } from './msGraph.service';
import { EsteeConfigInfo } from '../calendar/estee.data';

@Injectable()
export class CacheService {
    private readonly CACHE_BG_NAME: string = 'IA-Config-bg';
    private readonly CACHE_LOGO_NAME: string = 'IA-Config-logo';
    private readonly CACHE_LAST_ACCOUNT: string = 'IA-Config-LastAccount';
    private readonly CACHE_APP_CONFIG: string = 'IA-Config';
    private readonly CACHE_LOCAL_CONFIG: string = 'IA-Config-Local';
    private readonly CACHE_CONFIG_USE_LOCAL: string = 'IA-Config-UseLocal';
    private readonly CACHE_LAST_LAUNCHTIME: string = 'IA-Config-LastLaunchTime';
    private readonly MB_TO_KB: number = Math.pow(2, 20);

    private _config: EsteeConfigInfo;
    private _hasWebConfig: boolean = false;
    private _bg64Data: string;
    private _logo64Data: string;
    private _lastAccount: string;
    private _lastLaunchTime: number;
    private _forceUpdateMinute: number;

    private _loadingConfig: boolean = false;
    private _loadingLogo: boolean = false;
    private _loadingBg: boolean = false;

    private _localConfig: IALocalConfig;
    get localConfig(): IALocalConfig {
        return this._localConfig;
    }
    private _useLocalConfig: boolean = false;
    get useLocalConfig(): boolean {
        return this._useLocalConfig;
    }

    private _dateFormatter: Intl.DateTimeFormat;
    get dateFormatter(): Intl.DateTimeFormat {
        return this._dateFormatter;
    }
    private _timeFormatter: Intl.DateTimeFormat;
    get timeFormatter(): Intl.DateTimeFormat {
        return this._timeFormatter;
    }

    constructor(private graphSvc: MSGraphService) {
        /*
        try {
            this.resetConfig();

            this._lastAccount = localStorage.getItem(this.CACHE_LAST_ACCOUNT);
            this._bg64Data = localStorage.getItem(this.CACHE_BG_NAME);
            this._logo64Data = localStorage.getItem(this.CACHE_LOGO_NAME);
        }
        catch (error) {
            console.error('[cache] parse error = ', error);
        }

        this._lastLaunchTime = new Date().getTime();
        this._forceUpdateMinute = Helper.roundToFix(Math.random() * 30, 0);
        this.updateCache(this.CACHE_LAST_LAUNCHTIME, this._lastLaunchTime);
        */
        this.initDateTimeFormatter();

    }

    doForceUpdate(d: Date): void {
        if (d.getHours() === 12 && d.getMinutes() === this._forceUpdateMinute) {
            console.log('[cache] prepare force reload');
            const passedMilliSeconds: number = d.getTime() - this._lastLaunchTime;
            if (!this._lastLaunchTime || Math.abs(passedMilliSeconds) > 129600000) {
                document.location.reload();
            }
        }
    }
    /*
        getBg(refresh: boolean = false): Observable<{ isFault: boolean, data?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] }> {
            console.log('[cache] get bg', refresh);
    
            if (refresh) {
                if (this._loadingBg) {
                    return Helper.waitUntil(() => !this._loadingBg).pipe(
                        map(() => {
                            return { isFault: !this._bg64Data, data: this._bg64Data };
                        })
                    );
                }
    
                this._loadingBg = true;
                return this.getConfig().pipe(
                    concatMap((res: { config: IAConfig, errorMsg?: string }) => {
                        return from(this.loadImageStream(res.config.background, this._config.resource.bg.sizeLimit, this._config.resource.bg.supportMimeTypes));
                    }),
                    map((res: { isFault: boolean, b64Data?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] }) => {
                        console.log('[cache] get bg res = ', res);
                        if (!res.isFault && res.b64Data) {
                            this._bg64Data = res.b64Data;
                            this.updateCache(this.CACHE_BG_NAME, this._bg64Data);
                        }
    
                        this._loadingBg = false;
    
                        if (res.errorType === ErrorType.Size) {
                            return { isFault: res.isFault, data: this._bg64Data, errorType: res.errorType, errorMsg: 'lang.clause.bgSizeExceed', errorMsgParams: [this._config.resource.bg.sizeLimit] };
                        }
    
                        return { isFault: res.isFault, data: this._bg64Data, errorType: res.errorType, errorMsg: res.errorMsg, errorMsgParams: res.errorMsgParams };
                    })
                );
            }
    
            return of({ isFault: false, data: this._bg64Data });
        }
    
        getLogo(refresh: boolean = false): Observable<{ isFault: boolean, data?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] }> {
            console.log('[cache] get logo', refresh);
    
            if (refresh) {
                if (this._loadingLogo) {
                    return Helper.waitUntil(() => !this._loadingLogo).pipe(
                        map(() => {
                            return { isFault: !this._bg64Data, data: this._logo64Data };
                        })
                    );
                }
    
                this._loadingLogo = true;
                return this.getConfig().pipe(
                    concatMap((res: { config: IAConfig, errorMsg?: string }) => {
                        return from(this.loadImageStream(res.config.logo, this._config.resource.logo.sizeLimit, this._config.resource.logo.supportMimeTypes));
                    }),
                    map((res: { isFault: boolean, b64Data?: string, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] }) => {
                        console.log('[cache] get logo res = ', res);
                        if (!res.isFault && res.b64Data) {
                            this._logo64Data = res.b64Data;
                            this.updateCache(this.CACHE_LOGO_NAME, this._logo64Data);
                        }
    
                        this._loadingLogo = false;
    
                        if (res.errorType === ErrorType.Size) {
                            return { isFault: res.isFault, data: this._bg64Data, errorType: res.errorType, errorMsg: 'lang.clause.logoSizeExceed', errorMsgParams: [this._config.resource.bg.sizeLimit] };
                        }
    
                        return { isFault: res.isFault, data: this._logo64Data, errorType: res.errorType, errorMsg: res.errorMsg, errorMsgParams: res.errorMsgParams };
                    })
                );
            }
    
            return of({ isFault: false, data: this._logo64Data });
        }
        */

    saveLocalConfig(config: IAConfig, useLocalConfig: boolean): void {
        this.updateCache(this.CACHE_LOCAL_CONFIG, JSON.stringify(config));
        this.updateCache(this.CACHE_CONFIG_USE_LOCAL, useLocalConfig);

        //this.resetConfig();
        this.initDateTimeFormatter();
    }

    saveLoginAccount(account?: string): void {
        if (this._lastAccount !== account) {
            this.updateCache(this.CACHE_LAST_ACCOUNT, account);

            this.removeCache(this.CACHE_BG_NAME);
            this.removeCache(this.CACHE_LOGO_NAME);
            this.removeCache(this.CACHE_APP_CONFIG);
            this.removeCache(this.CACHE_CONFIG_USE_LOCAL);
            this.removeCache(this.CACHE_LOCAL_CONFIG);

            this._bg64Data = null;
            this._logo64Data = null;
        }
    }

    getConfig(forceRefresh: boolean = false): Observable<{ config: EsteeConfigInfo, errorMsg?: string }> {
        console.log('[cache] get config, refresh = ', forceRefresh);

        if (this._loadingConfig) {
            console.log('[cache] loading config...');
            return Helper.waitUntil(() => !this._loadingConfig).pipe(
                map(() => {
                    return { config: this._config };
                })
            );
        }

        if (forceRefresh) {
            this._loadingConfig = true;
            return from(this.graphSvc.getConfig()).pipe(
                map((res: { isFault: boolean, data?: EsteeConfigInfo, errorMessage?: string }) => {
                    console.log('[cache] config from MS = ', res);

                    if (!res.isFault) {
                        this._hasWebConfig = true;
                        this._config = new EsteeConfigInfo(res.data);
                        this.updateCache(this.CACHE_APP_CONFIG, JSON.stringify(res.data));
                    }
                    else {
                        this._hasWebConfig = false;
                    }

                    this.initDateTimeFormatter();

                    this._loadingConfig = false;

                    return { config: this._config, errorMsg: res.errorMessage };
                })
            );
        }

        return of({ config: this._config });
    }

    private initDateTimeFormatter(): void {
        const dateTimeOption = {
            hour12: false,
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "numeric",
            minute: "numeric"
        };

        const language: string = 'en-US';

        this._dateFormatter = new Intl.DateTimeFormat(language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        //special handling for hourCycle under es2015?
        //if hour12 is set (no matter true or false), hourCycle is useless
        //so now only set hour12 if it is true
        //hourCycle == h24 will represents the time '00:12:00' as '24:12:00', and it seems the default setting of chrome, so set h23 as default?
        const timeOptions: Intl.DateTimeFormatOptions & { hourCycle?: string } = {
            hour: 'numeric',
            minute: 'numeric',
            hourCycle: 'h23'
        };

        timeOptions.hour12 = false;


        this._timeFormatter = new Intl.DateTimeFormat(language, timeOptions);
    }


    async loadMediaStream(relPath: string, fileSizeLimit: number, supportMimeTypes: string[] = []): Promise<{ isFault: boolean, mime?: string, b64Data?: string, mediaData?: Blob, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] }> {
        if (!this._hasWebConfig) {
            return { isFault: false };
        }

        if (!relPath) {
            //do not assign resource relative path. use default.
            return { isFault: false };
        }

        const resRet: { isFault: boolean, data?: { content: Blob, mimeType?: string }, errorMessage?: string } = await this.graphSvc.getStreamFile(relPath);
        console.log('---- resource res: ', resRet);
        if (resRet.isFault) {
            return { isFault: true, errorType: ErrorType.API, errorMsg: 'lang.clause.apiError', errorMsgParams: ['(' + relPath + ') ' + resRet.errorMessage] };
        }

        if (resRet.data.content.size > (fileSizeLimit * this.MB_TO_KB)) {
            //decide the error msg on parent function.
            return { isFault: true, errorType: ErrorType.Size };
        }

        const mime: string = resRet.data.mimeType.replace(/(image|video)\//, '');
        if (supportMimeTypes && supportMimeTypes.length > 0) {
            if (!supportMimeTypes.find(supportMime => supportMime === mime)) {
                return { isFault: true, errorType: ErrorType.Format, errorMsg: 'lang.clause.imgFormatError', errorMsgParams: [relPath] };
            }
        }
        console.log('---mime: ', mime);
        try {
            let data: { isFault: boolean, mime?: string, b64Data?: string, mediaData?: Blob, errorType?: ErrorType, errorMsg?: string, errorMsgParams?: any[] } = { 
                isFault: false,
                mime: mime
            };
            switch (mime) {
                case 'jpeg':
                case 'jpg':
                case 'png':
                    {
                        data.b64Data = await lastValueFrom(Helper.blobToBase64(resRet.data.content));
                    }
                    break;
                case 'mp4':
                    {
                        data.mediaData = resRet.data.content;
                    }
                    break;
            }
            return data;
        }
        catch (error) {
            return { isFault: true, errorType: ErrorType.Internal, errorMsg: 'lang.clause.internalError', errorMsgParams: [error.toString()] };
        }
    }

    private updateCache(cacheName: string, cacheData: any): void {
        localStorage.setItem(cacheName, cacheData);
    }

    private removeCache(cacheName: string): void {
        localStorage.removeItem(cacheName);
    }
}