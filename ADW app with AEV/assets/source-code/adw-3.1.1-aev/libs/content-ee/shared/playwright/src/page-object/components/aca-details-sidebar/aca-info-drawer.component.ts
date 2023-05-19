/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AdfInfoDrawer } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';
import { AcaLibMembersComponent } from './aca-lib-members.component';
import { AcaLibPropertiesTabComponent } from './aca-properties-tab.component';

export class AcaInfoDrawerComponent extends AdfInfoDrawer {
    constructor(page: Page) {
        super(page);
    }

    public membersTab = new AcaLibMembersComponent(this.page);
    public propertiesTab = new AcaLibPropertiesTabComponent(this.page);
}
