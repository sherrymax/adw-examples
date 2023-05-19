/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { Store } from '@ngrx/store';
import { RecordService } from '../services/record.service';
import { DeclareRecordAction } from '../actions/record.action';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { BulkRecordService } from '../services/bulk-declare-record.service';
import { ContentApiService } from '@alfresco-dbp/content-ce/shared';
import { SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { RecordEntry } from '@alfresco/js-api';

describe('Declare Record', () => {
    let store: Store<any>;
    let recordService: RecordService;
    let extendedNotificationService: ExtendedNotificationService;
    let bulkRecordService: BulkRecordService;
    let contentApiService: ContentApiService;
    let dialog: MatDialog;
    let removeRecordSpy: jasmine.Spy;
    let declareRecordSpy: jasmine.Spy;
    let nodeInfoSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        recordService = TestBed.inject(RecordService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        bulkRecordService = TestBed.inject(BulkRecordService);
        contentApiService = TestBed.inject(ContentApiService);
        dialog = TestBed.inject(MatDialog);
        declareRecordSpy = spyOn(recordService, 'declareNodeRecord');
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        removeRecordSpy = spyOn(recordService, 'removeNodeRejectedWarning');
        nodeInfoSpy = spyOn(contentApiService, 'getNode');
    });

    describe('single declaration', () => {
        it('should create record', () => {
            spyOn(store, 'dispatch').and.callThrough();
            nodeInfoSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            declareRecordSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            const node: any = [{ entry: { id: 'id', name: 'fake-name' } }];
            store.dispatch(new DeclareRecordAction(node));
            expect(recordService.declareNodeRecord).toHaveBeenCalledWith(node[0].entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DECLARE-RECORD.SUCCESS', {
                fileName: 'fake-name',
            });
            expect(store.dispatch).toHaveBeenCalledTimes(3);
            expect(store.dispatch['calls'].argsFor(2)).toEqual([new SetSelectedNodesAction([<any>{ entry: { name: 'fake-record' } }])]);
        });

        it('should emit the failed node when declaration failed', () => {
            spyOn(recordService.declaredSingleRecord$, 'next').and.callThrough();
            declareRecordSpy.and.returnValue(throwError('error'));
            const node: any = [{ entry: { id: 'id', name: 'fake-name' } }];
            store.dispatch(new DeclareRecordAction(node));
            expect(recordService.declareNodeRecord).toHaveBeenCalledWith(node[0].entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DECLARE-RECORD.FAIL', {
                fileName: 'fake-name',
            });
            expect(recordService.declaredSingleRecord$.next).toHaveBeenCalledTimes(2);
            expect(recordService.declaredSingleRecord$.next['calls'].argsFor(0)).toEqual([node[0]]);
            expect(recordService.declaredSingleRecord$.next['calls'].argsFor(1)).toEqual([{ ...node[0], status: 'failed' }]);
        });

        it('should remove warning and declare record', () => {
            spyOn(store, 'dispatch').and.callThrough();
            nodeInfoSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            declareRecordSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            removeRecordSpy.and.returnValue(of({ entry: {} }));
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<any>);
            const node: any = [
                {
                    entry: {
                        id: 'id',
                        name: 'fake-name',
                        aspectNames: ['rma:recordRejectionDetails'],
                    },
                },
            ];
            store.dispatch(new DeclareRecordAction(node));
            expect(recordService.removeNodeRejectedWarning).toHaveBeenCalledWith(node[0].entry);
            expect(recordService.declareNodeRecord).toHaveBeenCalledWith(node[0].entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DECLARE-RECORD.SUCCESS', {
                fileName: 'fake-name',
            });
            expect(store.dispatch).toHaveBeenCalledTimes(3);
            expect(store.dispatch['calls'].argsFor(2)).toEqual([new SetSelectedNodesAction([<any>{ entry: { name: 'fake-record' } }])]);
        });

        it('should not declare record if remove warning failed', () => {
            declareRecordSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            removeRecordSpy.and.returnValue(throwError('error'));
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(true),
            } as MatDialogRef<any>);
            const node: any = [
                {
                    entry: {
                        id: 'id',
                        name: 'fake-name',
                        aspectNames: ['rma:recordRejectionDetails'],
                    },
                },
            ];
            store.dispatch(new DeclareRecordAction(node));
            expect(recordService.removeNodeRejectedWarning).toHaveBeenCalledWith(node[0].entry);
            expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.REJECTED-INFO-RECORD.FAILED-REMOVE');
            expect(recordService.declareNodeRecord).not.toHaveBeenCalled();
        });

        it('should not declare record if user clicked NO', () => {
            declareRecordSpy.and.returnValue(of({ entry: { name: 'fake-record' } }));
            removeRecordSpy.and.returnValue(of({ entry: {} }));
            spyOn(dialog, 'open').and.returnValue({
                afterClosed: () => of(false),
            } as MatDialogRef<any>);
            const node: any = [
                {
                    entry: {
                        id: 'id',
                        aspectNames: ['rma:recordRejectionDetails'],
                    },
                },
            ];
            store.dispatch(new DeclareRecordAction(node));
            expect(recordService.removeNodeRejectedWarning).not.toHaveBeenCalled();
            expect(recordService.declareNodeRecord).not.toHaveBeenCalled();
        });
    });

    describe('Bulk declarations', () => {
        it('should declare when more than one file selected', fakeAsync(() => {
            spyOn(bulkRecordService, 'declareBulkRecords').and.stub();
            spyOn(recordService, 'declareRejectedRecord').and.returnValue(of({ entry: {} } as RecordEntry));

            removeRecordSpy.and.returnValue(of({ entry: {} }));
            const node: any = [
                {
                    entry: {
                        id: 'id',
                        isFile: true,
                        aspectNames: [],
                        allowableOperations: ['update'],
                    },
                },
                {
                    entry: {
                        id: 'id',
                        isFile: true,
                        aspectNames: ['rma:recordRejectionDetails'],
                        allowableOperations: ['update'],
                    },
                },
            ];
            store.dispatch(new DeclareRecordAction(node));
            tick();

            expect(bulkRecordService.declareBulkRecords).toHaveBeenCalledTimes(1);
            expect(bulkRecordService.declareBulkRecords).toHaveBeenCalledWith(node);
        }));

        it('should send to the dialog also already declare records', () => {
            spyOn(bulkRecordService, 'declareBulkRecords').and.stub();
            spyOn(recordService, 'declareRejectedRecord').and.returnValue(of({ entry: {} } as RecordEntry));
            removeRecordSpy.and.returnValue(of({ entry: {} }));
            const node: any = [
                {
                    entry: {
                        id: 'id',
                        isFile: false,
                        aspectNames: [],
                        allowableOperations: ['update'],
                    },
                },
                {
                    entry: {
                        id: 'id',
                        isFile: true,
                        aspectNames: ['rma:record'],
                        allowableOperations: ['update'],
                    },
                },
                {
                    entry: {
                        id: 'id',
                        isFile: true,
                        aspectNames: [],
                        allowableOperations: ['update'],
                    },
                },
                {
                    entry: {
                        id: 'id',
                        isFile: true,
                        aspectNames: [],
                        allowableOperations: [],
                    },
                },
            ];
            store.dispatch(new DeclareRecordAction(node));
            expect(bulkRecordService.declareBulkRecords).toHaveBeenCalledTimes(1);
            expect(bulkRecordService.declareBulkRecords).toHaveBeenCalledWith(node);
        });
    });
});
