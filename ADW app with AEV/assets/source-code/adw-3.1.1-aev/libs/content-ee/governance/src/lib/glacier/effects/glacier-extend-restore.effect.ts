/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, mergeMap, switchMap, tap } from 'rxjs/operators';
import { GLACIER_EXTEND_RESTORE_ACTION, GlacierExtendRestoreAction } from '../actions/glacier.actions';
import { Node } from '@alfresco/js-api';
import { RestoreDialogComponent } from '../components/restore-dialog/restore-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { GlacierService } from '../services/glacier.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { EMPTY, Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable()
export class GlacierExtendRestoreEffect {
    constructor(
        private actions$: Actions,
        private glacierService: GlacierService,
        private extendedNotificationService: ExtendedNotificationService,
        private dialog: MatDialog,
        @Inject(MAT_DATE_LOCALE) private localeID: string
    ) {}


    restoreRecord$ = createEffect(() => this.actions$.pipe(
        ofType<GlacierExtendRestoreAction>(GLACIER_EXTEND_RESTORE_ACTION),
        mergeMap((action) => {
            if (action.payload) {
                const node = action.payload;
                return this.openRestoreDialog(node).pipe(
                    filter((response) => response),
                    switchMap((details) => this.glacierService.extendRestore(node, details.type, details.days)),
                    tap(() => this.showMessage(node.id)),
                    catchError((error: Error) => {
                        this.showError(node.name);
                        return of(error);
                    })
                );
            }
            return EMPTY;
        })
    ), { dispatch: false });

    private openRestoreDialog(node: Node): Observable<any> {
        const restoreCache = this.glacierService.getRestoreCache(node.id);
        const { type = '', days = 0 } = restoreCache ? restoreCache : {};
        const dialogReference = this.dialog.open(RestoreDialogComponent, {
            data: {
                title: 'GOVERNANCE.GLACIER.EXTEND-RESTORE.TITLE',
                type: type,
                days: days,
                canShowTypes: false,
            },
            width: '450px',
        });
        return dialogReference.afterClosed();
    }

    private showMessage(id) {
        const { days, initiated } = this.glacierService.getRestoreCache(id);
        const date = new DatePipe(this.localeID).transform(initiated, 'dd/MMMM/yyyy');
        this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.EXTEND-RESTORE.SUCCESS', { days, date });
    }

    private showError(name: string) {
        this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.EXTEND-RESTORE.FAIL', { name });
    }
}
