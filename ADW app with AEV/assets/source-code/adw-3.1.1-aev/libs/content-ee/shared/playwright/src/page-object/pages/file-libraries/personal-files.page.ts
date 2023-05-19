/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { LibrariesPage } from './libraries.page';

export class PersonalFilesPage extends LibrariesPage {

    private static pageUrl = 'personal-files';

    constructor(page: Page) {
        super(page, PersonalFilesPage.pageUrl);
    }

    async waitForPageLoaded() {
        await this.page.waitForURL(`**/${PersonalFilesPage.pageUrl}`);
    }
}
