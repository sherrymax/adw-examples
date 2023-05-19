/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { MicrosoftOnlineEffects } from './store/effects/microsoft-online.effects';
import { NgModule } from '@angular/core';
import { MicrosoftOnlineService, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from './components/msal';
import { AppConfigService, CoreModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { WindowRef } from './components/resume-active-session/window-ref';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { ContentModule } from '@alfresco/adf-content-services';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeActiveSessionComponent } from './components/resume-active-session/resume-active-session.component';
import { EndSessionDialogComponent } from './components/end-session-dialog/end-session-dialog.component';
import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import {
    isActiveMicrosoftSession,
    isExcelFile,
    isMicrosoftOnlinePluginEnabled,
    isOwnerOfMicrosoftSession,
    isPowerPointFile,
    isWordFile,
} from './rules/office-online-integration.rules';
import { isWriteLocked } from '@alfresco/aca-shared/rules';
import { MaterialModule } from './material.module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { A11yModule } from '@angular/cdk/a11y';
import { SharedModule } from '@alfresco/aca-shared';
import { CommonModule } from '@angular/common';
import { CreateDocumentDialogComponent } from './components/create-document-dialog/create-document-dialog.component';
import { CreateDocumentExtensionEffects } from './store/effects/create-document.effects';

export function MSALInterceptorConfigFactory() {
    return {
        popUp: true,
        consentScopes: ['user.read', 'openid', 'profile', 'Files.ReadWrite.All'],
        unprotectedResources: [],
        protectedResourceMap: [['https://graph.microsoft.com/v1.0/me', ['user.read']]],
        extraQueryParameters: {},
    };
}

export function MSALInstanceFactory(): PublicClientApplication {
    return new PublicClientApplication({ auth: { clientId: '' } });
}

const microsoftEffects = [MicrosoftOnlineEffects, CreateDocumentExtensionEffects];

@NgModule({
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'microsoft-office-online-integration-extension',
                source: 'assets/adf-microsoft-office-online-integration-extension',
            },
        },
        provideExtensionConfig(['microsoft-office-online-integration-extension.json']),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'never' } },
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory,
            deps: [AppConfigService],
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory,
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        MicrosoftOnlineService,
        WindowRef,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        ExtensionsModule,
        SharedModule.forRoot(),
        CoreModule,
        EffectsModule.forFeature(microsoftEffects),
        ContentModule,
        TranslateModule,
        MaterialModule,
        MatRadioModule,
        MatTooltipModule,
        A11yModule,
    ],
    declarations: [ResumeActiveSessionComponent, EndSessionDialogComponent, CreateDocumentDialogComponent],
    exports: [ResumeActiveSessionComponent, EndSessionDialogComponent, CreateDocumentDialogComponent],
})
export class MicrosoftOfficeOnlineIntegrationExtensionModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'content-services.components.resume-active-session': ResumeActiveSessionComponent,
        });

        extensions.setEvaluators({
            'app.content-services.isWordFile': isWordFile,
            'app.content-services.isPowerPointFile': isPowerPointFile,
            'app.content-services.isExcelFile': isExcelFile,
            'app.content-services.isActiveMicrosoftSession': isActiveMicrosoftSession,
            'app.content-services.isOwnerOfMicrosoftSession': isOwnerOfMicrosoftSession,
            'app.content-services.isMicrosoftOnlinePluginEnabled': isMicrosoftOnlinePluginEnabled,
            'app.content-services.isWriteLocked': isWriteLocked,
        });
    }
}
