/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { GLACIER_RESTORE_ACTION, GlacierRestoreAction } from '../actions/glacier.actions';
import { GlacierService } from '../services/glacier.service';
import { NodeEntry } from '@alfresco/js-api';
import { RestoreDialogComponent } from '../components/restore-dialog/restore-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { EMPTY, Observable, of } from 'rxjs';
import { BulkRestoreService } from '../services/bulk-restore.service';

@Injectable()
export class GlacierRestoreEffect {
    constructor(
        private actions$: Actions,
        private glacierService: GlacierService,
        private reloadService: ReloadDocumentListService,
        private extendedNotificationService: ExtendedNotificationService,
        private dialog: MatDialog,
        private bulkRestoreService: BulkRestoreService
    ) {}


    restoreRecord$ = createEffect(() => this.actions$.pipe(
        ofType<GlacierRestoreAction>(GLACIER_RESTORE_ACTION),
        mergeMap((action) => {
            if (action.payload) {
                const nodes = action.payload;
                return this.openRestoreDialog(nodes).pipe(
                    filter((response) => response),
                    tap((details) => (this.hasBulkRestore(nodes) ? this.bulkRestoreService.storeBulkNodes(nodes, details.type, details.days) : null)),
                    filter(() => !this.hasBulkRestore(nodes)),
                    switchMap((details) => this.glacierService.restoreRecord(nodes[0].entry, details.type, details.days)),
                    tap((status) => (!status ? this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.RESTORE.SYNC-ERROR') : null)),
                    filter((status) => !!status),
                    tap(() => this.reloadService.refreshDocumentList.next()),
                    catchError((error: Error) => {
                        this.showError(nodes[0].entry.name);
                        return of(error);
                    })
                );
            }
            return EMPTY;
        })
    ), { dispatch: false });

    private hasBulkRestore(nodes: NodeEntry[]) {
        return nodes.length > 1;
    }

    private openRestoreDialog(nodes: NodeEntry[]): Observable<any> {
        const dialogReference = this.dialog.open(RestoreDialogComponent, {
            data: {
                title: this.hasBulkRestore(nodes) ? 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.TITLE' : null,
            },
            width: '450px',
        });
        return dialogReference.afterClosed();
    }

    private showError(name: string) {
        this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.RESTORE.FAIL', { name });
    }
}
