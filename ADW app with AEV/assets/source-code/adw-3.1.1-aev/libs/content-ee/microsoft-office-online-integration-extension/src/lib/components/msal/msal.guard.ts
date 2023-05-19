/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { InteractionType, MSAL_GUARD_CONFIG } from './constants';
import { MsalGuardConfiguration } from './msal.guard.config';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MsalService } from './msal.service';

@Injectable({ providedIn: 'root' })
export class MsalGuard implements CanActivate {
    constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, private authService: MsalService, private location: Location) {}

    getDestinationUrl(path: string): string {
        const baseElements = document.getElementsByTagName('base');
        const baseUrl = this.location.normalize(baseElements.length ? baseElements[0].href : window.location.origin);

        const pathUrl = this.location.prepareExternalUrl(path);

        if (pathUrl.startsWith('#')) {
            return `${baseUrl}/${pathUrl}`;
        }

        return `${baseUrl}${path}`;
    }

    private loginInteractively(url: string): Observable<boolean> {
        if (this.msalGuardConfig.interactionType === InteractionType.POPUP) {
            return this.authService.loginPopup({ ...this.msalGuardConfig.authRequest }).pipe(
                map(() => true),
                catchError(() => of(false))
            );
        }

        const redirectStartPage = this.getDestinationUrl(url);
        this.authService.loginRedirect({
            ...this.msalGuardConfig.authRequest,
            redirectStartPage,
            scopes: [],
        });
        return of(false);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
        return this.authService.handleRedirectObservable().pipe(
            concatMap(() => {
                if (!this.authService.getAllAccounts()?.length) {
                    return this.loginInteractively(state.url);
                }
                return of(true);
            })
        );
    }
}
