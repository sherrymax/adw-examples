/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRulesImplementationService } from './services/form-rules-implementation.service';
import { FORM_RULES_MANAGER } from '@alfresco/adf-core';

@NgModule({
    imports: [CommonModule],
    providers: [
        {
            provide: FORM_RULES_MANAGER,
            useExisting: FormRulesImplementationService
        }
    ]
})
export class SharedFormRulesModule {}
