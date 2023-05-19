/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NodeChildAssociationEntry } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { AppStore } from '@alfresco/aca-shared/store';
import { CancelSessionOfficeAction, EndSessionOfficeAction } from '../../store/extension.actions';

@Component({
    selector: 'ooi-end-session-dialog',
    templateUrl: './end-session-dialog.component.html',
    styleUrls: ['./end-session-dialog.component.scss'],
})
export class EndSessionDialogComponent {
    node: NodeChildAssociationEntry;
    endingMethod = 'end';
    isMajorVersion = false;
    comment: string;

    constructor(@Inject(MAT_DIALOG_DATA) data: any, private dialogRef: MatDialogRef<EndSessionDialogComponent>, private store: Store<AppStore>) {
        this.node = data.node;
    }

    handleVersionChange(isMajor: boolean) {
        this.isMajorVersion = isMajor;
    }

    handleCommentChange(comment: string) {
        this.comment = comment;
    }

    submitSession() {
        if (this.endingMethod === 'end') {
            this.store.dispatch(new EndSessionOfficeAction({ node: this.node, isMajor: this.isMajorVersion, comment: this.comment }));
        } else {
            this.store.dispatch(new CancelSessionOfficeAction(this.node));
        }
        this.dialogRef.close();
    }
}
