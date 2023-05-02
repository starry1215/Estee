import { APIBaseManager, API_METHOD_GET, API_METHOD_POST } from "../api.base";
import { HttpClient } from "@angular/common/http";
import { IErrorRxData } from '../api.data';

export interface IGetTokenTxData {
    grant_type: string;
    username: string;
    password: string;
}

export interface IGetTokenRxData {
    access_token: string;
    token_type: string;
    expires_in: number;
    retry_timeout?: number; //device is locked due to too many failed password try.
}

export class APIGetTokenManager extends APIBaseManager<void, void, IGetTokenTxData, IGetTokenRxData> {
    constructor(protected http: HttpClient) {
        super(http);

        this._name = 'API_GetToken';
        this._method = API_METHOD_POST;
    }

    protected getRequestURL(host: string, path: void, query: void): string {
        return super.getRequestURL(host, path, query) + 'oauth2/token';
    }
}