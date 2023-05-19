/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskMetadataExtComponent } from './components/task-metadata-ext.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule, MaterialModule } from '@alfresco/adf-core';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessModule } from '@alfresco/adf-process-services';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [TaskMetadataExtComponent],
    exports: [TaskMetadataExtComponent],
    imports: [CommonModule, FlexLayoutModule, MaterialModule, FormsModule, ReactiveFormsModule, TranslateModule, CoreModule, PageLayoutModule, ProcessModule]
})
export class TaskMetadataModule {}
