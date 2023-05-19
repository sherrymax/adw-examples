/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { NodeEntry } from '@alfresco/js-api';
import { ProcessDefinitionRepresentation, ProcessInstance } from '@alfresco/adf-process-services';

export const START_PROCESS = 'START_PROCESS';
export const SHOW_NOTIFICATION_ON_START_PROCESS = 'SHOW_NOTIFICATION_ON_START_PROCESS';

export interface StartProcessPayload {
    payload: {
        processDefinition: ProcessDefinitionRepresentation;
        selectedNodes?: NodeEntry[];
    };
}

export interface NotificationPayload {
    appId: number;
    processInstanceName: string;
    processInstance: ProcessInstance;
}

export const startProcessAction = createAction(START_PROCESS, props<StartProcessPayload>());

export const showNotificationOnStartProcessAction = createAction(SHOW_NOTIFICATION_ON_START_PROCESS, props<NotificationPayload>());
