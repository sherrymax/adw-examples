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

import { ExtensionService } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { TaskDetailsCloudExtComponent } from './components/task-details-cloud-ext/task-details-cloud-ext.component';
import { CoreModule } from '@alfresco/adf-core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TaskDetailsCloudMetadataComponent } from './components/task-details-cloud-metadata/task-details-cloud-metadata.component';
import { TaskAssignmentDialogComponent } from './components/task-assignment-dialog/task-assignment-dialog.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { EffectsModule } from '@ngrx/effects';
import { ProcessListCloudEffects } from '../../store/effects/process-list-cloud.effects';
import { PrintDirective } from '../../directives/print/print.directive';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatIconModule,
        TranslateModule,
        PageLayoutModule,
        ProcessServicesCloudModule,
        CoreModule,
        FlexLayoutModule,
        EffectsModule.forFeature([ProcessListCloudEffects]),
    ],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'never' } }
    ],
    declarations: [
        TaskDetailsCloudExtComponent,
        TaskDetailsCloudMetadataComponent,
        TaskAssignmentDialogComponent,
        PrintDirective
    ]
})
export class TaskDetailsCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.task-details': TaskDetailsCloudExtComponent,
        });
    }
}
