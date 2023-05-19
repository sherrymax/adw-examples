/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent} from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';

export class AddMemberHeaderDialogComponent extends BaseComponent {
    private static rootElement = 'mat-card-header';

    constructor(page: Page) {
        super(page, AddMemberHeaderDialogComponent.rootElement);
    }

    public getSetAllRolesLocator = this.getChild('adw-role-selector');
}
