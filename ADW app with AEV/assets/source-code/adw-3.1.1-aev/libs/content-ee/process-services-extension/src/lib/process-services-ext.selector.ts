/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ProcessServiceExtensionState } from './store/reducers/process-services.reducer';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';

const defaultTaskFilterName = 'My Tasks';
const defaultProcessFilterName = 'Running';

export const selectProcessServiceExt = createFeatureSelector<ProcessServiceExtensionState>('processServices');

export const isProcessManagementExpanded = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.processManagementExpanded);

export const getSelectedFilter = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.selectedFilter);

export const getAttachedContent = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.attachedContent);

export const getProcessFilters = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.processFilters);

export const getTaskFilters = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.taskFilters);

export const getDefaultTaskFilter = createSelector(getTaskFilters, (taskFiltersState: FilterRepresentationModel[]) => {
    const defaultFilter = taskFiltersState.find((filter: FilterRepresentationModel) => filter.name === defaultTaskFilterName);
    return defaultFilter ? defaultFilter : taskFiltersState[0];
});

export const getDefaultProcessFilter = createSelector(getProcessFilters, (processFiltersState: UserProcessInstanceFilterRepresentation[]) => {
    const defaultFilter = processFiltersState.find((filter) => filter.name === defaultProcessFilterName);
    return defaultFilter ? defaultFilter : processFiltersState[0];
});

export const getSelectedTask = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.selectedTask);

export const getSelectedProcess = createSelector(selectProcessServiceExt, (processServiceExt) => processServiceExt.selectedProcess);

export const getTaskFilterById = createSelector(getTaskFilters, (taskFiltersState: FilterRepresentationModel[], props: { id: number }) => {
    const result = taskFiltersState.find((filter: FilterRepresentationModel) => filter.id === props.id);
    return result;
});

export const getProcessFilterById = createSelector(getProcessFilters, (processFiltersState: UserProcessInstanceFilterRepresentation[], props: { id: number }) => {
    const result = processFiltersState.find((filter) => filter.id === props.id);
    return result;
});
