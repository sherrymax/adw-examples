/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { ExtensionLoaderCallback } from '@alfresco-dbp/content-ce/shared';

import { ProcessExtensionServiceCloud } from './process-extension-cloud.service';
import { isProcessServiceCloudPluginEnabled } from '../rules/process-services-cloud.rules';
import { initialiseExtension } from '../store/actions/extension.actions';
import { loadProcessDefinitions, loadRecentProcessDefinitions } from '../store/actions/process-definition.actions';
import { AppConfigService } from '@alfresco/adf-core';

export function processServiceCloudPluginLoaderFactory(
    processExtensionServiceCloud: ProcessExtensionServiceCloud,
    appConfigService: AppConfigService,
    store: Store<any>
): ExtensionLoaderCallback {
    return () => {
        if (!isProcessServiceCloudPluginEnabled()) {
            return of(true);
        }

        return processExtensionServiceCloud.checkBackendHealth().pipe(
            tap((health) => {
                store.dispatch(
                    initialiseExtension({
                        health,
                        application: appConfigService.get('alfresco-deployed-apps')[0].name,
                    })
                );

                if (health) {
                    store.dispatch(loadProcessDefinitions());
                    store.dispatch(loadRecentProcessDefinitions());
                }
            })
        );
    };
}
