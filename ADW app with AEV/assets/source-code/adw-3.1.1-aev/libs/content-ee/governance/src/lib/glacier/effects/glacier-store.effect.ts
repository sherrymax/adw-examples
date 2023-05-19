/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, filter, mergeMap, tap } from 'rxjs/operators';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { GLACIER_STORE_ACTION, GlacierStoreAction } from '../actions/glacier.actions';
import { GlacierService } from '../services/glacier.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { EMPTY, Observable, of } from 'rxjs';
import { NodeEntry } from '@alfresco/js-api';
import { BulkStoreService } from '../services/bulk-store.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';

@Injectable()
export class GlacierStoreEffect {
    constructor(
        private actions$: Actions,
        private glacierService: GlacierService,
        private reloadService: ReloadDocumentListService,
        private bulkStoreService: BulkStoreService,
        private extendedNotificationService: ExtendedNotificationService,
        private dialog: MatDialog
    ) {}


    storeRecord$ = createEffect(() => this.actions$.pipe(
        ofType<GlacierStoreAction>(GLACIER_STORE_ACTION),
        mergeMap((action) => this.openStoreDialog().pipe(
            filter((response) => response),
            concatMap(() => {
                if (action.payload.length) {
                    if (this.isBulkProcess(action.payload)) {
                        this.bulkStoreService.storeBulkNodes(action.payload);
                        return of(true);
                    }
                    return this.storeSingleRecord(action.payload[0]);
                }
                return EMPTY;
            })
        ))
    ), { dispatch: false });

    private isBulkProcess(nodes: NodeEntry[]) {
        return nodes.length > 1;
    }

    private storeSingleRecord(node: NodeEntry): Observable<any> {
        const {
            entry: { name },
        } = node;
        return this.glacierService.storeRecord(node.entry).pipe(
            tap(() => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.STORE.SUCCESS', { name });
                this.reloadService.refreshDocumentList.next();
            }),
            catchError((error: Error) => {
                this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.GLACIER.STORE.FAIL', { name });
                return of(error);
            })
        );
    }

    private openStoreDialog(): Observable<boolean> {
        const dialogReference = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'GOVERNANCE.GLACIER.STORE.DIALOG.TITLE',
                message: 'GOVERNANCE.GLACIER.STORE.DIALOG.MESSAGE',
                yesLabel: 'GOVERNANCE.GLACIER.STORE.DIALOG.YES',
                noLabel: 'GOVERNANCE.GLACIER.STORE.DIALOG.NO',
            },
            width: '35%',
        });
        return dialogReference.afterClosed();
    }
}
