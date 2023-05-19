/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AlfrescoApiService, DiscoveryApiService, AppConfigService } from '@alfresco/adf-core';
import { Observable } from 'rxjs/internal/Observable';
import { map, catchError, filter, tap, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ProcessServicesExtActions } from '../process-services-ext-actions-types';

@Injectable({
    providedIn: 'root',
})
export class ProcessExtensionService {
    processServicesRunning = false;

    constructor(private appConfigService: AppConfigService, private store: Store<any>, private apiService: AlfrescoApiService, private discoveryApiService: DiscoveryApiService) {
        this.appConfigService.onLoad
            .pipe(
                take(1),
                map((config) => config.plugins && (config.plugins.processService === true || config.plugins.processService === 'true'))
            )
            .subscribe((isProcessEnabled) => {
                if (isProcessEnabled) {
                    this.enablePlugin();
                }
            });
    }

    enablePlugin() {
        if (localStorage && localStorage.getItem('processServices') === null) {
            localStorage.setItem('processServices', 'true');
        }
    }

    checkBackendHealth(): Observable<boolean> {
        return this.apiService.alfrescoApiInitialized.pipe(
            filter((status) => status),
            filter(() => this.apiService.getInstance().isLoggedIn()),
            take(1),
            switchMap(() => this.discoveryApiService.getBPMSystemProperties()),
            map((response) => !!response),
            tap((health) => {
                this.processServicesRunning = health;
                this.store.dispatch(
                    ProcessServicesExtActions.serviceRunningAction({
                        running: health,
                    })
                );
            }),
            catchError(() => {
                this.processServicesRunning = false;
                return of(false);
            })
        );
    }
}
