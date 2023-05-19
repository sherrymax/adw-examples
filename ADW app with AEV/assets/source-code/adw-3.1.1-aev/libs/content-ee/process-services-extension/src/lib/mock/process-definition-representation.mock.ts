/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';

export const createProcessDefinitionRepresentation = (processData: Partial<ProcessDefinitionRepresentation> = {}) => {
    const randomCharacters = (Math.random() + 1).toString(36).substring(2);

    return {
        id: `id_${randomCharacters}`,
        name: `name_${randomCharacters}`,
        category: `category_${randomCharacters}`,
        description: '',
        version: 1,
        key: `key_${randomCharacters}`,
        deploymentId: '1',
        hasStartForm: false,
        metaDataValues: [],
        tenantId: '1',
        ...processData
    };
};

export const createProcessesDefinitionRepresentationMock = (): ProcessDefinitionRepresentation[] => [
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
    createProcessDefinitionRepresentation(),
];
