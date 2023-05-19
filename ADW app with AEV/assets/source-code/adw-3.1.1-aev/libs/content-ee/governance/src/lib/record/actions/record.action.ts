/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action } from '@ngrx/store';
import { NodeEntry, Node } from '@alfresco/js-api';
import { DeclareRecord } from '../models/declare-record.model';

export const DECLARE_RECORD_ACTION = 'DECLARE_RECORD_ACTION';

export const ADMIN_DELETE_RECORD = 'ADMIN_DELETE_RECORD';
export const DELETE_RECORD = 'DELETE_RECORD';
export const MOVE_RECORD = 'MOVE_RECORD';
export const REMOVE_REJECTED_WARNING_ACTION = 'REMOVE_REJECTED_WARNING_ACTION';

export class DeclareRecordAction implements Action {
    readonly type = DECLARE_RECORD_ACTION;
    constructor(public payload: DeclareRecord[]) {}
}

export class AdminDeleteRecord implements Action {
    readonly type = ADMIN_DELETE_RECORD;
    constructor(public payload?: Node) {}
}

export class DeleteRecordAction implements Action {
    readonly type = DELETE_RECORD;
    constructor(public payload: Node) {}
}

export class MoveRecordAction implements Action {
    readonly type = MOVE_RECORD;
    constructor(public payload: Node) {}
}

export class RemoveRejectedWarningAction implements Action {
    readonly type = REMOVE_REJECTED_WARNING_ACTION;
    constructor(public payload: NodeEntry) {}
}
