/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessModule } from '@alfresco/adf-process-services';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { ExtensionService } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';

import { TaskListExtComponent } from './components/task-list-ext.component';
import { TaskListExtEffect } from './effects/task-list-ext.effect';
import { CoreModule } from '@alfresco/adf-core';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatIconModule,
        TranslateModule,
        CoreModule,
        PageLayoutModule,
        ProcessModule,
        EffectsModule.forFeature([TaskListExtEffect]),
    ],
    declarations: [TaskListExtComponent],
})
export class TaskListModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-plugin.components.task-list-ext': TaskListExtComponent,
        });
    }
}
