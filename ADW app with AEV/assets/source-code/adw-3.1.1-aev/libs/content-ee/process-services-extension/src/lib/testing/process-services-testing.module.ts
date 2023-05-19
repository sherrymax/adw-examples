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
    AlfrescoApiServiceMock,
    AppConfigServiceMock,
    TranslationMock,
    TRANSLATION_PROVIDER
} from '@alfresco/adf-core';
import { ApiClientsService } from '@alfresco/adf-core/api';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule, TranslateStore, TranslateService } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import * as fromProcessServices from '../store/reducers/process-services.reducer';
import { MockProvider } from 'ng-mocks';

@NgModule({
    imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(fromProcessServices.featureKey, fromProcessServices.reducer),
        EffectsModule.forRoot([]),
        TranslateModule.forRoot(),
    ],
    providers: [
        TranslateStore,
        TranslateService,
        MockProvider(ApiClientsService),
        { provide: AlfrescoApiService, useClass: AlfrescoApiServiceMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        { provide: TranslationService, useClass: TranslationMock },
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'process-services-extension',
                source: 'assets',
            },
        },
    ],
})
export class ProcessServicesTestingModule {}
