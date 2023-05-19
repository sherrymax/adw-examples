/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterProcessRepresentationModel } from '@alfresco/adf-process-services';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';

export const mockProcessFilter = new FilterProcessRepresentationModel({
    name: 'Running',
    appId: '22',
    id: 333,
    recent: true,
    icon: 'glyphicon-random',
    filter: { sort: 'created-desc', name: '', state: 'running' },
});

export const fakeProcessFilters = [
    new UserProcessInstanceFilterRepresentation({
        name: 'FakeRunningProcess',
        icon: 'glyphicon-align-left',
        id: 10,
        filter: { sort: 'created-desc', name: '', state: 'running' },
    }),
    new UserProcessInstanceFilterRepresentation({
        name: 'FakeCompletedProcess',
        icon: 'glyphicon-ok-sign',
        id: 11,
        filter: { sort: 'created-desc', name: '', state: 'completed' },
    }),
    new UserProcessInstanceFilterRepresentation({
        name: 'FakeAllProcess',
        icon: 'glyphicon-inbox',
        id: 12,
        filter: { sort: 'created-desc', name: '', state: 'all' },
    }),
];

export const fakeEditProcessFilter = {
    'adf-edit-task-filter': {
        filterProperties: ['status', 'sort', 'order', 'processName', 'processDefinitionName', 'completedDateRange', 'startedDateRange'],
        sortProperties: ['name', 'status', 'startDate', 'initiator', 'processDefinitionName'],
        actions: ['save', 'saveAs', 'delete'],
    },
};
