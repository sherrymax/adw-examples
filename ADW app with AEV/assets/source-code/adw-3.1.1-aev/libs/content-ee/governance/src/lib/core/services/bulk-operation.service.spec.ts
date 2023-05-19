/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BulkOperationService } from './bulk-operation.service';
import { NodeEntry, RecordEntry } from '@alfresco/js-api';
import { of, throwError } from 'rxjs';
import { BulkOperationModel, OperationStatus } from '../model/bulk-operation.model';

describe('BulkOperationService', () => {
    const fakeNodeEntryRecord = {
        entry: {
            id: 'fake-node-record',
            name: 'fake-node-name-record',
            isFile: true,
            aspectNames: ['rma:declaredRecord'],
            allowableOperations: ['update'],
        },
    } as NodeEntry;

    const fakeNodeRejectedRecord = {
        entry: {
            id: 'fake-node-record-rejected',
            name: 'fake-node-name-record-rejected',
            isFile: true,
            aspectNames: ['rma:recordRejectionDetails'],
            allowableOperations: ['update'],
        },
    } as NodeEntry;

    const fakeNodeEntryNonRecord = {
        entry: {
            id: 'fake-node',
            name: 'fake-node-name',
            isFile: true,
            allowableOperations: ['update'],
        },
    } as NodeEntry;

    const fakeNodeEntryFolder = {
        entry: {
            id: 'fake-node-folder',
            name: 'fake-node-name-folder',
            isFolder: true,
            isFile: false,
            allowableOperations: ['update'],
        },
    } as NodeEntry;

    const fakeRecord = { entry: { id: 'recorded' } } as RecordEntry;
    const nodeFakeListNoRecord = [
        new BulkOperationModel({
            node: fakeNodeEntryNonRecord,
            api: of(fakeRecord),
        }),
    ];
    const nodeFakeListNoRecordError = [
        new BulkOperationModel({
            node: fakeNodeEntryNonRecord,
            api: throwError('ERROR'),
        }),
    ];
    const nodeFakeListRejected = [
        new BulkOperationModel({
            node: fakeNodeRejectedRecord,
            api: of(fakeRecord),
        }),
    ];

    let contentService: any;
    let bulkRecordService: BulkOperationService;

    beforeEach(() => {
        contentService = jasmine.createSpyObj('ContentService', ['hasAllowableOperations']);
        contentService.hasAllowableOperations.and.returnValue(true);

        bulkRecordService = new BulkOperationService();
    });

    afterEach(() => {
        bulkRecordService.clearQueue();
    });

    it('should clear the queued elements', () => {
        const nodeFakeListWithRecord = [
            new BulkOperationModel({
                node: fakeNodeEntryRecord,
                api: of(fakeRecord),
            }),
        ];
        bulkRecordService.addToQueue(nodeFakeListWithRecord);
        let qLength = 0;
        bulkRecordService.queuedOperations.subscribe((queuedElements) => {
            qLength = queuedElements.length;
        });
        bulkRecordService.clearQueue();
        expect(qLength).toBe(0);
    });

    it('should send an event when process is started', (done) => {
        const nodeFakeListWithRecord = [
            new BulkOperationModel({
                node: fakeNodeEntryRecord,
                api: of(fakeRecord),
            }),
        ];
        bulkRecordService.operationStarted.subscribe((startedNode) => {
            expect(startedNode.node.entry.id).toBe(fakeNodeEntryRecord.entry.id);
            expect(startedNode.node.entry.name).toBe(fakeNodeEntryRecord.entry.name);
            done();
        });
        bulkRecordService.addToQueue(nodeFakeListWithRecord);
    });

    it('should show a status complete when the operation is success', (done) => {
        bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
            expect(recordCompleted.status).toBe(OperationStatus.Complete, 'Wrong Record Status');
            expect(recordCompleted.message).toBe('');
            done();
        });
        bulkRecordService.addToQueue(nodeFakeListNoRecord);
    });

    it('should show a status complete when a operation is succeed', (done) => {
        bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
            expect(recordCompleted.status).toBe(OperationStatus.Complete, 'Wrong Record Status');
            expect(recordCompleted.message).toBe('');
            done();
        });
        bulkRecordService.addToQueue(nodeFakeListRejected);
    });

    it('should return error when the operation fails', (done) => {
        bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
            expect(recordCompleted.status).toBe(OperationStatus.Error, 'Wrong Record Status');
            expect(recordCompleted.message).toBe('GOVERNANCE.BULK-OPERATION.FAIL');
            done();
        });
        bulkRecordService.addToQueue(nodeFakeListNoRecordError);
    });

    describe('custom handler', () => {
        const fakeFolderHandler = () =>
            new Object({
                status: OperationStatus.Complete,
                message: 'GOVERNANCE.DECLARE-RECORD.BULK-RECORD-STATUS.EXISTING-RECORD',
            });

        const fakeFailHandler = () =>
            new Object({
                status: OperationStatus.Error,
                message: 'Failed to perform operation',
            });
        const fakeHandler = () =>
            new Object({
                status: OperationStatus.Error,
                message: 'GOVERNANCE.DECLARE-RECORD.BULK-RECORD-STATUS.FOLDER',
                icon: { name: 'fake-name', isSvg: true },
            });

        const nodeFakeListFolder = [
            new BulkOperationModel({
                node: fakeNodeEntryFolder,
                api: of(true),
                successHandler: fakeHandler.bind(this),
            }),
        ];

        it('should return custom error when api failed', (done) => {
            const errorOperation = [
                new BulkOperationModel({
                    node: fakeNodeEntryNonRecord,
                    api: throwError('ERROR'),
                    errorHandler: fakeFailHandler.bind(this),
                }),
            ];
            bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
                expect(recordCompleted.status).toBe(OperationStatus.Error, 'Wrong Record Status');
                expect(recordCompleted.message).toBe('Failed to perform operation');
                done();
            });
            bulkRecordService.addToQueue(errorOperation);
        });

        it('should show a status error when the node is a folder', (done) => {
            bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
                expect(recordCompleted.status).toBe(OperationStatus.Error, 'Wrong Record Status');
                expect(recordCompleted.message).toBe('GOVERNANCE.DECLARE-RECORD.BULK-RECORD-STATUS.FOLDER');
                done();
            });
            bulkRecordService.addToQueue(nodeFakeListFolder);
        });

        it('should show a status completed when the node is already completed', (done) => {
            const nodeFakeListWithRecord = [
                new BulkOperationModel({
                    node: fakeNodeEntryRecord,
                    api: of(fakeRecord),
                    successHandler: fakeFolderHandler.bind(this),
                }),
            ];
            bulkRecordService.operationCompleted.subscribe((recordCompleted) => {
                expect(recordCompleted.status).toBe(OperationStatus.Complete, 'Wrong Record Status');
                expect(recordCompleted.message).toBe('GOVERNANCE.DECLARE-RECORD.BULK-RECORD-STATUS.EXISTING-RECORD');
                done();
            });
            bulkRecordService.addToQueue(nodeFakeListWithRecord);
        });
    });
});
