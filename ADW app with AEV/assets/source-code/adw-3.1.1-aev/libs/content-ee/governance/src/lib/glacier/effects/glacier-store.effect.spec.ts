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
import { GlacierStoreAction } from '../actions/glacier.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fakeFolder } from '../../record/rules/mock-data';
import { BulkStoreService } from '../services/bulk-store.service';

describe('GlacierStoreEffect', () => {
    let store: Store<any>;
    let glacierService: GlacierService;
    let extendedNotificationService: ExtendedNotificationService;
    let reloadService: ReloadDocumentListService;
    let dialog: MatDialog;
    let bulkStoreService: BulkStoreService;

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
        reloadService = TestBed.inject(ReloadDocumentListService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        dialog = TestBed.inject(MatDialog);
        bulkStoreService = TestBed.inject(BulkStoreService);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        spyOn(reloadService, 'emitReloadEffect').and.stub();
    });

    describe('single operation', () => {
        it('should store the record with valid pop message', () => {
            const fakeResponse: any = { id: 'fake-id' };

            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<any>);

            spyOn(glacierService, 'storeRecord').and.returnValue(of(fakeResponse));

            store.dispatch(new GlacierStoreAction([node]));

            expect(dialog.open).toHaveBeenCalled();
            expect(glacierService.storeRecord).toHaveBeenCalledWith(node.entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.STORE.SUCCESS', {
                name: 'fake-name',
            });
            expect(reloadService.emitReloadEffect).toHaveBeenCalled();
        });

        it('should not store the node if press no', () => {
            const fakeResponse: any = { id: 'fake-id' };

            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(false),
            } as MatDialogRef<any>);

            spyOn(glacierService, 'storeRecord').and.returnValue(of(fakeResponse));

            store.dispatch(new GlacierStoreAction([node]));

            expect(dialog.open).toHaveBeenCalled();
            expect(glacierService.storeRecord).not.toHaveBeenCalled();
            expect(extendedNotificationService.sendNotificationMessage).not.toHaveBeenCalled();
            expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
        });

        it('should show proper error message when api failed', () => {
            spyOn(glacierService, 'storeRecord').and.returnValue(throwError('error'));

            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<any>);

            store.dispatch(new GlacierStoreAction([node]));

            expect(glacierService.storeRecord).toHaveBeenCalledWith(node.entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.STORE.FAIL', {
                name: 'fake-name',
            });
            expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
        });
    });

    describe('bulk operation', () => {
        it('should call bulk service when more than one node found', () => {
            spyOn(bulkStoreService, 'storeBulkNodes').and.stub();
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<any>);
            store.dispatch(new GlacierStoreAction([node, fakeFolder]));
            expect(bulkStoreService.storeBulkNodes).toHaveBeenCalledWith([node, fakeFolder]);
        });

        it('should node call bulk service when cancel is pressed', () => {
            spyOn(bulkStoreService, 'storeBulkNodes').and.stub();
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(false),
            } as MatDialogRef<any>);
            store.dispatch(new GlacierStoreAction([node, fakeFolder]));
            expect(bulkStoreService.storeBulkNodes).not.toHaveBeenCalled();
        });
    });
});
