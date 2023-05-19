/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { TaskDetailsModel } from '@alfresco/adf-process-services';
import { UpdateNotification } from '@alfresco/adf-core';

export const SET_SELECTED_TASK = 'SET_SELECTED_TASK';
export const GET_TASK_DETAILS = 'GET_TASK_DETAILS';
export const LOAD_TASK_DETAILS = 'LOAD_TASK_DETAILS';
export const RELOAD_TASK_DETAILS = 'RELOAD_TASK_DETAILS';
export const UPDATE_TASK_DETAILS = 'UPDATE_TASK_DETAILS';
export const RESET_TASK_DETAILS = 'RESET_TASK_DETAILS';
export const NAVIGATE_TO_TASK_DETAILS = 'NAVIGATE_TO_TASK_DETAILS';

export const updateTaskDetails = createAction(UPDATE_TASK_DETAILS, props<{ taskId: string; taskDetails: TaskDetailsModel; updatedNotification: UpdateNotification }>());
export const loadTaskDetails = createAction(LOAD_TASK_DETAILS, props<{ taskId: string }>());
export const reloadTaskDetails = createAction(RELOAD_TASK_DETAILS, props<{ taskId: string }>());
export const getTaskDetails = createAction(GET_TASK_DETAILS);
export const setTaskDetails = createAction(SET_SELECTED_TASK, props<{ taskDetails: TaskDetailsModel }>());
export const resetSelectedTask = createAction(RESET_TASK_DETAILS);
export const navigateToTaskDetails = createAction(NAVIGATE_TO_TASK_DETAILS, props<{ appId: number; selectedTask: TaskDetailsModel }>());
