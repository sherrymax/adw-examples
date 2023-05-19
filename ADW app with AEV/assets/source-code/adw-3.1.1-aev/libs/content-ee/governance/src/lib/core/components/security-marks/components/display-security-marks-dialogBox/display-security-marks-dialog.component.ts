/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'aga-security-marks-dialog',
    templateUrl: './display-security-marks-dialog.component.html',
    styleUrls: ['./display-security-marks-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DisplaySecurityMarksDialogComponent implements OnInit {

    constructor(@Inject(MAT_DIALOG_DATA) public data: {securityMarksData: Array<string>}) {}

    marksList: Array<string>;

    ngOnInit() {
        this.marksList = this.data.securityMarksData;
    }
}
