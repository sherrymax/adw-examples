/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NameColumnComponent } from '@alfresco/adf-content-services';
import { Component, ViewEncapsulation, ElementRef, OnInit, OnDestroy} from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { SecurityMarksService } from '../security-marks.service';
import { SecurityMarkPaging, SecurityMarkEntry } from '@alfresco/js-api';
import { BehaviorSubject, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DisplaySecurityMarksDialogComponent } from '../display-security-marks-dialogBox/display-security-marks-dialog.component';

@Component({
    selector: 'aga-security-marks-column',
    templateUrl: './display-security-marks.component.html',
    styleUrls: ['./display-security-marks.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DisplaySecurityMarksComponent extends NameColumnComponent implements OnInit, OnDestroy {

    constructor(public elementRef: ElementRef, private securityMarksService: SecurityMarksService,
        apiService: AlfrescoApiService,
        private dialog: MatDialog){
        super(elementRef, apiService);
    }

    securityMarksList: Array<string> = [];
    marksData = new BehaviorSubject(this.securityMarksList);

    ngOnInit() {
        this.updateValue();

        this.securityMarksService
            .getNodeSecurityMarks(this.node?.entry?.id)
            .then((securityMarkPaging: SecurityMarkPaging) => {
                const securityMarkResponse = {
                    entries: securityMarkPaging?.list?.entries?.map(
                        (mark: SecurityMarkEntry) => mark.entry)};
                    securityMarkResponse?.entries?.forEach((securityMark) => {
                        this.securityMarksList.push(securityMark.name);
                    });

                    this.securityMarksList.sort((mark1, mark2) => (mark1.length < mark2.length ? -1 : 1));
                    this.marksData.next(this.securityMarksList);
            })
            .catch((error) => {
                throwError(error);
            });
    }

    isShowAllButtonVisible(): boolean {
        return this.securityMarksList?.length > 3;
    }

    showAll() {
       this.dialog.open(DisplaySecurityMarksDialogComponent, {
            data: { securityMarksData: this.securityMarksList },
            width: '320px',
            height: 'auto',
        });
    }
}
