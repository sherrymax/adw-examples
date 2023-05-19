/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { ExtensionColumnPreset } from '../../models/extension-column-preset.interface';
import { selectProcessesWithVariableEntities } from './process-definitions.selector';

interface VariableColumnCustomData {
    variableDefinitionsPayload: string[];
    assignedVariableDefinitionIds: string[];
    columnType: 'process-variable-column';
}

export const selectProcessDefinitionsVariableColumnsSchema = createSelector(
    selectProcessesWithVariableEntities,
    (processes) => {
        const variableMap: {
            [variableDisplayName: string]: {
                key: string;
                displayName: string;
                customData: VariableColumnCustomData;
            };
        } = {};

        processes.forEach(process => {
            const processKey = process.key;
            const processVariables = process.variableDefinitions;

            processVariables
                .filter(variable => variable.display)
                .forEach((variable) => {
                    const assignedVariableDefinitionPayload = `${processKey}/${variable.name}`;

                    if (variableMap[variable.displayName]) {
                        const variableObject = variableMap[variable.displayName];
                        variableObject.customData.variableDefinitionsPayload.push(assignedVariableDefinitionPayload);

                        variableObject.customData.assignedVariableDefinitionIds.push(variable.id);
                    } else {
                        variableMap[variable.displayName] = {
                            key: variable.displayName,
                            displayName: variable.displayName,
                            customData: {
                                columnType: 'process-variable-column',
                                variableDefinitionsPayload: [assignedVariableDefinitionPayload],
                                assignedVariableDefinitionIds: [variable.id],
                            },
                        };
                    }
                });
        });

        return Object.values(variableMap).map<ExtensionColumnPreset>((variable) => ({
            id: `variable_column_${variable.displayName}`,
            key: `variablesMap.${variable.displayName}.value`,
            title: variable.displayName,
            type: 'text',
            draggable: true,
            sortable: false,
            desktopOnly: true,
            isHidden: true,
            class: 'adf-ellipsis-cell',
            customData: variable.customData,
        }) as ExtensionColumnPreset);
    }
);
