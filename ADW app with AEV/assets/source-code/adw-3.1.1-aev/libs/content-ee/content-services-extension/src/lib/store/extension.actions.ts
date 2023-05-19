/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action } from '@ngrx/store';
import { SiteEntry, Person } from '@alfresco/js-api';

export const ADD_MEMBER = 'ADD_MEMBER';
export const NOTIFICATIONS_RELOAD = 'NOTIFICATIONS_RELOAD';
export class AddMemberAction implements Action {
    readonly type = ADD_MEMBER;
    constructor(public payload: SiteEntry, public members?: Person[]) {}
}

export const MANAGE_MEMBERS = 'MANAGE_MEMBERS';
export class ManageMembersAction implements Action {
    readonly type = MANAGE_MEMBERS;
    constructor(public payload: SiteEntry) {}
}
export class NotificationsReloadAction implements Action {
    readonly type = NOTIFICATIONS_RELOAD;
}
