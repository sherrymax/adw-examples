/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { LibrariesPage } from './file-libraries/libraries.page';

interface RequestDirectAccessUrlResponseBody {
    entry: {
        contentUrl: string;
        attachment: boolean;
        expiryTime: string;
    };
}

export class LibraryPage extends LibrariesPage {

    constructor(page: Page, libraryId: string) {
        super(page, `libraries/${libraryId}`);
    }

    async downloadLibraryAndGetResponseBody(libraryTitle: string): Promise<RequestDirectAccessUrlResponseBody> {
        await this.dataTable.getRowByName(libraryTitle).click();
        const [response] = await Promise.all([
            this.page.waitForResponse(/request-direct-access-url/),
            this.librariesHeader.getButtonLocatorForOption('Download').click()
        ]);

        return JSON.parse((await response.body()).toString());
    }
}
