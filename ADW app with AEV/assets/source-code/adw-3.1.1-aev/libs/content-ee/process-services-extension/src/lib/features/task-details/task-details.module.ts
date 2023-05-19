/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDetailsExtComponent } from './components/task-details-ext.component';
import { ExtensionService } from '@alfresco/adf-extensions';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule, MaterialModule } from '@alfresco/adf-core';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessModule } from '@alfresco/adf-process-services';
import { TaskMetadataModule } from '../task-metadata/task-metadata.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { TaskDetailsExtEffect } from './effects/task-details-ext.effect';

@NgModule({
    declarations: [TaskDetailsExtComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        TranslateModule,
        CoreModule,
        PageLayoutModule,
        ProcessModule,
        TaskMetadataModule,
        EffectsModule.forFeature([TaskDetailsExtEffect]),
    ]
})
export class TaskDetailsModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-plugin.components.task-details-ext': TaskDetailsExtComponent,
        });
    }
}
