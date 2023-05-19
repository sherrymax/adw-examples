/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';
import { selectProcessDefinitionsVariableColumnsSchema } from './datatable-columns-schema.selector';

interface ProcessVariableDefinition {
    id: string;
    name: string;
    type: string;
    required: boolean;
    display: boolean;
    displayName?: string;
}

const getProcessVariable = (variable: Partial<ProcessVariableDefinition> = {}): ProcessVariableDefinition => {
    return {
        id: 'id',
        name: 'name',
        type: 'text',
        required: false,
        display: false,
        ...variable
    };
};

const getProcessWithVariables = (variables: ProcessVariableDefinition[]): ProcessDefinitionCloud => {
    return {
        id: 'id',
        appName: 'appName',
        key: 'processKey',
        appVersion: 1,
        category: '',
        description: '',
        name: 'name',
        version: 1,
        variableDefinitions: variables
    };
};

describe('selectProcessDefinitionsVariableColumnsSchema', () => {
    it('should return empty array if no variable definitions are returned', () => {
        expect(selectProcessDefinitionsVariableColumnsSchema.projector([])).toEqual([]);
    });

    it('should not create column schema if variables are not set for displaying', () => {
        const variable1 = getProcessVariable();
        const variable2 = getProcessVariable();
        const process = getProcessWithVariables([variable1, variable2]);

        expect(selectProcessDefinitionsVariableColumnsSchema.projector([process])).toEqual([]);
    });

    it('should merge variables into one column if both variables have the same display name', () => {
        const variable1 = getProcessVariable({
            id: 'id1',
            display: true,
            displayName: 'Col',
            name: 'variableName1'
        });

        const variable2 = getProcessVariable({
            id: 'id2',
            display: true,
            displayName: 'Col',
            name: 'variableName2'
        });

        const process = getProcessWithVariables([variable1, variable2]);

        const columnsSchema = selectProcessDefinitionsVariableColumnsSchema.projector([process]);

        const expectedColumnSchema = [{
            id: 'variable_column_Col',
            key: 'variablesMap.Col.value',
            title: 'Col',
            type: 'text',
            draggable: true,
            sortable: false,
            desktopOnly: true,
            isHidden: true,
            class: 'adf-ellipsis-cell',
            customData: {
                assignedVariableDefinitionIds: ['id1', 'id2'],
                columnType: 'process-variable-column',
                variableDefinitionsPayload: ['processKey/variableName1', 'processKey/variableName2'],
            },
        }];

        expect(columnsSchema.length).toBe(1);
        expect(columnsSchema).toEqual(expectedColumnSchema as any);
    });
});
