/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    BaseComponent,
    DataTableComponent,
    MatDialogContainer,
    MatSelectComponent,
    SnackBarComponent,
} from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';

const TAB_TITLES = {
    Properties: 'Properties',
    Members: 'Members',
    Groups: 'Groups',
    Pending: 'Pending'
};

const URL_REQUESTS = {
    Properties: / /,
    Members: /sites\/.+\/members/,
    Groups: /group-members/,
    Pending: /site-membership-requests/,
};

export enum Roles {
    Manager = 'Manager',
    Contributor = 'Contributor',
    Consumer = 'Consumer',
    Collaborator = 'Collaborator'
}

export class AdwMemberManagerTabs extends BaseComponent {
    private static rootElement = '[data-automation-id="adw-member-manager-tabs"]';

    constructor(page: Page) {
        super(page, AdwMemberManagerTabs.rootElement);
    }

    private matSelect = new MatSelectComponent(this.page);
    private dataTable = new DataTableComponent(this.page);
    private snackBar = new SnackBarComponent(this.page);
    private rejectMemberRequest = new MatDialogContainer(this.page);

    private getTabLocatorByTitle = (title: keyof typeof TAB_TITLES) => this.getChild('mat-tab-header [role="tab"] div', { hasText: title });

    async navigateToTab(title: keyof typeof TAB_TITLES): Promise<void> {
        await Promise.all([
            this.getTabLocatorByTitle(title).click(),
            this.page.waitForResponse(URL_REQUESTS[title])
        ]);
        await this.spinnerWaitForReload();
    }

    async approveMembership(user: string, role: Roles): Promise<void> {
        await this.dataTable.getButtonRoleExpandMenuLocatorForUser(user).click();
        await this.matSelect.getOptionByName(role).click();
        await this.dataTable.getButtonByNameForSpecificRow(user, 'APPROVE').click();
        await this.snackBar.getByMessageLocator('Member added to library').waitFor();
    }

    async rejectMembership(user: string): Promise<void> {
        await this.dataTable.getButtonByNameForSpecificRow(user, 'REJECT').click();
        await this.rejectMemberRequest.getDialogTitleLocator.waitFor();
        await this.rejectMemberRequest.getButtonByNameLocator('REJECT').click();
        await this.snackBar.getByMessageLocator('Membership request rejected').waitFor();
    }
}
