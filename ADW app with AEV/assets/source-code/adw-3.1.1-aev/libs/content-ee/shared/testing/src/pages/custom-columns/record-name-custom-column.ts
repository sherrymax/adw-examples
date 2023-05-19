/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Column } from '@alfresco/adf-testing';

export class RecordNameCustomColumn extends Column {
    columnType = 'custom';
    columnName: string;

    constructor(columnName: string) {
        super(columnName, 'custom');
    }

    createLocator(columnValue: string): string {
        return `//div[@data-automation-id="${columnValue}-governance-row"]`;
    }

    getColumnName(): string {
        return this.columnName !== '' ? this.columnName : 'Record Name';
    }
}
