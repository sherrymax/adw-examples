/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { BulkOperationDialogComponent } from '../components/bulk-operation-dialog/bulk-operation-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BulkOperationService } from './bulk-operation.service';
import { BulkOperationModel } from '../model/bulk-operation.model';

@Injectable({
    providedIn: 'root',
})
export class BulkOperationDialogService {
    private bulkRecordDialog: MatDialogRef<BulkOperationDialogComponent> = null;

    constructor(private dialog: MatDialog, private bulkRecordService: BulkOperationService) {}

    private getDeclareRecordDialog(): MatDialogRef<BulkOperationDialogComponent> {
        return this.dialog.open(BulkOperationDialogComponent, {
            hasBackdrop: false,
            panelClass: 'aga-bulk-operation-dialog',
            width: '40%',
            position: { bottom: '20px', left: '25px' },
        });
    }

    isDialogOpened() {
        return !!this.bulkRecordDialog;
    }

    declareBulkRecords(nodes: BulkOperationModel[]) {
        if (!this.isDialogOpened()) {
            this.bulkRecordDialog = this.getDeclareRecordDialog();
            this.handleDialogEvents(nodes);
        } else {
            this.bulkRecordService.addToQueue(nodes);
        }
    }

    private handleDialogEvents(nodes: BulkOperationModel[]) {
        this.bulkRecordDialog.afterOpened().subscribe(() => this.bulkRecordService.addToQueue(nodes));
        this.bulkRecordDialog.afterClosed().subscribe(() => (this.bulkRecordDialog = null));
    }
}
