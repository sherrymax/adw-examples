/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { MOVE_RECORD, MoveRecordAction } from '../actions/record.action';
import { RecordService } from '../services/record.service';
import { MoveRecordDialogService } from '../services/move-record-dialog.service';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { Node, NodePaging } from '@alfresco/js-api';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { NodeAction } from '@alfresco/adf-content-services';

@Injectable()
export class MoveRecordEffect {
    constructor(
        private actions$: Actions,
        private moveRecordDialogService: MoveRecordDialogService,
        private recordService: RecordService,
        private reloadService: ReloadDocumentListService,
        private extendedNotificationService: ExtendedNotificationService
    ) {}


    moveRecord$ = createEffect(() => this.actions$.pipe(
        ofType<MoveRecordAction>(MOVE_RECORD),
        concatMap((action) => {
            if (action.payload) {
                return this.moveRecordWithinSite(action.payload).pipe(
                    tap(() => {
                        this.extendedNotificationService.sendNotificationMessage(`GOVERNANCE.MOVE-RECORD.SUCCESSFUL`);
                        this.reloadService.emitReloadEffect();
                    }),
                    catchError((error: Error) => {
                        this.extendedNotificationService.sendNotificationMessage(error.message);
                        return of(error);
                    })
                );
            }
            return EMPTY;
        })
    ), { dispatch: false });

    private moveRecordWithinSite(nodeToMove: Node): Observable<NodePaging> {
        return this.moveRecordDialogService.openMoveRecordDialog(NodeAction.MOVE, nodeToMove, 'update').pipe(
            concatMap((selections: Node[]) => {
                const selection = selections[0];
                if (selection.id !== nodeToMove.properties['rma:recordOriginatingLocation']) {
                    return this.recordService.moveRecord(nodeToMove, selection);
                } else {
                    const sameFolderError: Error = new Error('GOVERNANCE.MOVE-RECORD.SAME-FOLDER-MOVE');
                    return throwError(sameFolderError);
                }
            })
        );
    }
}
