/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DataTableBuilder, DataTableComponentPage, DataTableItem } from '@alfresco/adf-testing';
import { browser, protractor } from 'protractor';
import { SearchResultsCustomColumn } from '../custom-columns/search-results-custom-column';

export class SearchResultsPage {
    defaultColumns = [new SearchResultsCustomColumn('Name')];
    searchResultsColumn = 'Name';

    datatable: DataTableItem = new DataTableBuilder().createDataTable(this.defaultColumns);
    dataTableUtils: DataTableComponentPage = new DataTableComponentPage();

    async selectRowByName(contentName: string): Promise<void> {
        await this.datatable.selectRow(this.searchResultsColumn, contentName);
    }

    async waitForFirstRow(): Promise<void> {
        await this.datatable.waitForFirstRow();
    }

    async rightClickOnRowByName(contentName: string): Promise<void> {
        await this.waitForFirstRow();
        await this.datatable.rightClickOnRow(this.searchResultsColumn, contentName);
    }

    async clickAndEnterOnRowByName(contentName: string): Promise<void> {
        await this.datatable.clickAndEnterOnRow(this.searchResultsColumn, contentName);
    }

    async checkRowIsSelected(contentName: string): Promise<void> {
        await this.datatable.checkRowIsSelected(this.searchResultsColumn, contentName);
    }

    async checkRowIsNotSelected(contentName: string): Promise<void> {
        await this.datatable.checkRowIsNotSelected(this.searchResultsColumn, contentName);
    }

    async selectRowsWithKeyboard(...contentNames: string[]): Promise<void> {
        let option: any;
        await browser.actions().sendKeys(protractor.Key.COMMAND).perform();
        for (const name of contentNames) {
            option = await this.datatable.getRow(this.searchResultsColumn, name);
            await option.click();
            await this.checkRowIsSelected(name);
        }
        await browser.actions().sendKeys(protractor.Key.NULL).perform();
    }
}
