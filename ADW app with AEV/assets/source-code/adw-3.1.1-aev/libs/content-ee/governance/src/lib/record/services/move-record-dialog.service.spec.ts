/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MinimalNodeEntryEntity } from '@alfresco/js-api';
import { MoveRecordDialogService } from './move-record-dialog.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NodeAction } from '@alfresco/adf-content-services';
import { TestBed } from '@angular/core/testing';
import { GovernanceTestingModule } from '../../testing/governance-test.module';

describe('MoveRecordDialogService', () => {
    let service: MoveRecordDialogService;
    const fakeNode: MinimalNodeEntryEntity = new MinimalNodeEntryEntity({
        name: 'Node Action',
        id: 'fake-id',
        aspectNames: [],
        properties: { 'rma:recordOriginatingLocation': 'fake-parent-id' },
    });

    let dialog: MatDialog;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, GovernanceTestingModule],
            providers: [MoveRecordDialogService]
        });

        service = TestBed.inject(MoveRecordDialogService);
        dialog = TestBed.inject(MatDialog);
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<any>);
    });

    it('should be able to open the dialog when node has permission', () => {
        service.openMoveRecordDialog(NodeAction.CHOOSE, fakeNode, '!update');
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should NOT be able to open the dialog when node has NOT permission', () => {
        service.openMoveRecordDialog(NodeAction.CHOOSE, fakeNode, 'noperm').subscribe(
            () => {},
            (error) => {
                expect(dialog.open).not.toHaveBeenCalled();
                expect(JSON.parse(error.message).error.statusCode).toBe(403);
            }
        );
    });
});
