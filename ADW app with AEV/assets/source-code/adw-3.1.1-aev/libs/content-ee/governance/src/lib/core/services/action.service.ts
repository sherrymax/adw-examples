/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { isRecord, isRejectedRecord } from '../../record/rules/record.evaluator';

@Injectable({
    providedIn: 'root',
})
export class ActionService {
    constructor(private actions$: Actions) {}

    getSelectedNode(): Observable<boolean> {
        return this.actions$.pipe(
            ofType('SET_SELECTED_NODES'),
            map((action: SetSelectedNodesAction) => !!action.payload.length)
        );
    }

    onRecordSelection(): Observable<boolean> {
        return this.actions$.pipe(
            ofType('SET_SELECTED_NODES'),
            map((action: SetSelectedNodesAction) =>
                !!action.payload.length && (isRecord(action.payload[action.payload.length - 1])
                || isRejectedRecord(action.payload[action.payload.length - 1])))
        );
    }
}
