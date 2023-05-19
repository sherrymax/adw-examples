/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NodeEntry } from '@alfresco/js-api';

export const fakeNode: NodeEntry = <NodeEntry> {
    entry: {
        name: 'Node Action',
        id: 'fake-id',
        isFile: true,
        aspectNames: [],
        allowableOperations: [],
        properties: {},
    },
};
export const fakeRecord: NodeEntry = <NodeEntry> {
    entry: {
        name: 'Node Action',
        id: 'fake-id',
        isFile: true,
        aspectNames: ['rma:record'],
        properties: {},
        allowableOperations: [],
    },
};
