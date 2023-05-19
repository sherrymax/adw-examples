/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on, Action } from '@ngrx/store';
import { updateProcessServiceHealth } from '../actions/process-services-health.actions';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';
import { FilterRepresentationModel, TaskDetailsModel, ProcessInstance } from '@alfresco/adf-process-services';
import { ContentLinkModel } from '@alfresco/adf-core';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { TaskDetailsExtActions } from '../task-details-ext-actions-types';
import { ProcessDetailsExtActions } from '../../process-details-ext-actions-types';

export const featureKey = 'processServices';

export interface ProcessServiceExtensionState {
    health: boolean;
    processManagementExpanded: boolean;
    selectedFilter: UserProcessInstanceFilterRepresentation | FilterRepresentationModel;
    attachedContent: ContentLinkModel;
    processFilters: UserProcessInstanceFilterRepresentation[];
    taskFilters: FilterRepresentationModel[];
    selectedTask: TaskDetailsModel;
    selectedProcess: ProcessInstance;
}

export const processServicesExtensionInitialState: ProcessServiceExtensionState = {
    health: false,
    processManagementExpanded: false,
    selectedFilter: undefined,
    attachedContent: undefined,
    processFilters: [],
    taskFilters: [],
    selectedTask: undefined,
    selectedProcess: undefined,
};

const processServicesExtensionReducer = createReducer(
    processServicesExtensionInitialState,
    on(updateProcessServiceHealth, (state, { health }) => ({
        ...state,
        health,
    })),
    on(ProcessServicesExtActions.selectFilterAction, (state, action) => ({
        ...state,
        selectedFilter: action.filter,
    })),
    on(ProcessServicesExtActions.resetSelectedFilterAction, (state) => ({
        ...state,
        selectedFilter: undefined,
    })),
    on(ProcessServicesExtActions.toggleProcessManagement, (state, action) => ({
        ...state,
        processManagementExpanded: action.expanded,
    })),
    on(ProcessServicesExtActions.showAttachedContentPreviewAction, (state, action) => ({
        ...state,
        attachedContent: action.content,
    })),
    on(ProcessServicesExtActions.setProcessFiltersAction, (state, action) => ({
        ...state,
        processFilters: action.filters,
    })),
    on(ProcessServicesExtActions.setTaskFiltersAction, (state, action) => ({
        ...state,
        taskFilters: action.filters,
    })),
    on(TaskDetailsExtActions.setTaskDetails, (state, action) => ({
        ...state,
        selectedTask: new TaskDetailsModel(action.taskDetails),
    })),
    on(TaskDetailsExtActions.resetSelectedTask, (state) => ({
        ...state,
        selectedTask: undefined,
    })),
    on(ProcessDetailsExtActions.setSelectedProcess, (state, action) => ({
        ...state,
        selectedProcess: action.processInstance,
    })),
    on(ProcessDetailsExtActions.resetSelectedProcess, (state) => ({
        ...state,
        selectedProcess: undefined,
    }))
);

export function reducer(state: ProcessServiceExtensionState | undefined, action: Action) {
    return processServicesExtensionReducer(state, action);
}
