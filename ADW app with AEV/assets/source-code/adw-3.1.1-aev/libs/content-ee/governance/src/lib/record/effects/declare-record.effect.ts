/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { DECLARE_RECORD_ACTION, DeclareRecordAction } from '../actions/record.action';
import { RecordService } from '../services/record.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { Node, NodeEntry } from '@alfresco/js-api';
import { isNodeHavingProp } from '../../core/rules/node.evaluator';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeclareRecord } from '../models/declare-record.model';
import { BulkRecordService } from '../services/bulk-declare-record.service';
import { Store } from '@ngrx/store';
import { SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { ContentApiService } from '@alfresco-dbp/content-ce/shared';

@Injectable()
export class DeclareRecordEffects {
    constructor(
        private actions$: Actions,
        private recordService: RecordService,
        private reloadService: ReloadDocumentListService,
        private dialog: MatDialog,
        private extendedNotificationService: ExtendedNotificationService,
        private declareRecordService: BulkRecordService,
        private store: Store<any>,
        private contentApiService: ContentApiService
    ) {}


    declareRecord$ = createEffect(() => this.actions$.pipe(
        ofType<DeclareRecordAction>(DECLARE_RECORD_ACTION),
        map((action) => {
            const nodes = action.payload;
            if (this.isBulkDeclaration(nodes)) {
                this.declareRecordService.declareBulkRecords(nodes);
            } else {
                return this.declareSingleRecord(nodes[0]);
            }
        })
    ), { dispatch: false });

    private isBulkDeclaration(nodes: NodeEntry[]) {
        return nodes.length > 1;
    }

    private isRejectedRecord(node: NodeEntry) {
        return isNodeHavingProp(node, 'aspectNames', 'rma:recordRejectionDetails', 'array');
    }

    declareSingleRecord(node: NodeEntry) {
        this.recordService.declaredSingleRecord$.next(<DeclareRecord> node);
        const rejectedRecord = this.isRejectedRecord(node);
        if (rejectedRecord) {
            this.removeRejectedWarning(node.entry);
        } else {
            this.declareRecord(node.entry);
        }
    }

    private declareRecord(node: Node) {
        const { name: fileName } = node;
        this.recordService
            .declareNodeRecord(node)
            .pipe(switchMap((record) => this.contentApiService.getNode(record.entry.id)))
            .subscribe(
                (recordNode) => {
                    this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DECLARE-RECORD.SUCCESS', { fileName });
                    this.reloadService.refreshDocumentList.next();
                    this.store.dispatch(new SetSelectedNodesAction([recordNode]));
                },
                () => {
                    const failedRecord = <DeclareRecord> {
                        ...{ entry: node },
                        status: 'failed',
                    };
                    this.recordService.declaredSingleRecord$.next(failedRecord);
                    this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.DECLARE-RECORD.FAIL', { fileName });
                }
            );
    }

    private removeRejectedWarning(node: Node) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'GOVERNANCE.DECLARE-RECORD.DIALOG.TITLE',
                message: 'GOVERNANCE.DECLARE-RECORD.DIALOG.MESSAGE',
                yesLabel: 'GOVERNANCE.DECLARE-RECORD.DIALOG.YES',
                noLabel: 'GOVERNANCE.DECLARE-RECORD.DIALOG.NO',
            },
        });

        dialogRef
            .afterClosed()
            .pipe(
                filter((result) => !!result),
                switchMap(() => this.recordService.removeNodeRejectedWarning(node)),
                catchError(() => {
                    this.extendedNotificationService.sendNotificationMessage('GOVERNANCE.REJECTED-INFO-RECORD.FAILED-REMOVE');
                    return of(false);
                }),
                filter((valid) => !!valid)
            )
            .subscribe(() => this.declareRecord(node));
    }
}
