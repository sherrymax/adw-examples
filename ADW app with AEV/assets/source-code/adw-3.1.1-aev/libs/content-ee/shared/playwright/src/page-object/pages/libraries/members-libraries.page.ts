/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SideNavbarComponent, BasePage, MatDialogContainer } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';
import { AdwMemberManagerTabs } from '../../components';
import { AdwDataTableExtensionComponent } from '../../components/adw-data-table-extension.component';

export class MembersLibrariesPage extends BasePage {

    constructor(page: Page, libraryName: string) {
        super(page, `${libraryName}/members/libraries`);
    }

    public sideNavbar = new SideNavbarComponent(this.page, 'content');
    public memberManagerTabs = new AdwMemberManagerTabs(this.page);
    public datatable = new AdwDataTableExtensionComponent(this.page);
    private confirmationDialog = new MatDialogContainer(this.page);

    async deleteUser(username: string): Promise<void> {
        await this.datatable.getButtonByNameForSpecificRow(username, 'delete').click();
        await this.confirmationDialog.getButtonByNameLocator('Yes').click();
    }
}
