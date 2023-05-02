import { APIBaseManager, API_METHOD_POST } from "../api.base";
import { HttpClient } from "@angular/common/http";

export interface ISetLEDLightTxData {
    id: number;
    name?: string;
    brightness: number;
    color: string;
    mode?: string;
    persistent: boolean;
}

export interface ISetLEDLightRxData {
    id: number;
    name: string;
    brightness: number;
    color: string;
    mode?: string;
    savedParameters: { brightness: number, color: string, trigger: string };
}

export class APISetLEDLightManager extends APIBaseManager<void, void, ISetLEDLightTxData, ISetLEDLightRxData[]> {
    constructor(protected http: HttpClient) {
        super(http);

        this._name = 'API_SetLEDLight';
        this._method = API_METHOD_POST;
    }

    protected getRequestURL(host: string, path: void, query: void): string {
        return super.getRequestURL(host, path, query) + 'hardware/light';
    }
}