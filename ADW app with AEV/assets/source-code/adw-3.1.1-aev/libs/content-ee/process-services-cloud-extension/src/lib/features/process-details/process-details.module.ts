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
import { PaginationModule, InfoDrawerModule, CoreModule } from '@alfresco/adf-core';
import { ProcessDetailsCloudExtComponent } from './components/process-details/process-details-cloud-ext.component';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TasksListCloudModule } from '../task-list/task-list.module';
import { ProcessHeaderCloudModule, TaskListCloudModule } from '@alfresco/adf-process-services-cloud';
import { ProcessTaskListExtComponent } from './components/process-details/process-task-list-ext.component';
import { ScrollContainerModule } from '../../components/scroll-container/scroll-container.module';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatTooltipModule,
        MatIconModule,
        TranslateModule,
        MatButtonModule,
        PageLayoutModule,
        CoreModule,
        PaginationModule,
        ProcessHeaderCloudModule,
        TaskListCloudModule,
        TasksListCloudModule,
        InfoDrawerModule,
        ExtensionsModule,
        ScrollContainerModule
    ],
    declarations: [ProcessDetailsCloudExtComponent, ProcessTaskListExtComponent],
})
export class ProcessDetailsCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.process-details': ProcessDetailsCloudExtComponent,
        });
    }
}
