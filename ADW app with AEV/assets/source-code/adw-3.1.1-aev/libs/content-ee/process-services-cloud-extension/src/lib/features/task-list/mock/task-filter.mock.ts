/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TaskFilterCloudModel, TaskListCloudSortingModel, TaskQueryCloudRequestModel } from '@alfresco/adf-process-services-cloud';

export const fakeTaskFilter: TaskFilterCloudModel = new TaskFilterCloudModel({
    id: 'mock-id',
    name: 'fakeName',
    key: 'filter',
    icon: '',
    index: 1,
    appName: 'fake-appName',
    status: '',
    sort: 'createdDate',
    assignee: '',
    order: 'ASC',
    owner: '',
    processDefinitionId: '',
    processInstanceId: '',
    createdDate: new Date(),
    dueDate: new Date(),
    taskName: '',
    taskId: '',
    parentTaskId: '',
    priority: 2,
    standalone: true,
    lastModifiedFrom: new Date(),
    lastModifiedTo: new Date(),
    _dueDateFrom: new Date().toISOString(),
    _dueDateTo: new Date().toISOString(),
    completedBy: '',
});

export const fakeTaskFilters: TaskFilterCloudModel[] = [fakeTaskFilter];

export const fakeEditTaskFilter = {
    'adf-edit-task-filter': {
        filterProperties: ['status', 'assignee', 'sort', 'order', 'taskName', 'priority', 'processDefinitionName', 'dueDate', 'completedBy', 'assignment'],
        sortProperties: ['id', 'name', 'createdDate', 'priority', 'processDefinitionId', 'dueDate'],
        actions: ['save', 'saveAs', 'delete'],
    },
};

export const fakeTaskCloudFilters = <TaskFilterCloudModel[]> [
    {
        name: 'MY_TASKS',
        id: '1',
        key: 'my-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'ASSIGNED',
        order: 'DESC'
    },
    {
        name: 'QUEUED_TASKS',
        id: '2',
        key: 'queued-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'CREATED',
        order: 'DESC'
    },
    {
        name: 'COMPLETED_TASKS',
        id: '3',
        key: 'completed-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'COMPLETED',
        order: 'DESC'
    }
];

export const myTasksQueryRequestMock = new TaskQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: undefined,
    assignee: undefined,
    claimedDate: undefined,
    createdDate: undefined,
    createdFrom: undefined,
    createdTo: undefined,
    description: undefined,
    dueDate: undefined,
    lastModifiedFrom: undefined,
    lastModifiedTo: undefined,
    dueDateFrom: undefined,
    dueDateTo: undefined,
    id: undefined,
    name: undefined,
    owner: undefined,
    parentTaskId: undefined,
    standalone: undefined,
    priority: undefined,
    processDefinitionId: undefined,
    processDefinitionName: undefined,
    processInstanceId: undefined,
    status: 'ASSIGNED',
    completedBy: null,
    maxItems: 25,
    skipCount: 0,
    sorting: [
        new TaskListCloudSortingModel({ orderBy: 'createdDate', direction: 'ASC' })
    ],
    completedFrom: undefined,
    completedTo: undefined,
    completedDate: undefined,
    candidateGroupId: null
});

export const queuedTasksQueryRequestMock = new TaskQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: undefined,
    initiator: undefined,
    id: undefined,
    name: undefined,
    processDefinitionId: undefined,
    processDefinitionName: undefined,
    processDefinitionKey: '',
    status: 'CREATED',
    startDate: undefined,
    businessKey: undefined,
    lastModified: undefined,
    lastModifiedTo: undefined,
    lastModifiedFrom: undefined,
    startFrom: undefined,
    startTo: undefined,
    completedFrom: undefined,
    completedTo: undefined,
    suspendedFrom: undefined,
    suspendedTo: undefined,
    completedDate: undefined,
    maxItems: 25,
    skipCount: 0,
    sorting: [new TaskListCloudSortingModel({ orderBy: 'createdDate', direction: 'ASC' })],
    candidateGroupId: null,
    completedBy: null,
});

export const completedTasksQueryRequestMock = new TaskQueryCloudRequestModel({
    appName: 'mock-appName',
    appVersion: undefined,
    initiator: undefined,
    id: undefined,
    name: undefined,
    processDefinitionId: undefined,
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
    status: 'COMPLETED',
    startDate: undefined,
    businessKey: undefined,
    lastModified: undefined,
    lastModifiedTo: undefined,
    lastModifiedFrom: undefined,
    startFrom: undefined,
    startTo: undefined,
    completedFrom: undefined,
    completedTo: undefined,
    suspendedFrom: undefined,
    suspendedTo: undefined,
    completedDate: undefined,
    maxItems: 25,
    skipCount: 0,
    sorting: [new TaskListCloudSortingModel({ orderBy: 'createdDate', direction: 'ASC' })],
    candidateGroupId: null,
    completedBy: null,
});
