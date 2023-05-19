/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Column, DataTableBuilder, DataTableItem } from '@alfresco/adf-testing';
import { NameCustomColumn } from '../custom-columns/name-custom-column';

export class TrashPage {
    columnNames = {
        name: 'Name',
        location: 'Location',
        size: 'Size',
        deleted: 'Deleted',
    };

    defaultColumns = [
        { columnName: this.columnNames.location, columnType: 'text' } as Column,
        { columnName: this.columnNames.size, columnType: 'text' } as Column,
        {
            columnName: this.columnNames.deleted,
            columnType: 'text',
        } as Column,
        new NameCustomColumn(this.columnNames.name),
    ];

    datatable: DataTableItem = new DataTableBuilder().createDataTable(this.defaultColumns);

    async selectRowByName(contentName: string): Promise<void> {
        await this.datatable.selectRow(this.columnNames.name, contentName);
    }

    async checkRowIsSelected(contentName: string): Promise<void> {
        await this.datatable.checkRowIsSelected(this.columnNames.name, contentName);
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

    async selectRowWithKeyboard(contentNames: string): Promise<void> {
        await this.datatable.selectRowWithKeyboard(this.columnNames.name, contentNames);
        await this.checkRowIsSelected(contentNames);
    }
}
