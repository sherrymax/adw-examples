/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { BulkRestoreService } from './bulk-restore.service';
import { setupTestBed } from '@alfresco/adf-core';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { BulkOperationDialogService } from '../../core/services/bulk-operation-dialog.service';
import { OperationStatus } from '../../core/model/bulk-operation.model';
import { GlacierService } from './glacier.service';
import { NodeEntry } from '@alfresco/js-api';
import { of } from 'rxjs';
import { fakeFolder, fakeRecord } from '../../record/rules/mock-data';

describe('BulkRestoreService', () => {
    let bulkRestoreService: BulkRestoreService;
    let glacierService: GlacierService;
    let bulkOperationDialogService: BulkOperationDialogService;

    setupTestBed({
        imports: [GovernanceTestingModule],
    });

    beforeEach(() => {
        bulkRestoreService = TestBed.inject(BulkRestoreService);
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
                    properties: { 'gl:contentState': 'ARCHIVED' },
                    aspectNames: ['gl:archived'],
                },
            },
            fakeFolder,
        ];
        spyOn(glacierService, 'restoreRecord').and.returnValues(of(true));
        spyOn(bulkOperationDialogService, 'declareBulkRecords').and.callThrough();
        bulkRestoreService.storeBulkNodes(nodes, 'expedited', 5);
        expect(glacierService.restoreRecord).toHaveBeenCalledTimes(1);
        expect(glacierService.restoreRecord).toHaveBeenCalledWith(nodes[0].entry, 'expedited', 5);
        done();
    });

    it('success handler', () => {
        const node = JSON.parse(JSON.stringify(fakeRecord));
        expect(bulkRestoreService.successHandler(node, true)).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.NOT-STORED',
            icon: { name: 'restore', isSvg: true },
        });

        node.entry.properties['gl:contentState'] = 'ARCHIVED';
        node.entry.aspectNames = ['gl:archived', 'rma:record'];
        expect(bulkRestoreService.successHandler(node, true)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.SUCCESS',
            icon: { name: '', isSvg: true },
        });

        node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
        expect(bulkRestoreService.successHandler(node, true)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.PENDING-RESTORE',
            icon: { name: 'autorenew', isSvg: false },
        });

        node.entry.properties['gl:contentState'] = 'RESTORED';
        expect(bulkRestoreService.successHandler(node, true)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.RESTORED',
            icon: { name: 'restore', isSvg: true },
        });

        expect(bulkRestoreService.successHandler(fakeFolder, true)).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.FOLDER',
            icon: { name: 'restore', isSvg: true },
        });

        node.entry.properties['gl:contentState'] = null;
        expect(bulkRestoreService.successHandler(node, false)).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.NOT-STORED',
            icon: { name: 'restore', isSvg: true },
        });
    });

    it('error handler', () => {
        expect(bulkRestoreService.errorHandler()).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.GLACIER.RESTORE.BULK-OPERATION.ERRORS.FAIL',
        });
    });
});
