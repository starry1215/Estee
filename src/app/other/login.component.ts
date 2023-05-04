import { Component, OnDestroy, OnInit } from "@angular/core";
import { concat, fromEvent, merge, Subject, timer } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { AuthService } from "../lib/auth.service";
import { CacheService } from "../lib/cache.service";

@Component({
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
    _logo64Data: string;
    _isOnline: boolean = true;

    private readonly _destroying$ = new Subject<void>();

    constructor(private authSvc: AuthService, private cacheSvc: CacheService) {
    }

    ngOnInit(): void {
        concat(timer(1000), merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(debounceTime(5000))).pipe(
            takeUntil(this._destroying$)
        ).subscribe(async () => {
            console.log('[cal] online status change, online ? ', window.navigator.onLine);
            this._isOnline = window.navigator.onLine;
        });
    }

    ngOnDestroy(): void {
        this._destroying$.next();
        this._destroying$.complete();
    }

    login(): void {
        this.authSvc.signin();
    }
}