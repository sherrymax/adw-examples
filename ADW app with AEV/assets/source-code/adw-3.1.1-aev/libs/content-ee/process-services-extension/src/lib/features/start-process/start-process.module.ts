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

import { StartProcessExtComponent } from './components/start-process/start-process-ext.component';
import { ProcessDefinitionsExtComponent } from './components/process-definitions/process-definitions-ext.component';
import { canShowStartProcessFromContent } from '../../rules/process-services.rules';
import { StartProcessExtEffect } from './effects/start-process-ext.effect';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ContentEeSharedUiModule } from '@alfresco-dbp/content-ee/shared/ui';
import { StartProcessDialogComponent } from './components/start-process-dialog/start-process-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        TranslateModule,
        PageLayoutModule,
        ProcessModule,
        EffectsModule.forFeature([StartProcessExtEffect]),
        ContentEeSharedUiModule,
        MatDialogModule
    ],
    declarations: [ProcessDefinitionsExtComponent, StartProcessExtComponent, StartProcessDialogComponent],
})
export class StartProcessModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-plugin.components.start-process-ext': StartProcessExtComponent,
            'process-services-plugin.components.process-definitions-ext': ProcessDefinitionsExtComponent,
        });

        extensions.setEvaluators({
            'app.process.canShowStartProcessFromContent': canShowStartProcessFromContent,
        });
    }
}
