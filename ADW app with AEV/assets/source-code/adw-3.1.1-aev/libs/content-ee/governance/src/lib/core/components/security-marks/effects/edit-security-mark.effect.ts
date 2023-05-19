/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EMPTY } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { ManageSecurityMarksAction, MANAGE_SECURITY_MARK } from '../actions/security-marks.action';
import { SecurityMarksDialogComponent, SecurityMarksDialogData } from '../components/security-marks.dialog';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class EditSecurityMarkEffect {
    constructor(
        private actions$: Actions,
        private dialog: MatDialog
    ) {}


    manageSecurityMarks$ = createEffect(() => this.actions$.pipe(
        ofType<ManageSecurityMarksAction>(MANAGE_SECURITY_MARK),
        concatMap((action) => {
            if (action && action.payload) {
                this.dialog.open(SecurityMarksDialogComponent, {
                    data: { title: 'GOVERNANCE.SECURITY_MARKS.DIALOG_TITLE',
                            nodeId: action.payload.id,
                            isMarksDialogEnabled: true,
                            isHelpDialogEnabled: false,
                        } as SecurityMarksDialogData,
                    panelClass: 'adf-security-marks-manager-dialog-panel',
                    width: '600px'
                });
            }
            return EMPTY;
        })
    ), { dispatch: false });
}
