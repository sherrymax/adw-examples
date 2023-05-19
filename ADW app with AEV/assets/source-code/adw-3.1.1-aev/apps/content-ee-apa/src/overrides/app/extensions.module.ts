/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco-dbp/content-ce/office-services';
import { AiViewModule } from '@alfresco-dbp/content-ee/adf-ai-extension';
import { RecordModule } from '@alfresco-dbp/content-ee/adf-governance';
import { ContentServicesExtensionModule } from '@alfresco-dbp/content-ee/adf-content-services-extension';
import { ProcessServicesCloudExtensionModule } from '@alfresco-dbp/content-ee/adf-process-services-cloud-extension';
import { AcaAboutModule } from '@alfresco-dbp/content-ce/about';
import { AcaSettingsModule } from '@alfresco-dbp/content-ce/settings';
import { ExtensionsOrderExtensionModule } from '@alfresco-dbp/content-ee/extensions-order-extension';
import { CustomModeledExtensionExtensionModule } from '@alfresco-dbp/content-ee/custom-modeled-extension';
import { MicrosoftOfficeOnlineIntegrationExtensionModule } from '@alfresco-dbp/content-ee/microsoft-office-online-integration-extension';
import { environment } from '../environments/environment';
import { AnalyticsModule } from '@alfresco-dbp/shared-lib';

@NgModule({
    imports: [
        AosExtensionModule,
        ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        AiViewModule,
        RecordModule,
        CustomModeledExtensionExtensionModule,
        ProcessServicesCloudExtensionModule,
        ContentServicesExtensionModule,
        ExtensionsOrderExtensionModule,
        MicrosoftOfficeOnlineIntegrationExtensionModule,
        AnalyticsModule
    ],
})
export class AppExtensionsModule {}
