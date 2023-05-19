/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionLoaderCallback } from '@alfresco-dbp/content-ce/shared';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ProcessExtensionService } from './process-extension.service';
import { isProcessServicePluginEnabled } from '../rules/process-services.rules';
import { of } from 'rxjs';
import { updateProcessServiceHealth } from '../store/actions/process-services-health.actions';

export function processServicePluginLoaderFactory(processExtensionService: ProcessExtensionService, store: Store<any>): ExtensionLoaderCallback {
    return () => {
        if (!isProcessServicePluginEnabled()) {
            return of(true);
        }

        return processExtensionService.checkBackendHealth().pipe(
            tap((health) => {
                store.dispatch(
                    updateProcessServiceHealth({
                        health,
                    })
                );
            })
        );
    };
}
