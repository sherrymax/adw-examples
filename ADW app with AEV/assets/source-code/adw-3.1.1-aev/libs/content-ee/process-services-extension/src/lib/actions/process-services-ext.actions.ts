/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';
import { ContentLinkModel } from '@alfresco/adf-core';
import { FilterRepresentationModel, ProcessInstance } from '@alfresco/adf-process-services';

export const PROCESS_DISCOVERY_REPO = 'PROCESS_DISCOVERY_REPO';
export const NAVIGATE_TO_TASKS = 'NAVIGATE_TO_TASKS';
export const NAVIGATE_TO_DEFAULT_TASK_FILTER = 'NAVIGATE_TO_DEFAULT_TASK_FILTER';
export const NAVIGATE_TO_PROCESSES = 'NAVIGATE_TO_PROCESSES';
export const PROCESS_DETAILS = 'PROCESS_DETAILS';
export const TOGGLE_PROCESS_MANAGEMENT = 'TOGGLE_PROCESS_MANAGEMENT';
export const SELECT_FILTER = 'SELECT_FILTER';
export const RESET_SELECTED_FILTER = 'RESET_SELECTED_FILTER';
export const SHOW_ATTACHED_CONTENT_PREVIEW = 'SHOW_ATTACHED_CONTENT_PREVIEW';
export const SET_PROCESS_FILTERS = 'SET_PROCESS_FILTERS';
export const SET_TASK_FILTERS = 'SET_TASK_FILTERS';
export const LOAD_FILTERS = 'LOAD_FILTERS';
export const LOAD_TASK_FILTERS = 'LOAD_TASK_FILTERS';
export const LOAD_PROCESS_FILTERS = 'LOAD_PROCESS_FILTERS';

export const serviceRunningAction = createAction(PROCESS_DISCOVERY_REPO, props<{ running: boolean }>());

export interface FilterParams {
    appId: number;
    filterId?: number;
}

export const navigateToTasksAction = createAction(NAVIGATE_TO_TASKS, props<FilterParams>());

export const navigateToProcessesAction = createAction(NAVIGATE_TO_PROCESSES, props<FilterParams>());

export const processDetailsAction = createAction(PROCESS_DETAILS, props<{ appId: number; processInstance: ProcessInstance }>());

export const toggleProcessManagement = createAction(TOGGLE_PROCESS_MANAGEMENT, props<{ expanded: boolean }>());

export const selectFilterAction = createAction(
    SELECT_FILTER,
    props<{
        filter: UserProcessInstanceFilterRepresentation | FilterRepresentationModel;
    }>()
);

export const resetSelectedFilterAction = createAction(RESET_SELECTED_FILTER, props<any>());

export const navigateToDefaultTaskFilter = createAction(NAVIGATE_TO_DEFAULT_TASK_FILTER, props<any>());

export const showAttachedContentPreviewAction = createAction(SHOW_ATTACHED_CONTENT_PREVIEW, props<{ content: ContentLinkModel }>());

export const loadFiltersAction = createAction(LOAD_FILTERS, props<any>());

export const loadTaskFiltersAction = createAction(LOAD_TASK_FILTERS, props<any>());

export const loadProcessFiltersAction = createAction(LOAD_PROCESS_FILTERS, props<any>());

export const setProcessFiltersAction = createAction(SET_PROCESS_FILTERS, props<{ filters: UserProcessInstanceFilterRepresentation[] }>());

export const setTaskFiltersAction = createAction(SET_TASK_FILTERS, props<{ filters: FilterRepresentationModel[] }>());
