
import { HttpClient } from "@angular/common/http";
import { APIGetTokenManager } from "./auth.token.post";


export class APIAuthWrapper {
    GetToken: APIGetTokenManager;

    constructor(private http: HttpClient) {
        this.GetToken = new APIGetTokenManager(http);
    }
}