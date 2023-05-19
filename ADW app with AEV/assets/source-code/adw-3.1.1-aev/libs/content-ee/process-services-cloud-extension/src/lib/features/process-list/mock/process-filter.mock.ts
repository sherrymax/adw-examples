/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFilterCloudModel, DateCloudFilterType, ProcessQueryCloudRequestModel, ProcessListCloudSortingModel } from '@alfresco/adf-process-services-cloud';

export const fakeProcessCloudFilter: ProcessFilterCloudModel = new ProcessFilterCloudModel({
    name: 'MOCK_PROCESS_NAME_1',
    id: '1',
    key: 'all-mock-process',
    icon: 'adjust',
    appName: 'mock-appName',
    appVersion: null,
    sort: 'StartDate',
    status: 'RUNNING',
    order: 'DESC',
    index: 2,
    processName: 'process-name',
    processInstanceId: 'processInstanceId',
    initiator: 'user1,user2',
    processDefinitionId: 'processDefinitionId',
    processDefinitionKey: 'processDefinitionKey',
    processDefinitionName: 'processDefinitionName',
    lastModified: null,
    lastModifiedTo: null,
    lastModifiedFrom: null,
    completedDateType: DateCloudFilterType.NO_DATE,
    startedDateType: DateCloudFilterType.NO_DATE,
    _completedFrom: null,
    _completedTo: null,
    startedDate: null,
    _startFrom: null,
    _startTo: null,
});

export const fakeProcessFilters: ProcessFilterCloudModel[] = [fakeProcessCloudFilter];

export const fakeProcessCloudFilters = <ProcessFilterCloudModel[]> [
    {
        name: 'MOCK_PROCESS_NAME_1',
        id: '1',
        key: 'all-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'MOCK_ALL_PROCESSES',
        order: 'DESC'
    },
    {
        name: 'MOCK_PROCESS_NAME_2',
        id: '2',
        key: 'running-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'MOCK_RUNNING_STATUS',
        order: 'DESC'
    },
    {
        name: 'MOCK_PROCESS_NAME_3',
        id: '3',
        key: 'completed-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'MOCK_COMPLETED_STATUS',
        order: 'DESC'
    }
];

export const allProcessesQueryRequestMock = new ProcessQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: '',
    initiator: undefined,
    id: '',
    name: undefined,
    processDefinitionId: '',
    processDefinitionName: undefined,
    processDefinitionKey: '',
    status: 'MOCK_ALL_PROCESSES',
    startDate: undefined,
    businessKey: '',
    lastModified: undefined,
    lastModifiedTo: undefined,
    lastModifiedFrom: undefined,
    startFrom: undefined,
    startTo: undefined,
    completedFrom: undefined,
    completedTo: undefined,
    suspendedFrom: undefined,
    suspendedTo: undefined,
    completedDate: '',
    maxItems: 25,
    skipCount: 0,
    sorting: [new ProcessListCloudSortingModel({ orderBy: 'StartDate', direction: 'DESC' })]
});

export const runningProcessesQueryRequestMock = new ProcessQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: '',
    initiator: undefined,
    id: '',
    name: undefined,
    processDefinitionId: '',
    processDefinitionName: undefined,
    processDefinitionKey: '',
    status: 'MOCK_RUNNING_STATUS',
    startDate: undefined,
    businessKey: '',
    lastModified: undefined,
    lastModifiedTo: undefined,
    lastModifiedFrom: undefined,
    startFrom: undefined,
    startTo: undefined,
    completedFrom: undefined,
    completedTo: undefined,
    suspendedFrom: undefined,
    suspendedTo: undefined,
    completedDate: '',
    maxItems: 25,
    skipCount: 0,
    sorting: [new ProcessListCloudSortingModel({ orderBy: 'StartDate', direction: 'DESC' })]
});

export const completedProcessesQueryRequestMock = new ProcessQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: '',
    initiator: undefined,
    id: '',
    name: undefined,
    processDefinitionId: '',
    processDefinitionName: undefined,
    processDefinitionKey: '',
    status: 'MOCK_COMPLETED_STATUS',
    startDate: undefined,
    businessKey: '',
    lastModified: undefined,
    lastModifiedTo: undefined,
    lastModifiedFrom: undefined,
    startFrom: undefined,
    startTo: undefined,
    completedFrom: undefined,
    completedTo: undefined,
    suspendedFrom: undefined,
    suspendedTo: undefined,
    completedDate: '',
    maxItems: 25,
    skipCount: 0,
    sorting: [new ProcessListCloudSortingModel({ orderBy: 'StartDate', direction: 'DESC' })]
});
