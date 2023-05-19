/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessInstance } from '@alfresco/adf-process-services';

export const fakeProcessInstances = {
    size: 2,
    total: 2,
    start: 0,
    data: [
        {
            id: '1',
            name: 'Process 773443333',
            businessKey: null,
            processDefinitionId: 'process:5:7507',
            tenantId: 'tenant_1',
            started: '2015-11-09T12:36:14.184+0000',
            ended: null,
            startedBy: {
                id: 3,
                firstName: 'tenant2',
                lastName: 'tenantLastName',
                email: 'tenant2@tenant',
            },
            processDefinitionName: 'Fake Process Name',
            processDefinitionDescription: null,
            processDefinitionKey: 'process',
            processDefinitionCategory: 'http://www.activiti.org/processdef',
            processDefinitionVersion: 1,
            processDefinitionDeploymentId: '2540',
            graphicalNotationDefined: true,
            startFormDefined: false,
            suspended: false,
            variables: [],
        },
        {
            id: '2',
            name: 'Process 382927392',
            businessKey: null,
            processDefinitionId: 'process:5:7507',
            tenantId: 'tenant_1',
            started: '2018-01-10T17:02:22.597+0000',
            ended: null,
            startedBy: {
                id: 3,
                firstName: 'tenant2',
                lastName: 'tenantLastName',
                email: 'tenant2@tenant',
            },
            processDefinitionName: 'Fake Process Name',
            processDefinitionDescription: null,
            processDefinitionKey: 'process',
            processDefinitionCategory: 'http://www.activiti.org/processdef',
            processDefinitionVersion: 1,
            processDefinitionDeploymentId: '2540',
            graphicalNotationDefined: true,
            startFormDefined: false,
            suspended: false,
            variables: [],
        },
    ],
};

export const fakeRunningProcessInstance = new ProcessInstance({
    id: '1',
    name: 'fakeName',
    processDefinitionId: 'process:5:7507',
    processDefinitionKey: 'process',
    processDefinitionName: 'Fake Process Name',
    processDefinitionDescription: 'fake  process description',
    category: null,
    businessKey: 'fake business key',
    started: '2015-11-09T12:36:14.184+0000',
    startedBy: {
        id: 3,
        firstName: 'tenant2',
        lastName: 'tenantLastName',
        email: 'tenant2@tenant',
    },
});
