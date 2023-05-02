import { EventEmitter, Inject, Injectable, Output } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, InteractionType, PopupRequest, PublicClientApplication, RedirectRequest } from '@azure/msal-browser';
import { AccountInfo, AuthenticationResult } from '@azure/msal-common';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { filter } from 'rxjs/operators';
import { OAuthSettings, PERSONAL_TENANTID } from '../auth';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public graphClient?: Client;
    public activeAccount: AccountInfo;

    get isPersonalAccount(): boolean {
        return this.activeAccount.tenantId === PERSONAL_TENANTID;
    }

    @Output() loginStatusChanged = new EventEmitter<{ isLogin: boolean, account?: AccountInfo }>();

    constructor(
        private msalService: MsalService,
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private msalBroadcastService: MsalBroadcastService) {

        this.msalBroadcastService.msalSubject$.pipe(
            filter((msg: EventMessage) => {
                return msg.eventType === EventType.LOGIN_SUCCESS
            }),
        ).subscribe((result: EventMessage) => {
            console.log('[authSvc] login success', result);

            const payload = result.payload as AuthenticationResult;
            this.msalService.instance.setActiveAccount(payload.account);
        });

        this.msalBroadcastService.inProgress$.pipe(
            filter((status: InteractionStatus) => {
                return status === InteractionStatus.None;
            }),
        ).subscribe(() => {
            const accountList: AccountInfo[] = this.msalService.instance.getAllAccounts();
            console.log('[authSvc] all accounts = ', accountList);
            if (accountList.length > 0) {
                this.activeAccount = accountList[0];
                this.initClient();
                this.loginStatusChanged.emit({ isLogin: true, account: this.activeAccount });
            }
            else {
                this.loginStatusChanged.emit({ isLogin: false });
            }
        });
    }

    signin() {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            if (this.msalGuardConfig.authRequest) {
                this.msalService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
                    .subscribe((response: AuthenticationResult) => {
                        this.msalService.instance.setActiveAccount(response.account);
                    });
            } else {
                this.msalService.loginPopup()
                    .subscribe((response: AuthenticationResult) => {
                        this.msalService.instance.setActiveAccount(response.account);
                    });
            }
        } else {
            if (this.msalGuardConfig.authRequest) {
                this.msalService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
            } else {
                this.msalService.loginRedirect();
            }
        }
    }

    signout() {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            this.msalService.logoutPopup({
                postLogoutRedirectUri: environment.auth.redirectUri,
                mainWindowRedirectUri: "/"
            });
        } else {
            this.msalService.logoutRedirect(
                {
                    postLogoutRedirectUri: environment.auth.redirectUri
                }
            );
        }
    }

    private initClient(): void {
        // Create an authentication provider for the current user
        const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
            this.msalService.instance as PublicClientApplication,
            {
                account: this.msalService.instance.getActiveAccount()!,
                scopes: OAuthSettings.scopes,
                interactionType: InteractionType.Redirect
            }
        );

        // Initialize the Graph client
        this.graphClient = Client.initWithMiddleware({
            authProvider: authProvider
        });
    }
}