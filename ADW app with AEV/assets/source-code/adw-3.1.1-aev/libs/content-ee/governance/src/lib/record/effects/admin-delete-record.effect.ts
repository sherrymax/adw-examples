/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, catchError, concatMap } from 'rxjs/operators';
import { ADMIN_DELETE_RECORD, AdminDeleteRecord } from '../actions/record.action';
import { RecordService } from '../services/record.service';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { of } from 'rxjs';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';

@Injectable()
export class AdminDeleteRecordEffect {
    constructor(
        private recordService: RecordService,
        private actions$: Actions,
        private reloadService: ReloadDocumentListService,
        private extendedNotificationService: ExtendedNotificationService
    ) {}


    recordDialogue$ = createEffect(() => this.actions$.pipe(
        ofType<AdminDeleteRecord>(ADMIN_DELETE_RECORD),
        concatMap((action) => this.recordService.deleteRecord(action.payload).pipe(
            tap(() => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DELETE-RECORD.SUCCESS');
                this.reloadService.emitReloadEffect();
            }),
            catchError((error) => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DELETE-RECORD.FAIL');
                return of(error);
            })
        ))
    ), { dispatch: false });
}
