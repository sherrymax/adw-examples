/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { NodeEntry } from '@alfresco/js-api';
import { of, throwError } from 'rxjs';
import { GlacierService } from '../services/glacier.service';
import { GlacierRestoreAction } from '../actions/glacier.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BulkRestoreService } from '../services/bulk-restore.service';
import { fakeFolder } from '../../record/rules/mock-data';

describe('GlacierRestoreEffect', () => {
    let store: Store<any>;
    let glacierService: GlacierService;
    let bulkRestoreService: BulkRestoreService;
    let extendedNotificationService: ExtendedNotificationService;
    let reloadService: ReloadDocumentListService;
    let dialog: MatDialog;

    const node: NodeEntry = <NodeEntry>{
        entry: {
            id: 'id',
            name: 'fake-name',
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        glacierService = TestBed.inject(GlacierService);
        bulkRestoreService = TestBed.inject(BulkRestoreService);
        reloadService = TestBed.inject(ReloadDocumentListService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        dialog = TestBed.inject(MatDialog);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        spyOn(reloadService, 'emitReloadEffect').and.stub();
    });

    describe('single Operation', () => {
        it('should restore the record', () => {
            spyOn(glacierService, 'restoreRecord').and.returnValue(of(true));

            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of({ type: 'standard', days: 5 }),
            } as MatDialogRef<any>);

            store.dispatch(new GlacierRestoreAction([node]));

            expect(glacierService.restoreRecord).toHaveBeenCalledWith(node.entry, 'standard', 5);
            expect(extendedNotificationService.sendNotificationMessage).not.toHaveBeenCalled();
            expect(reloadService.emitReloadEffect).toHaveBeenCalled();
        });

        it('should show sync error when failed to restore', () => {
            spyOn(glacierService, 'restoreRecord').and.returnValue(of(null));
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of({ type: 'standard', days: 5 }),
            } as MatDialogRef<any>);

            store.dispatch(new GlacierRestoreAction([node]));

            expect(glacierService.restoreRecord).toHaveBeenCalledWith(node.entry, 'standard', 5);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.RESTORE.SYNC-ERROR');
            expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
        });

        it('should show proper error message when api failed', () => {
            spyOn(glacierService, 'restoreRecord').and.returnValue(throwError('error'));

            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of({ type: 'standard', days: 5 }),
            } as MatDialogRef<any>);

            store.dispatch(new GlacierRestoreAction([node]));

            expect(glacierService.restoreRecord).toHaveBeenCalledWith(node.entry, 'standard', 5);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.RESTORE.FAIL', {
                name: 'fake-name',
            });
            expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
        });
    });

    describe('bulk operation', () => {
        it('should call bulk service when more than one node found', () => {
            spyOn(bulkRestoreService, 'storeBulkNodes').and.stub();
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of({ type: 'standard', days: 5 }),
            } as MatDialogRef<any>);
            store.dispatch(new GlacierRestoreAction([node, fakeFolder]));
            expect(bulkRestoreService.storeBulkNodes).toHaveBeenCalledWith([node, fakeFolder], 'standard', 5);
        });

        it('should node call bulk service when cancel is pressed', () => {
            spyOn(bulkRestoreService, 'storeBulkNodes').and.stub();
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(false),
            } as MatDialogRef<any>);
            store.dispatch(new GlacierRestoreAction([node, fakeFolder]));
            expect(bulkRestoreService.storeBulkNodes).not.toHaveBeenCalled();
        });
    });
});
