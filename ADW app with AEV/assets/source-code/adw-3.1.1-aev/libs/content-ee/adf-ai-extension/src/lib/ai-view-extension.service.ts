/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, StorageService } from '@alfresco/adf-core';
@Injectable({
    providedIn: 'root',
})
export class AiViewExtensionService {
    constructor(private appConfigService: AppConfigService, private storage: StorageService) {}

    isSmartViewerEnabled(): boolean {
        return this.isExtensionEnabled() && this.storage.getItem('ai') === 'true';
    }

    isExtensionEnabled(): boolean {
        const plugins = this.appConfigService.get<any>('plugins', {});
        return plugins.aiService === true || plugins.aiService === 'true';
    }
}
