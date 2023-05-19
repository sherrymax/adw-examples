/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TRANSLATION_PROVIDER, PipeModule } from '@alfresco/adf-core';
import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EffectsModule } from '@ngrx/effects';
import { DeclareRecordEffects } from './effects/declare-record.effect';
import { DeleteRecordEffect } from './effects/delete-record.effect';
import { AdminDeleteRecordEffect } from './effects/admin-delete-record.effect';
import { RejectRecordEffect } from './effects/reject-record.effect';
import { MoveRecordEffect } from './effects/move-record.effect';
import * as recordEvaluator from './rules/record.evaluator';
import { RecordNameComponent } from './components/record-name/record-name.component';
import { GovernanceCoreModule } from '../core/governance-core.module';
import { RecordStatusComponent } from './components/record-status/record-status.component';
import { GlacierModule } from '../glacier/glacier.module';
import { DocumentListModule } from '@alfresco/adf-content-services';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecordIconComponent } from './components/record-icon/record-icon.component';
import { MaterialModule } from './material.module';
import { CUSTOM_BREAKPOINT_PROVIDER, CustomShowHideDirective } from './directives/custom-show-hide.directive';
import { LockedByModule } from '@alfresco-dbp/content-ce/shared';

export const effects = [DeclareRecordEffects, RejectRecordEffect, AdminDeleteRecordEffect, DeleteRecordEffect, MoveRecordEffect];

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ExtensionsModule,
        EffectsModule.forFeature(effects),
        FormsModule,
        ReactiveFormsModule,
        DocumentListModule,
        PipeModule,
        TranslateModule,
        MaterialModule,
        GovernanceCoreModule,
        GlacierModule,
        LockedByModule,
    ],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'governance-extension',
                source: 'assets/adf-governance',
            },
        },
        CUSTOM_BREAKPOINT_PROVIDER,
        // provideExtensionConfig(['record-admin-delete.extension.json', 'record-icon.extension.json']),
    ],
    declarations: [RecordNameComponent, RecordStatusComponent, RecordIconComponent, CustomShowHideDirective],
    exports: [RecordNameComponent, RecordStatusComponent, RecordIconComponent],
})
export class RecordModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'app.records.columns.name': RecordNameComponent,
        });

        extensions.setEvaluators({
            'app.selection.isRecord': recordEvaluator.isNodeRecord,
            'app.selection.isRejectedRecord': recordEvaluator.isNodeRecordRejected,
            'app.selection.canDeclareAsRecord': recordEvaluator.canDeclareAsRecord,
            'app.selection.canDeleteRecord': recordEvaluator.canDeleteRecord,
            'app.selection.canUpdateRecord': recordEvaluator.canUpdateRecord,

            'app.record.canUpdateVersion': recordEvaluator.canUpdateVersion,
            'app.record.canDeleteStoredNode': recordEvaluator.canDeleteStoredNode,
            'app.record.canDeleteStoredRecord': recordEvaluator.canDeleteStoredRecord,
            'app.record.canShareRecord': recordEvaluator.canShareRecord,
            'app.record.canEditSharedURL': recordEvaluator.canEditSharedURL,
        });
    }
}
