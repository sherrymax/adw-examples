/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { ProcessInstance } from '@alfresco/adf-process-services';

export const SET_SELECTED_PROCESS = 'SET_SELECTED_PROCESS';
export const LOAD_SELECTED_PROCESS = 'LOAD_SELECTED_PROCESS';
export const RESET_SELECTED_PROCESS = 'RESET_SELECTED_PROCESS';

export const setSelectedProcess = createAction(SET_SELECTED_PROCESS, props<{ processInstance: ProcessInstance }>());
export const loadSelectedProcess = createAction(LOAD_SELECTED_PROCESS, props<{ processInstanceId: string }>());
export const resetSelectedProcess = createAction(RESET_SELECTED_PROCESS);
