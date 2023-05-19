/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';

import { BulkStoreService } from './bulk-store.service';
import { setupTestBed } from '@alfresco/adf-core';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { OperationStatus } from '../../core/model/bulk-operation.model';
import { BulkOperationDialogService } from '../../core/services/bulk-operation-dialog.service';
import { GlacierService } from './glacier.service';
import { NodeEntry } from '@alfresco/js-api';
import { of } from 'rxjs';
import { fakeFolder, fakeRecord } from '../../record/rules/mock-data';

describe('BulkStoreService', () => {
    let bulkStoreService: BulkStoreService;
    let glacierService: GlacierService;
    let bulkOperationDialogService: BulkOperationDialogService;

    setupTestBed({
        imports: [GovernanceTestingModule],
    });

    beforeEach(() => {
        bulkStoreService = TestBed.inject(BulkStoreService);
        bulkOperationDialogService = TestBed.inject(BulkOperationDialogService);
        glacierService = TestBed.inject(GlacierService);
    });

    it('should initiate the bulk operations', (done) => {
        const nodes = [
            <NodeEntry>{
                entry: {
                    id: 'abc',
                    name: 'fake-abc',
                    isFile: true,
                    allowableOperations: ['update'],
                },
            },
            fakeFolder,
        ];
        spyOn(glacierService, 'storeRecord').and.returnValues(of(nodes[0]));
        spyOn(bulkOperationDialogService, 'declareBulkRecords').and.callThrough();
        bulkStoreService.storeBulkNodes(nodes);
        expect(glacierService.storeRecord).toHaveBeenCalledTimes(1);
        done();
    });

    it('success handler', () => {
        const node = JSON.parse(JSON.stringify(fakeRecord));
        expect(bulkStoreService.successHandler(node)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.SUCCESS',
            icon: { name: '', isSvg: true },
        });

        node.entry.properties['gl:contentState'] = 'ARCHIVED';
        node.entry.aspectNames = ['gl:archived', 'rma:record'];
        expect(bulkStoreService.successHandler(node)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.ERRORS.EXISTING-STORED-NODE',
            icon: { name: 'store', isSvg: true },
        });

        node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
        expect(bulkStoreService.successHandler(node)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.ERRORS.PENDING-RESTORE',
            icon: { name: 'autorenew', isSvg: false },
        });

        node.entry.properties['gl:contentState'] = 'RESTORED';
        expect(bulkStoreService.successHandler(node)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.ERRORS.RESTORED',
            icon: { name: 'store', isSvg: true },
        });

        expect(bulkStoreService.successHandler(fakeFolder)).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.ERRORS.FOLDER',
            icon: { name: 'store', isSvg: true },
        });
    });

    it('error handler', () => {
        expect(bulkStoreService.errorHandler()).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.STORE.BULK-OPERATION.FAIL',
        });
    });
});
