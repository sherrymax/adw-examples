/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'aga-restore-dialog',
    templateUrl: './restore-dialog.component.html',
})
export class RestoreDialogComponent {
    types = [
        {
            desc: 'GOVERNANCE.GLACIER.RESTORE.DIALOG.LABEL.OPTION-FAST',
            id: 'Expedited',
        },
        {
            desc: 'GOVERNANCE.GLACIER.RESTORE.DIALOG.LABEL.OPTION-STANDARD',
            id: 'Standard',
        },
        {
            desc: 'GOVERNANCE.GLACIER.RESTORE.DIALOG.LABEL.OPTION-SLOW',
            id: 'Bulk',
        },
    ];
    form: UntypedFormGroup;
    title: string;
    yesLabel: string;
    noLabel: string;
    canShowTypes: boolean;

    constructor(private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) data) {
        this.title = data.title || 'GOVERNANCE.GLACIER.RESTORE.DIALOG.TITLE';
        this.yesLabel = data.yesLabel || 'GOVERNANCE.GLACIER.RESTORE.DIALOG.YES';
        this.noLabel = data.noLabel || 'GOVERNANCE.GLACIER.RESTORE.DIALOG.NO';
        this.canShowTypes = data.canShowTypes === undefined ? true : data.canShowTypes;
        this.form = this.fb.group({
            type: [data.type ? data.type : 'Bulk', Validators.required],
            days: [data.days ? data.days : 1, [Validators.required, Validators.min(1), Validators.max(1000)]],
        });
    }
}
