/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import {
    IPublicClientApplication,
    AccountInfo,
    EndSessionRequest,
    AuthorizationUrlRequest,
    AuthenticationResult,
    PopupRequest,
    RedirectRequest,
    SilentRequest,
    AuthError,
    PublicClientApplication,
} from '@azure/msal-browser';
import { from, Observable } from 'rxjs';
import { MSAL_INSTANCE, MsalBroadcastEvent } from './constants';
import { MsalBroadcastService } from './msal.broadcast.service';
import { catchError, map } from 'rxjs/operators';
import { MicrosoftExtensionService } from '../../services/microsoft-extension.service';

interface IMsalService {
    acquireTokenPopup(request: PopupRequest): Observable<AuthenticationResult>;

    acquireTokenRedirect(request: RedirectRequest): Observable<void>;

    acquireTokenSilent(silentRequest: SilentRequest): Observable<AuthenticationResult>;

    getAccountByUsername(userName: string): AccountInfo | null;

    getAllAccounts(): AccountInfo[];

    handleRedirectObservable(): Observable<AuthenticationResult | null>;

    loginPopup(request?: PopupRequest): Observable<AuthenticationResult>;

    loginRedirect(request?: RedirectRequest): Observable<void>;

    logout(logoutRequest?: EndSessionRequest): Observable<void>;

    ssoSilent(request: AuthorizationUrlRequest): Observable<AuthenticationResult>;
}

@Injectable({ providedIn: 'root' })
export class MsalService implements IMsalService {
    constructor(
        @Inject(MSAL_INSTANCE) private msalInstance: IPublicClientApplication,
        private broadcastService: MsalBroadcastService,
        private microsoftExtensionService: MicrosoftExtensionService
    ) {
        this.microsoftExtensionService.msalHealthSubject$.subscribe((msalConfig) => {
            this.msalInstance = new PublicClientApplication(msalConfig.isActive ? msalConfig : { auth: { clientId: '' } });
        });
    }

    acquireTokenPopup(request: AuthorizationUrlRequest): Observable<AuthenticationResult> {
        return from(this.msalInstance.acquireTokenPopup(request)).pipe(
            map((authResponse: AuthenticationResult) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_SUCCESS, authResponse);
                return authResponse;
            }),
            catchError((error: AuthError) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_FAILURE, error);
                throw error;
            })
        );
    }

    acquireTokenRedirect(request: RedirectRequest): Observable<void> {
        return from(this.msalInstance.acquireTokenRedirect(request));
    }

    acquireTokenSilent(silentRequest: SilentRequest): Observable<AuthenticationResult> {
        return from(this.msalInstance.acquireTokenSilent(silentRequest)).pipe(
            map((authResponse: AuthenticationResult) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_SUCCESS, authResponse);
                return authResponse;
            }),
            catchError((error: AuthError) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_FAILURE, error);
                throw error;
            })
        );
    }

    getAccountByUsername(userName: string): AccountInfo {
        return this.msalInstance.getAccountByUsername(userName);
    }

    getAllAccounts(): AccountInfo[] {
        return this.msalInstance.getAllAccounts();
    }

    handleRedirectObservable(): Observable<AuthenticationResult> {
        const loggedInAccounts = this.msalInstance.getAllAccounts();
        return from(this.msalInstance.handleRedirectPromise()).pipe(
            map((authResponse: AuthenticationResult) => {
                if (authResponse) {
                    const loggedInAccount = loggedInAccounts.find((account) => account.username === authResponse.account.username);
                    if (loggedInAccount) {
                        this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_SUCCESS, authResponse);
                    } else {
                        this.broadcastService.broadcast(MsalBroadcastEvent.LOGIN_SUCCESS, authResponse);
                    }
                }
                return authResponse;
            }),
            catchError((error: AuthError) => {
                if (this.getAllAccounts().length > 0) {
                    this.broadcastService.broadcast(MsalBroadcastEvent.ACQUIRE_TOKEN_FAILURE, error);
                } else {
                    this.broadcastService.broadcast(MsalBroadcastEvent.LOGIN_FAILURE, error);
                }
                throw error;
            })
        );
    }

    loginPopup(request?: PopupRequest): Observable<AuthenticationResult> {
        return from(this.msalInstance.loginPopup(request)).pipe(
            map((authResponse: AuthenticationResult) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.LOGIN_SUCCESS, authResponse);
                return authResponse;
            }),
            catchError((error: AuthError) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.LOGIN_FAILURE, error);
                throw error;
            })
        );
    }

    loginRedirect(request?: RedirectRequest): Observable<void> {
        return from(this.msalInstance.loginRedirect(request));
    }

    logout(logoutRequest?: EndSessionRequest): Observable<void> {
        return from(this.msalInstance.logout(logoutRequest));
    }

    ssoSilent(request: AuthorizationUrlRequest): Observable<AuthenticationResult> {
        return from(this.msalInstance.ssoSilent(request)).pipe(
            map((authResponse: AuthenticationResult) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.SSO_SILENT_SUCCESS, authResponse);
                return authResponse;
            }),
            catchError((error: AuthError) => {
                this.broadcastService.broadcast(MsalBroadcastEvent.SSO_SILENT_FAILURE, error);
                throw error;
            })
        );
    }

    getToken(): Observable<string> {
        const scopes = ['user.read', 'openid', 'profile', 'Files.ReadWrite.All'];
        const currentAccount = this.msalInstance?.getAllAccounts()?.length > 0 ? this.msalInstance?.getAllAccounts()[0] : undefined;
        if (currentAccount) {
            return from(
                this.msalInstance.acquireTokenSilent({
                    account: currentAccount,
                    scopes,
                })
            ).pipe(
                map((response: AuthenticationResult) => response.accessToken),
                catchError(() =>
                    this.msalInstance
                        .acquireTokenPopup({
                            account: currentAccount,
                            scopes,
                        })
                        .then((response: AuthenticationResult) => response.accessToken)
                        .catch((error) => {
                            throw error;
                        })
                )
            );
        } else {
            return from(
                this.msalInstance.loginPopup({
                    scopes,
                })
            ).pipe(
                map((response: AuthenticationResult) => response.accessToken),
                catchError((error) => {
                    throw error;
                })
            );
        }
    }
}
