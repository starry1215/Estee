import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: './qrcode-redirect.component.html',
    styleUrls: ['./qrcode-redirect.component.css']
})
export class QRCodeRedirectComponent implements OnInit {
    readonly IOS_STORE_LINK: string = 'https://apps.apple.com/tw/app/microsoft-outlook/id951937596';
    readonly ANDROID_STORE_LINK: string = 'https://play.google.com/store/apps/details?id=com.microsoft.office.outlook';
    readonly OUTLOOK_WEB_LINK: string = 'https://outlook.office.com?path=/calendar/view/Month&rru=addevent';
    
    _location: string;
    _outlookWebLink: string;

    constructor(private translateSvc: TranslateService, private router: Router) {}

    ngOnInit(): void {
        //try navigator directly
        window.location.href = 'ms-outlook://events/new' + window.location.search.replace(/&location=(.*)/, '');

        //for web office
        const url: URL = new URL(window.location.href);
        let key: string = '';

        //lang
        key = 'lang';
        if (url.searchParams.has(key)) {
            const lang: string = url.searchParams.get(key);
            this.translateSvc.use(lang);
            url.searchParams.delete(key);
        }

        //location
        key = 'location';
        if (url.searchParams.has(key)) {
            this._location = url.searchParams.get(key);
            url.searchParams.delete(key);
        }
        
        var queries = [];
        url.searchParams.forEach((v: string, key: string) => {
            queries.push(key + '=' + encodeURI(url.searchParams.get(key)));
        });

        //title
        var queryStr = queries.join('&').replace('title=', 'subject=');

        this._outlookWebLink = this.OUTLOOK_WEB_LINK + (queryStr ? '&' + queryStr : '');
    }
}