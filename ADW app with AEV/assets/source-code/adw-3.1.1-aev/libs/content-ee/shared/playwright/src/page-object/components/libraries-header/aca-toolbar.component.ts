/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AdfToolbarComponent, MatMenuComponent } from '@alfresco-dbp/shared-playwright';
import { Page } from '@playwright/test';

export class LibrariesToolbarComponent extends AdfToolbarComponent {
    constructor(page: Page) {
        super(page);
    }

    public list = new MatMenuComponent(this.page);
    public getButtonLocatorForOption = (optionTitle: string) => this.getChild(`button[title='${optionTitle}']`);
}
