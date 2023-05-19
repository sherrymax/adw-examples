/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { TRANSLATION_PROVIDER, CoreModule, AuthGuard } from '@alfresco/adf-core';
import { ProcessModule } from '@alfresco/adf-process-services';
import { PageLayoutModule, EXTENSION_DATA_LOADERS, SharedModule } from '@alfresco-dbp/content-ce/shared';

import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { isProcessServicePluginEnabled } from './rules/process-services.rules';
import { TaskFiltersExtComponent } from './components/tasks/task-filters-ext.component';
import { ProcessFiltersExtComponent } from './components/processes/process-filters-ext.component';
import { SidenavExtComponent } from './components/sidenav/sidenav-ext.component';
import { ProcessExtensionService } from './services/process-extension.service';
import { Store } from '@ngrx/store';
import { MaterialModule } from './material.module';
import { FilePreviewExtComponent } from './components/tasks/task-details/preview/file-preview-ext.component';
import { Routes, RouterModule } from '@angular/router';
import { processServicePluginLoaderFactory } from './services/process-service-plugin-loader.factory';
import { ProcessServicesExtensionStoreModule } from './store/process-services-extension.store.module';
import { StartProcessModule } from './features/start-process/start-process.module';
import { TaskListModule } from './features/task-list/task-list.module';
import { ProcessListModule } from './features/process-list/process-list.module';
import { ProcessDetailsModule } from './features/process-details/process-details.module';
import { TaskDetailsModule } from './features/task-details/task-details.module';

export const appRoutes: Routes = [
    {
        path: 'apps/:appId/task-details/:taskId/view',
        component: FilePreviewExtComponent,
        children: [
            {
                path: 'preview/blob',
                component: FilePreviewExtComponent,
                outlet: 'overlay',
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        ExtensionsModule,
        SharedModule.forRoot(),
        RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
        CoreModule,
        PageLayoutModule,
        ProcessModule.forRoot(),
        FlexLayoutModule,
        TranslateModule,
        ProcessServicesExtensionStoreModule,
        StartProcessModule,
        TaskListModule,
        ProcessListModule,
        ProcessDetailsModule,
        TaskDetailsModule,
    ],
    declarations: [TaskFiltersExtComponent, ProcessFiltersExtComponent, SidenavExtComponent, FilePreviewExtComponent],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'process-services-extension',
                source: 'assets/adf-process-services-extension',
            },
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'never' } },
        {
            provide: EXTENSION_DATA_LOADERS,
            multi: true,
            useFactory: processServicePluginLoaderFactory,
            deps: [ProcessExtensionService, Store],
        },
        provideExtensionConfig(['process-services-extension.json']),
    ]
})
export class ProcessServicesExtensionModule {
    constructor(extensions: ExtensionService, processExtensionService: ProcessExtensionService) {
        extensions.setComponents({
            'process-services-plugin.components.process-services-side-nav-ext': SidenavExtComponent,
        });

        extensions.setAuthGuards({
            'process-services-plugin.auth': AuthGuard,
        });

        extensions.setEvaluators({
            'app.process.isProcessServicePluginEnabled': isProcessServicePluginEnabled,
            'app.process.isProcessServiceRunning': isProcessServiceRunning,
        });

        function isProcessServiceRunning(): boolean {
            return processExtensionService.processServicesRunning;
        }
    }
}
