/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, filter, switchMap, tap } from 'rxjs/operators';
import { DELETE_RECORD, DeleteRecordAction } from '../actions/record.action';
import { Node, NodePaging } from '@alfresco/js-api';
import { EMPTY, Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { RecordService } from '../services/record.service';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslationService } from '@alfresco/adf-core';
import { trimRecordId } from '../rules/record.evaluator';
import { ClosePreviewAction } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';

@Injectable()
export class DeleteRecordEffect {
    constructor(
        private actions$: Actions,
        private recordService: RecordService,
        private reloadService: ReloadDocumentListService,
        private dialog: MatDialog,
        private translationService: TranslationService,
        private extendedNotificationService: ExtendedNotificationService,
        private store: Store<any>
    ) {}


    deleteRecord$ = createEffect(() => this.actions$.pipe(
        ofType<DeleteRecordAction>(DELETE_RECORD),
        concatMap((action) => {
            if (action.payload) {
                return this.deleteRecord(action.payload);
            }
            return EMPTY;
        })
    ), { dispatch: false });

    private deleteRecord(node: Node): Observable<NodePaging | Error> {
        const { name } = node;
        const deleteMessage = this.translationService.instant('GOVERNANCE.DELETE-RECORD.DIALOG.MESSAGE.DELETE', { name });
        const additionalMessage = this.translationService.instant('GOVERNANCE.DELETE-RECORD.DIALOG.MESSAGE.ADDITIONAL', { name });
        const dialogReference = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'GOVERNANCE.DELETE-RECORD.DIALOG.TITLE',
                htmlContent: ` <p> ${deleteMessage}</p>
                           <p> ${additionalMessage}</p>`,
                yesLabel: 'GOVERNANCE.DELETE-RECORD.DIALOG.YES',
                noLabel: 'GOVERNANCE.DELETE-RECORD.DIALOG.NO',
            },
            width: '50%',
        });

        return dialogReference.afterClosed().pipe(
            filter((result) => !!result),
            switchMap(() => this.recordService.hideRecord(node)),
            tap(() => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DELETE-RECORD.SUCCESS', { name: trimRecordId(node) });
                this.store.dispatch(new ClosePreviewAction());
                this.reloadService.refreshDocumentList.next();
            }),
            catchError((err: Error) => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DELETE-RECORD.FAIL', { recordId: node.id });
                return of(err);
            })
        );
    }
}
