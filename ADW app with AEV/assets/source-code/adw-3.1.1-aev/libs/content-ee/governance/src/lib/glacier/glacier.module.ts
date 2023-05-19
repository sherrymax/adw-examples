/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { ExtensionsModule, ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import * as glacierEvaluator from '../glacier/rules/glacier-evaluator';
import { GlacierRestoreEffect } from './effects/glacier-restore.effect';
import { GlacierStoreEffect } from './effects/glacier-store.effect';
import { RestoreDialogComponent } from './components/restore-dialog/restore-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { GlacierExtendRestoreEffect } from './effects/glacier-extend-restore.effect';
import { MaterialModule } from './material.module';
import { IconComponent } from './components/icon/icon.component';

export const effects = [GlacierStoreEffect, GlacierRestoreEffect, GlacierExtendRestoreEffect];

@NgModule({
    imports: [CommonModule, ExtensionsModule, EffectsModule.forFeature(effects), MatDialogModule, TranslateModule, FlexLayoutModule, ReactiveFormsModule, MaterialModule],
    declarations: [RestoreDialogComponent, IconComponent],
    exports: [IconComponent],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'governance-extension',
                source: 'assets/adf-governance',
            },
        },
        provideExtensionConfig(['glacier.extension.json']),
    ],
})
export class GlacierModule {
    constructor(extensions: ExtensionService) {
        extensions.setEvaluators({
            'app.glacier.canStoreRecord': glacierEvaluator.canStoreNode,
            'app.glacier.canRestoreRecord': glacierEvaluator.canRestoreNode,
            'app.glacier.canExtendRestoreRecord': glacierEvaluator.canExtendRestoreNode,

            'app.glacier.isStored': glacierEvaluator.hasStored,
            'app.glacier.isPendingRestore': glacierEvaluator.hasPendingRestore,
            'app.glacier.isRestored': glacierEvaluator.hasRestored,

            'app.glacier.canShowViewer': glacierEvaluator.canShowViewer,
        });
    }
}
