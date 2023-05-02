import { APIBaseManager, API_METHOD_GET } from "../api.base";
import { HttpClient } from "@angular/common/http";

export interface IGetLEDLightRxData {
    id: number;
    name: string;
    brightness?: number;
    color: string;
    mode?: string;
    availableModes?: string[];
}

export class APIGetLEDLightManager extends APIBaseManager<void, void, void, IGetLEDLightRxData[]> {
    constructor(protected http: HttpClient) {
        super(http);

        this._name = 'API_GetLEDLight';
        this._method = API_METHOD_GET;
    }

    protected getRequestURL(host: string, path: void, query: void): string {
        return super.getRequestURL(host, path, query) + 'hardware/light';
    }
}