/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent, DialogActionsComponent, timeouts } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';
import { AdwDataTableExtensionComponent } from '../adw-data-table-extension.component';
import { AddMemberHeaderDialogComponent } from './add-member-dialog-header.component';

export class AddUserOrGroupDialogComponent extends BaseComponent {
    private static rootElement = 'adw-add-member';

    constructor(page: Page) {
        super(page, AddUserOrGroupDialogComponent.rootElement);
    }

    private dataTableExtension = new AdwDataTableExtensionComponent(this.page);
    private dialogActions = new DialogActionsComponent(this.page);
    private header = new AddMemberHeaderDialogComponent(this.page);

    private searchUserInputLocator = this.getChild('[id="searchInput"]');
    private getOptionFromResultList = (optionName: string) => this.getChild('mat-list-option .adf-result-name', { hasText: optionName });

    async searchAndChoose(memberOrGroup: string): Promise<void> {
        await this.searchUserInputLocator.type(memberOrGroup, { delay: timeouts.typingDelay });
        await this.getOptionFromResultList(memberOrGroup).click();
        await this.dialogActions.getButtonLocatorByText('Select').click();
    }

    async setRoleForMember(member: string, role: string): Promise<void> {
        await this.dataTableExtension.getRoleExpandMenuLocatorFor(member).click();
        await this.dataTableExtension.contextMenu.getOptionByName(role).click();
        await this.dialogActions.getButtonLocatorByText('Add').click();
    }

    async setRoleBulkAction(role: string): Promise<void> {
        await this.header.getSetAllRolesLocator.click();
        await this.dataTableExtension.contextMenu.getOptionByName(role).click();
        await this.dialogActions.getButtonLocatorByText('Add').click();
    }

    async searchAndChooseBulk(memberOrGroup: string): Promise<void> {
        await this.searchUserInputLocator.type(memberOrGroup, { delay: timeouts.typingDelay });
        await this.spinnerWaitForReload();

        const amountOfOptions = await this.getOptionFromResultList(memberOrGroup).count();
        for (let i =0; i<amountOfOptions; i++) {
            await this.getOptionFromResultList(memberOrGroup).nth(i).click();
        }
        await this.dialogActions.getButtonLocatorByText('Select').click();
    }
}
