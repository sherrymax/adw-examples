/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Column, DataTableBuilder, DataTableItem } from '@alfresco/adf-testing';
import { browser, protractor } from 'protractor';
import { NameCustomColumn } from '../custom-columns/name-custom-column';

export class SharedFilesPage {
    columnNames = {
        name: 'Name',
        location: 'Location',
        size: 'Size',
        modified: 'Modified',
        modifiedBy: 'Modified by',
        sharedBy: 'Shared by',
    };

    defaultColumns = [
        { columnName: this.columnNames.location, columnType: 'text' } as Column,
        { columnName: this.columnNames.size, columnType: 'text' } as Column,
        { columnName: this.columnNames.modified, columnType: 'date' } as Column,
        {
            columnName: this.columnNames.modifiedBy,
            columnType: 'text',
        } as Column,
        { columnName: this.columnNames.sharedBy, columnType: 'text' } as Column,
        new NameCustomColumn(this.columnNames.name),
    ];

    datatable: DataTableItem = new DataTableBuilder().createDataTable(this.defaultColumns);

    async selectRowByName(contentName: string): Promise<void> {
        await this.datatable.selectRow(this.columnNames.name, contentName);
    }

    async rightClickOnRowByName(contentName: string): Promise<void> {
        await this.waitForFirstRow();
        await this.datatable.rightClickOnRow(this.columnNames.name, contentName);
    }

    async waitForFirstRow(): Promise<void> {
        await this.datatable.waitForFirstRow();
    }

    async clickAndEnterOnRowByName(contentName: string): Promise<void> {
        await this.datatable.clickAndEnterOnRow(this.columnNames.name, contentName);
    }

    async checkRowIsSelected(contentName: string): Promise<void> {
        await this.datatable.checkRowIsSelected(this.columnNames.name, contentName);
    }

    async checkRowIsNotSelected(contentName: string): Promise<void> {
        await this.datatable.checkRowIsNotSelected(this.columnNames.name, contentName);
    }

    async selectRowsWithKeyboard(...contentNames: string[]): Promise<void> {
        await browser.actions().sendKeys(protractor.Key.COMMAND).perform();
        for (const name of contentNames) {
            await this.datatable.selectRow(this.columnNames.name, name);
            await this.checkRowIsSelected(name);
        }
        await browser.actions().sendKeys(protractor.Key.NULL).perform();
    }

}
