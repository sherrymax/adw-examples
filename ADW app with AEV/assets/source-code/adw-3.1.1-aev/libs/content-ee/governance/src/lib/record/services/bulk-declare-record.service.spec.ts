/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { BulkRecordService } from './bulk-declare-record.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { OperationStatus } from '../../core/model/bulk-operation.model';
import { BulkOperationDialogService } from '../../core/services/bulk-operation-dialog.service';
import { RecordService } from './record.service';
import { setupTestBed } from '@alfresco/adf-core';
import { NodeEntry, RecordEntry } from '@alfresco/js-api';
import { of } from 'rxjs';
import { fakeNode, fakeRecord } from '../rules/mock-data';

describe('BulkRecordService', () => {
    let recordService: RecordService;
    let bulkOperationDialogService: BulkOperationDialogService;
    let bulkRecordService: BulkRecordService;
    const fakeFolder = <NodeEntry>{
        entry: {
            id: 'abc',
            name: 'fake-abc',
            isFolder: true,
            allowableOperations: ['update'],
        },
    };

    setupTestBed({
        imports: [GovernanceTestingModule],
    });

    beforeEach(() => {
        bulkRecordService = TestBed.inject(BulkRecordService);
        bulkOperationDialogService = TestBed.inject(BulkOperationDialogService);
        recordService = TestBed.inject(RecordService);
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
            <NodeEntry>{
                entry: {
                    id: 'abc',
                    name: 'fake-abc',
                    isFile: true,
                    aspectNames: ['rma:recordRejectionDetails'],
                    allowableOperations: ['update'],
                },
            },
            fakeFolder,
        ];
        spyOn(recordService, 'declareNodeRecord').and.returnValues(of(nodes[0] as RecordEntry));
        spyOn(recordService, 'declareRejectedRecord').and.returnValues(of(nodes[1] as RecordEntry));
        spyOn(bulkOperationDialogService, 'declareBulkRecords').and.callThrough();
        bulkRecordService.declareBulkRecords(nodes);
        expect(recordService.declareNodeRecord).toHaveBeenCalledTimes(1);
        expect(recordService.declareRejectedRecord).toHaveBeenCalledTimes(1);
        done();
    });

    it('success handler', () => {
        expect(bulkRecordService.successHandler(fakeRecord)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.DECLARE-RECORD.BULK-OPERATION.ERRORS.EXISTING-RECORD',
            icon: { name: 'record', isSvg: true },
        });

        expect(bulkRecordService.successHandler(fakeNode)).toEqual({
            status: OperationStatus.Complete,
            message: 'GOVERNANCE.DECLARE-RECORD.BULK-OPERATION.SUCCESS',
            icon: { name: '', isSvg: true },
        });

        expect(bulkRecordService.successHandler(fakeFolder)).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.DECLARE-RECORD.BULK-OPERATION.ERRORS.FOLDER',
            icon: { name: 'record', isSvg: true },
        });
    });

    it('error handler', () => {
        expect(bulkRecordService.errorHandler()).toEqual({
            status: OperationStatus.Error,
            message: 'GOVERNANCE.DECLARE-RECORD.BULK-OPERATION.ERRORS.FAILED',
        });
    });
});
