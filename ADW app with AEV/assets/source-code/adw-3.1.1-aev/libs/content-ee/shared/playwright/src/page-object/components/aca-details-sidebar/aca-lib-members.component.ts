/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';

export class AcaLibMembersComponent extends BaseComponent {
    private static rootElement = 'adw-info-drawer-member-list';

    constructor(page: Page) {
        super(page, AcaLibMembersComponent.rootElement);
    }

    public getTitleLocator = this.getChild('adf-toolbar-title');
    public getEmailsListOfMembersLocator = this.getChild('span.adf-user-email-column');
}
