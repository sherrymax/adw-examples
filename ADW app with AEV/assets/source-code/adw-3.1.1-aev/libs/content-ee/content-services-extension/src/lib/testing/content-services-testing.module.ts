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
import { AlfrescoApiService, AlfrescoApiServiceMock, AppConfigService, AppConfigServiceMock, TRANSLATION_PROVIDER, TranslationMock, TranslationService } from '@alfresco/adf-core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';

@NgModule({
    imports: [NoopAnimationsModule, RouterTestingModule, HttpClientModule, TranslateModule.forRoot(), StoreModule.forRoot({})],
    providers: [
        TranslateStore,
        TranslateService,
        { provide: AlfrescoApiService, useClass: AlfrescoApiServiceMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        { provide: TranslationService, useClass: TranslationMock },
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'content-services-extension',
                source: 'assets',
            },
        },
    ],
})
export class ContentServicesTestingModule {}
