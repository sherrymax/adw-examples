/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { TRANSLATION_PROVIDER, CoreModule, AuthGuard, AppConfigService } from '@alfresco/adf-core';
import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import { EXTENSION_DATA_LOADERS } from '@alfresco-dbp/content-ce/shared';

import { ProcessExtensionServiceCloud } from './services/process-extension-cloud.service';
import { processServiceCloudPluginLoaderFactory } from './services/process-service-cloud-plugin-loader.factory';
import { isProcessServiceCloudPluginEnabled } from './rules/process-services-cloud.rules';

import { ProcessServicesCloudExtensionStoreModule } from './store/process-services-cloud-extension.store.module';
import { StartProcessModule } from './features/start-process/start-process.module';
import { SidenavCloudExtComponent } from './components/sidenav-cloud-ext/sidenav-cloud-ext.component';
import { TaskFiltersCloudExtComponent } from './features/task-list/components/task-filters-ext/task-filters-cloud-ext.component';
import { TaskCloudModule, ProcessServicesCloudModule, UserPreferenceCloudService } from '@alfresco/adf-process-services-cloud';
import { TasksListCloudModule } from './features/task-list/task-list.module';
import { ProcessListCloudModule } from './features/process-list/process-list.module';
import { ProcessFiltersCloudExtComponent } from './features/process-list/components/process-filters/process-filters-cloud-ext.component';
import { ProcessDetailsCloudModule } from './features/process-details/process-details.module';
import { TaskDetailsCloudModule } from './features/task-details/task-details-cloud.module';
import { ConfirmationDialogComponent } from './components/dialog/confirmation-dialog.component';
import { SharedFormRulesModule } from '@alfresco-dbp/shared/form-rules';
import { TaskFiltersProxyComponent } from './components/task-filters-proxy/task-filters-proxy.component';
import { ProcessFiltersProxyComponent } from './components/process-filters-proxy/process-filters-proxy.component';

@NgModule({
    declarations: [
        SidenavCloudExtComponent,
        ProcessFiltersCloudExtComponent,
        TaskFiltersCloudExtComponent,
        ConfirmationDialogComponent,
        TaskFiltersProxyComponent,
        ProcessFiltersProxyComponent
    ],
    imports: [
        CommonModule,
        ExtensionsModule.forChild(),
        CoreModule.forChild(),
        ProcessServicesCloudExtensionStoreModule,
        TranslateModule,
        StartProcessModule,
        TaskCloudModule,
        ProcessServicesCloudModule.forRoot(undefined, UserPreferenceCloudService as any),
        TasksListCloudModule,
        ProcessListCloudModule,
        ProcessDetailsCloudModule,
        TaskDetailsCloudModule,
        SharedFormRulesModule
    ],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'process-services-cloud-extension',
                source: 'assets/adf-process-services-cloud-extension',
            },
        },
        {
            provide: EXTENSION_DATA_LOADERS,
            multi: true,
            useFactory: processServiceCloudPluginLoaderFactory,
            deps: [ProcessExtensionServiceCloud, AppConfigService, Store],
        },
        provideExtensionConfig(['process-services-cloud.extension.json']),
    ],
})
export class ProcessServicesCloudExtensionModule {
    constructor(extensions: ExtensionService, processExtensionServiceCloud: ProcessExtensionServiceCloud) {
        extensions.setAuthGuards({
            'process-services-cloud.auth': AuthGuard,
        });

        extensions.setComponents({
            'process-services-cloud.process-services-cloud.sidenav': SidenavCloudExtComponent,
            'process-services-cloud.task-filters-proxy': TaskFiltersProxyComponent,
            'process-services-cloud.process-filters-proxy': ProcessFiltersProxyComponent
        });

        extensions.setEvaluators({
            'process-services-cloud.isEnabled': isProcessServiceCloudPluginEnabled,
            'process-services-cloud.isRunning': isProcessServiceCloudRunning,
        });

        function isProcessServiceCloudRunning(): boolean {
            return processExtensionServiceCloud.processServicesCloudRunning;
        }
    }
}
