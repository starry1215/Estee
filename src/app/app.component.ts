
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { SwUpdate } from '@angular/service-worker';
import { AccountInfo } from '@azure/msal-browser';
import { from, Subject, timer } from 'rxjs';
import { concatMap, switchMap, takeUntil } from 'rxjs/operators';

import { AuthService } from './lib/auth.service';
import { CacheService } from './lib/cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _appAutoUpdateNotify$ = new Subject<void>();
  private readonly _destroying$ = new Subject<void>();

  constructor(private router: Router, private authSvc: AuthService, private location: Location, private cacheSvc: CacheService) {
  }

  ngOnInit(): void {
    /*
    if (this.swUpdates.isEnabled) {
      console.log('[app:sw] enabled');
      //sw update available notification
      this.swUpdates.available.pipe(
        takeUntil(this._destroying$)
      ).subscribe(event => {
        console.log(`[app:sw] new app version is available: (new:current) = (${event.available.hash}: ${event.current.hash})`);
        if (event.current.hash !== event.available.hash) {
          this._appAutoUpdateNotify$.next();
        }
      });

      //sw activated notification
      this.swUpdates.activated.pipe(
        takeUntil(this._destroying$)
      ).subscribe(event => {
        console.log('[app:sw] new app version is activated', event);
      });

      //add alert when sw is unrecoverable
      this.swUpdates.unrecoverable.pipe(
        takeUntil(this._destroying$)
      ).subscribe(event => {
        console.log('[app:sw] unrecoverable: ', event.reason);
      });

      //check app update 5 minutes after page is load at first time, and then check every 60 minutes.
      timer(300000, 3600000).pipe(
        takeUntil(this._destroying$)
      ).subscribe(() => {
        if (window.navigator.onLine) {
          this.swUpdates.checkForUpdate();
        }
      });

      //if new app is available, do auto update 1 minute later.
      this._appAutoUpdateNotify$.pipe(
        switchMap(() => {
          console.log('[app] start waiting for app auto-update');
          return timer(60000);
        }),
        concatMap(() => {
          return from(this.swUpdates.activateUpdate());
        }),
        takeUntil(this._destroying$)
      ).subscribe(() => {
        document.location.reload();
      });
    }
    */

    const url: URL = new URL(window.location.href);
    if (url.searchParams.has('path')) {
      const targetRoute: string | null = url.searchParams.get('path');
      url.searchParams.delete('path');
      const searchKeyPair: { [key: string]: string } = {};

      url.searchParams.forEach((v: string, key: string) => {
        searchKeyPair[key] = v;
      });

      this.router.navigate(['/' + targetRoute], { queryParams: searchKeyPair });
    }

    const subpath: string = this.location.path();
    this.authSvc.loginStatusChanged.pipe(
      takeUntil(this._destroying$)
    ).subscribe((status: { isLogin: boolean, account?: AccountInfo }) => {
      if (subpath === '' || subpath.startsWith('/login') || subpath.startsWith('/calendar')) {
        if (status.isLogin) {
          console.log('[app] login change -> login');
          this.cacheSvc.saveLoginAccount(status.account?.username);
          this.router.navigate(['/calendar']);
        }
        else {
          console.log('[app] login change -> logout');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
