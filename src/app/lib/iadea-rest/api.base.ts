import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { tap, map, timeout } from "rxjs/operators";

export const API_METHOD_GET: string = 'GET';
export const API_METHOD_POST: string = 'POST';
export const CONTENT_TYPE_JSON: string = 'application/json';
export const CONTENT_TYPE_MULTIPART_FORM: string = 'multipart/form-data';

export class APIBaseManager<P, Q, T, R> {
    protected _name: string;
    protected _method: string = API_METHOD_GET;
    protected _contentType: string = CONTENT_TYPE_JSON;
    protected _timeoutRequired: boolean = true;

    private API_PORT: number = 8080;
    private API_VERSION: string = 'v2';
    private API_PROTOCOL: string = 'http';
    private readonly REQUEST_TIMEOUT: number = 30000;

    constructor(protected http: HttpClient) { }

    protected getRequestURL(host: string, path: P = null, query: Q = null): string {
        return this.API_PROTOCOL + '://' + host + ':' + this.API_PORT + '/' + this.API_VERSION + '/';
    }

    send(host: string, token: string, path: P, query: Q, txData: T, options?: any): Observable<R> {
        switch (this._method) {
            case API_METHOD_GET: {
                return this.get(host, token, path, query, options);
            }
            case API_METHOD_POST: {
                return this.post(host, token, path, query, txData, options);
            }
        }
    }

    private get(host: string, token: string, path: P, query: Q, options?: any): Observable<R> {
        const url = this.getRequestURL(host, path, query);

        console.log(this._name, API_METHOD_GET, url);

        if (this._timeoutRequired) {
            return this.http.get<R>(url, this.getRequestOptions(token, options)).pipe(
                tap((res: HttpResponse<R>) => console.log(this._name, API_METHOD_GET, res)),
                timeout(this.REQUEST_TIMEOUT),
                map((res: HttpResponse<R>) => {
                    return res.body;
                })
            );
        }
        else {
            return this.http.get<R>(url, this.getRequestOptions(token, options)).pipe(
                tap((res: HttpResponse<R>) => console.log(this._name, API_METHOD_GET, res)),
                map((res: HttpResponse<R>) => {
                    return res.body;
                })
            );
        }
    }

    private post(host: string, token: string, path: P, query: Q, txData: T, options?: any): Observable<R> {
        const url = this.getRequestURL(host, path, query);

        console.log(this._name, API_METHOD_POST, url);

        if (this._timeoutRequired) {
            return this.http.post<R>(url, txData, this.getRequestOptions(token, options)).pipe(
                tap((res: HttpResponse<R>) => console.log(this._name, API_METHOD_POST, res)),
                timeout(this.REQUEST_TIMEOUT),
                map((res: HttpResponse<R>) => {
                    return res.body;
                })
            );
        }
        else {
            console.log(this._name, ' No timeout');
            return this.http.post<R>(url, txData, this.getRequestOptions(token, options)).pipe(
                tap((res: HttpResponse<R>) => console.log(this._name, API_METHOD_POST, res)),
                map((res: HttpResponse<R>) => {
                    return res.body;
                })
            );
        }
    }

    private getRequestOptions(token: string, options?: any): { headers?: HttpHeaders, observe: any, params?: HttpParams, reportProgress?: boolean, responseType?: any, withCredentials?: boolean } {
        options = options || {};
        options.responseType = options.responseType || 'json';
        options.contentType = options.contentType || this._contentType;

        let headers: HttpHeaders = new HttpHeaders({});
        if (token) {
            headers = headers.append('Authorization', 'Bearer ' + token);
        }
        if (options.contentType) {
            headers = headers.append('Content-Type', options.contentType);
        }

        return {
            headers: headers,
            observe: 'response',
            reportProgress: false,
            responseType: options.responseType,
            withCredentials: false
        };
    }
}