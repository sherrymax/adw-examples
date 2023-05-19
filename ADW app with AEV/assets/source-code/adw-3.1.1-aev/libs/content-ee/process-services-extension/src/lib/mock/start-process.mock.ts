/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';
import { UploadWidgetType } from '../models/process-service.model';

export const fakeProcessDefinition = new ProcessDefinitionRepresentation({
    name: 'fakeProcessDefinitionName',
    id: 'fakeProcessDefinitionId',
});

const userInfo = {
    displayName: 'root',
    id: 'root',
};

export const selectedNodesMock: any[] = [
    {
        id: 'mockId',
        isFile: true,
        isFolder: false,
        name: 'file',
        nodeType: 'node',
        modifiedAt: new Date(),
        modifiedByUser: userInfo,
        createdAt: new Date(),
        createdByUser: userInfo,
    },
    {
        id: 'mockId2',
        isFile: true,
        isFolder: false,
        name: 'file-2',
        nodeType: 'node',
        modifiedAt: new Date(),
        modifiedByUser: userInfo,
        createdAt: new Date(),
        createdByUser: userInfo,
    },
];

export const singleContentUploadWidgets = <UploadWidgetType[]> [
    {
        id: 'upload-widget-id-1',
        type: 'single',
        link: false,
    },
    {
        id: 'upload-widget-id-2',
        type: 'single',
        link: false,
    },
];

export const multipleContentUploadWidgets = <UploadWidgetType[]> [
    {
        id: 'upload-widget-id-1',
        type: 'multiple',
        link: false,
    },
    {
        id: 'upload-widget-id-2',
        type: 'multiple',
        link: false,
    },
];
