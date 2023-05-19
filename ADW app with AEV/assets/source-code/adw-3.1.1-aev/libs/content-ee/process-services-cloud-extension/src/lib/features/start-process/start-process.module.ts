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
import { EffectsModule } from '@ngrx/effects';

import { ExtensionService } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';

import { StartProcessComponent } from './components/start-process/start-process.component';
import { canShow } from './rules/start-process.rules';
import { StartProcessEffects } from './effects/start-process.effects';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { StartProcessDialogComponent } from './components/start-process-dialog/start-process-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CoreModule } from '@alfresco/adf-core';
import { ContentEeSharedUiModule } from '@alfresco-dbp/content-ee/shared/ui';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatDialogModule,
        MatIconModule,
        TranslateModule,
        PageLayoutModule,
        ProcessServicesCloudModule,
        CoreModule.forChild(),
        EffectsModule.forFeature([StartProcessEffects]),
        ContentEeSharedUiModule
    ],
    declarations: [StartProcessComponent, StartProcessDialogComponent],
})
export class StartProcessModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.start-process.start': StartProcessComponent,
        });

        extensions.setEvaluators({
            'process-services-cloud.start-process.canShow': canShow,
        });
    }
}
