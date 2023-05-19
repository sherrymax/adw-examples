/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

const userInfo = {
    displayName: 'root',
    id: 'root',
};

export const mockQueryParams = {
    appName: 'mockApp',
    processDefinitionName: 'mockProcess',
    formKey: 'mock-form-key',
};

export const mockProcessDefinitions: ProcessDefinitionCloud[] = [
    {
        id: '',
        appName: 'mockApp',
        key: '',
        formKey: 'mockForm',
        appVersion: null,
        version: null,
        name: '',
        category: '',
        description: ''
    },
];

export const contentWidgetsMock = [
    {
        id: 'AttachFile1',
        type: 'single',
    },
    {
        id: 'AttachFile2',
        type: 'multiple',
    },
];

export const selectedNodesMock = [
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
