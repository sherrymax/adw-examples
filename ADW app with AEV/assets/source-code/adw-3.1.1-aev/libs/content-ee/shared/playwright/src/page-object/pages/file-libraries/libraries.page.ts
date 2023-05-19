/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SideNavbarComponent, BasePage, DataTableComponent } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';
import { AcaInfoDrawerComponent, AddUserOrGroupDialogComponent } from '../../components';
import { LibrariesToolbarComponent } from '../../components/libraries-header/aca-toolbar.component';

export abstract class LibrariesPage extends BasePage {

    constructor(page: Page, pageUrl: string, urlRequest?: RegExp) {
        super(page, pageUrl, urlRequest);
    }

    public sideNavbar = new SideNavbarComponent(this.page, 'content');
    public dataTable = new DataTableComponent(this.page);
    public detailsSidebar = new AcaInfoDrawerComponent(this.page);
    public librariesHeader = new LibrariesToolbarComponent(this.page);
    public addUserOrGroupDialog = new AddUserOrGroupDialogComponent(this.page);

    async openDetailsForLibrary(libraryTitle: string): Promise<void> {
        await this.dataTable.goThroughPagesLookingForRowWithName(libraryTitle);
        await this.dataTable.getRowByName(libraryTitle).click();
        await this.librariesHeader.getButtonLocatorForOption('View Details').click();
    }
}
