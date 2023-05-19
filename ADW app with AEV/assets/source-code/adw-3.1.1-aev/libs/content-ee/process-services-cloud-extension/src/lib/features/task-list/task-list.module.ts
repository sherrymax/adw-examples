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

import { ExtensionService, ExtensionsModule } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { TaskListCloudExtComponent } from './components/task-list-cloud-ext/task-list-cloud-ext.component';
import { DataColumnModule, PaginationModule } from '@alfresco/adf-core';
import { TaskListCloudEffects } from './store/effects/task-list-cloud.effects';
import { EffectsModule } from '@ngrx/effects';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TaskListCloudContainerExtComponent } from './components/task-list-cloud-ext/task-list-cloud-container-ext.component';
import { ScrollContainerModule } from '../../components/scroll-container/scroll-container.module';

@NgModule({
    imports: [
        CommonModule,
        DataColumnModule,
        MatListModule,
        MatRippleModule,
        MatIconModule,
        TranslateModule,
        PageLayoutModule,
        PaginationModule,
        ExtensionsModule,
        ProcessServicesCloudModule,
        ScrollContainerModule,
        EffectsModule.forFeature([TaskListCloudEffects]),
    ],
    declarations: [TaskListCloudExtComponent, TaskListCloudContainerExtComponent],
})
export class TasksListCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.task-list': TaskListCloudContainerExtComponent,
        });
    }
}
