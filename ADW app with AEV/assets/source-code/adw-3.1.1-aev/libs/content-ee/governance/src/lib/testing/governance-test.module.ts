/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
    AlfrescoApiService,
    AppConfigService,
    TranslationService,
    CookieService,
    AlfrescoApiServiceMock,
    AppConfigServiceMock,
    TranslationMock,
    CookieServiceMock,
    TRANSLATION_PROVIDER,
    PipeModule,
} from '@alfresco/adf-core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RecordModule } from '../record/record.module';
import { GovernanceCoreModule } from '../core/governance-core.module';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
@NgModule({
    imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        GovernanceCoreModule,
        TranslateModule.forRoot(),
        PipeModule,
        RecordModule,
    ],
    providers: [
        TranslateStore,
        { provide: AlfrescoApiService, useClass: AlfrescoApiServiceMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        { provide: TranslationService, useClass: TranslationMock },
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'governance-extension',
                source: 'assets/adf-governance',
            },
        },
        { provide: CookieService, useClass: CookieServiceMock },
    ],
})
export class GovernanceTestingModule {}
