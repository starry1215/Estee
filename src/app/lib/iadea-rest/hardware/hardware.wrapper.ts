
import { HttpClient } from "@angular/common/http";
import { APIGetLEDLightManager } from "./hardware.light.get";
import { APISetLEDLightManager } from "./hardware.light.post";


export class APIHardwareWrapper {
    GetLight: APIGetLEDLightManager;
    SetLight: APISetLEDLightManager;

    constructor(private http: HttpClient) {
        this.GetLight = new APIGetLEDLightManager(http);
        this.SetLight = new APISetLEDLightManager(http);
    }
}