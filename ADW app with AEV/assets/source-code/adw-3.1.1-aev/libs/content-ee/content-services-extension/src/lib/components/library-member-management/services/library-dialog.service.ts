/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Person, SiteEntry } from '@alfresco/js-api';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { RejectMemberDialogComponent } from '../pending-requests/reject-member-dialog/reject-member-dialog.component';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';

@Injectable({ providedIn: 'root' })
export class LibraryDialogService {
    constructor(private dialog: MatDialog) {}

    openConfirmDialog() {
        return this.dialog
            .open(ConfirmDialogComponent, {
                data: {
                    title: 'MEMBER_MANAGER.CONFIRM_DIALOG.TITLE',
                    message: 'MEMBER_MANAGER.CONFIRM_DIALOG.MESSAGE',
                },
                minWidth: '300px',
            })
            .afterClosed();
    }

    openRejectMemberDialog() {
        return this.dialog.open(RejectMemberDialogComponent, { minWidth: '300px' }).afterClosed();
    }

    openAddLibraryMemberDialog(site: SiteEntry, members: Person[]) {
        return this.dialog
            .open(AddMemberDialogComponent, {
                data: {
                    site,
                    members,
                },
                width: '800px',
                restoreFocus: true,
                panelClass: 'adw-add-member-dialog',
            })
            .afterClosed();
    }
}
