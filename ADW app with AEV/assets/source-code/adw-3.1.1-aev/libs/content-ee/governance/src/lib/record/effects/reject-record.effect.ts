/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, switchMap, tap, catchError, mergeMap } from 'rxjs/operators';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { RecordService } from '../services/record.service';
import { REMOVE_REJECTED_WARNING_ACTION, RemoveRejectedWarningAction } from '../actions/record.action';
import { EMPTY, Observable, of } from 'rxjs';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';

@Injectable()
export class RejectRecordEffect {
    constructor(
        private actions$: Actions,
        private recordService: RecordService,
        private dialog: MatDialog,
        private reloadService: ReloadDocumentListService,
        private extendedNotificationService: ExtendedNotificationService
    ) {}


    removeRejectedWarning$ = createEffect(() => this.actions$.pipe(
        ofType<RemoveRejectedWarningAction>(REMOVE_REJECTED_WARNING_ACTION),
        mergeMap((action) => {
            if (action.payload) {
                return this.openRejectedDialog().pipe(
                    filter((result) => !!result),
                    switchMap(() => this.recordService.removeNodeRejectedWarning(action.payload.entry)),
                    tap(() => this.reloadService.emitReloadEffect()),
                    catchError((error: Error) => {
                        this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.REJECTED-INFO-RECORD.FAILED-REMOVE', {
                            nodeName: action.payload.entry.name,
                            errorMessage: error,
                        });
                        return of(error);
                    })
                );
            }
            return EMPTY;
        })
    ), { dispatch: false });

    private openRejectedDialog(): Observable<any> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'GOVERNANCE.REJECTED-INFO-RECORD.CONFIRM',
                message: 'GOVERNANCE.REJECTED-INFO-RECORD.WARNING',
            },
            minWidth: '250px',
        });

        return dialogRef.afterClosed();
    }
}
