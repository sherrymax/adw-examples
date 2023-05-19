/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as siteEvaluator from './rules/site.evaluator';
import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import { BulkOperationDialogComponent } from './components/bulk-operation-dialog/bulk-operation-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from './components/icon/icon.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SecurityMarksModule } from './components/security-marks/security-marks.module';

@NgModule({
    imports: [CommonModule, ExtensionsModule, TranslateModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule, FlexLayoutModule, SecurityMarksModule],
    declarations: [BulkOperationDialogComponent, IconComponent],
    exports: [BulkOperationDialogComponent, IconComponent],
    providers: [provideExtensionConfig(['governance-core.extension.json'])],
})
export class GovernanceCoreModule {
    constructor(extension: ExtensionService) {
        extension.setEvaluators({
            'app.selection.isRMSite': siteEvaluator.isRMSite,
            isLibraryAction: siteEvaluator.isLibraryAction,
            isAGSInstalled: siteEvaluator.isAGSInstalled
        });
    }
}
