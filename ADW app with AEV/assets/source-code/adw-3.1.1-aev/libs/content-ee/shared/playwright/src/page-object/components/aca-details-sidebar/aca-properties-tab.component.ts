/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent, DropdownStandardComponent } from '@alfresco-dbp/shared-playwright';
import { SiteBodyCreate } from '@alfresco/js-api';
import { Page } from '@playwright/test';

export class AcaLibPropertiesTabComponent extends BaseComponent {
    private static rootElement = 'app-library-metadata-tab';

    constructor(page: Page) {
        super(page, AcaLibPropertiesTabComponent.rootElement);
    }

    private contextMenuActions = new DropdownStandardComponent(this.page);
    private getPrivacyExpandArrowLocator = this.getChild('mat-select:visible .mat-select-arrow-wrapper');
    private getActionButtonLocator = (actionTitle: string) => this.getChild('mat-card-actions span', { hasText: actionTitle });

    async updateLibVisibility(visibility: SiteBodyCreate.VisibilityEnum): Promise<void> {
        await this.getActionButtonLocator('Edit').click();
        await this.getPrivacyExpandArrowLocator.click();
        await this.contextMenuActions.getOptionLocator(visibility).click();
        await this.getActionButtonLocator('Update').click();
    }
}
