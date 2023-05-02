import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { IAdeaService } from "./lib/iadea.service";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private router: Router, private iadeaSvc: IAdeaService) {
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

        return this.canActivate(childRoute, state);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        if (environment.system.lockByIAdea) {
            const support: boolean = this.iadeaSvc.isIAdeaDevice(navigator.userAgent);
            if (!support) {
                this.router.navigate(['/unsupport']);
            }
        }
        
        return of(true);
    }
}