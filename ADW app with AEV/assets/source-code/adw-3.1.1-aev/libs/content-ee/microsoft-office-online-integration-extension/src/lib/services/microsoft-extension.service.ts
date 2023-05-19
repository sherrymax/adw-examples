/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';
import { map, take } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

export class MsalConfigModel {
    isActive: boolean;
    auth: {
        clientId: string;
        authority: string;
        redirectUri: string;
        navigateToLoginRequestUrl: boolean;
        msHost: string;
    };
    cache: {
        cacheLocation: string;
        storeAuthStateInCookie: boolean;
    };
}

@Injectable({
    providedIn: 'root',
})
export class MicrosoftExtensionService {
    private msalHealthSubject: Subject<MsalConfigModel>;
    public msalHealthSubject$: Observable<MsalConfigModel>;

    constructor(private appConfigService: AppConfigService) {
        this.msalHealthSubject = new Subject<MsalConfigModel>();
        this.msalHealthSubject$ = this.msalHealthSubject.asObservable();
        this.appConfigService.onLoad
            .pipe(
                take(1),
                map((appConfig) => {
                    const isPluginActive = appConfig.plugins && (appConfig.plugins.microsoftOnline === true || appConfig.plugins.microsoftOnline === 'true');
                    return {
                        isActive: isPluginActive,
                        auth: {
                            clientId: isPluginActive ? appConfig?.['msOnline']?.msClientId : '',
                            authority: isPluginActive ? appConfig?.['msOnline']?.msAuthority : '',
                            redirectUri: isPluginActive ? appConfig?.['msOnline']?.msRedirectUri : '',
                            msHost: isPluginActive ? appConfig?.['msOnline']?.msHost : '',
                            navigateToLoginRequestUrl: true,
                        },
                        cache: {
                            cacheLocation: 'localStorage',
                            storeAuthStateInCookie: false,
                        },
                    } as MsalConfigModel;
                })
            )
            .subscribe((msalConfig) => {
                if (msalConfig.isActive) {
                    this.enablePlugin();
                } else {
                    this.disablePlugin();
                }
                this.updateHealth(msalConfig);
            });
    }

    enablePlugin() {
        if (localStorage && localStorage.getItem('microsoftOnline') === null) {
            localStorage.setItem('microsoftOnline', 'true');
        }
    }

    disablePlugin() {
        localStorage.removeItem('microsoftOnline');
    }

    private updateHealth(msalConfig: MsalConfigModel) {
        this.msalHealthSubject.next(msalConfig);
    }
}
