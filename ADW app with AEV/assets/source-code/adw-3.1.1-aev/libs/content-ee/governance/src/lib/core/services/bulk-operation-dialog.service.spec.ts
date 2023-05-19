/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BulkOperationDialogService } from './bulk-operation-dialog.service';
import { of, Subject } from 'rxjs';
import { NodeEntry } from '@alfresco/js-api';
import { BulkOperationModel } from '../model/bulk-operation.model';

describe('BulkOperationDialogService', () => {
    let fakeRecord: NodeEntry;
    let nodeFakeListNoRecord: BulkOperationModel[];
    const bulkRecordService: any = jasmine.createSpyObj('BulkOperationService', ['addToQueue']);

    beforeEach(() => {
        fakeRecord = <NodeEntry>{
            entry: {
                id: 'fake-node',
                name: 'fake-node-name',
                isFile: true,
                allowableOperations: ['update'],
            },
        };

        nodeFakeListNoRecord = [new BulkOperationModel({ node: fakeRecord })];
    });

    describe('When the dialog is not opened', () => {
        const dialog: any = jasmine.createSpyObj('MatDialog', ['open']);
        const bulkDeclareDialogService = new BulkOperationDialogService(dialog, bulkRecordService);

        beforeEach(() => {
            dialog.open.and.returnValue({
                afterOpened: () => of(true),
                afterClosed: () => of(true),
            });
        });

        it('should return false when the dialog is closed', () => {
            expect(bulkDeclareDialogService.isDialogOpened()).toBeFalsy();
        });

        it('should open the dialog when a new bulk operation is requested', () => {
            bulkDeclareDialogService.declareBulkRecords(nodeFakeListNoRecord);
            expect(dialog.open).toHaveBeenCalled();
        });

        it('should append the nodes to the queue after the dialog was opened', () => {
            bulkDeclareDialogService.declareBulkRecords(nodeFakeListNoRecord);
            expect(bulkRecordService.addToQueue).toHaveBeenCalledWith(nodeFakeListNoRecord);
        });
    });

    describe('When the dialog is already opened', () => {
        let dialog: any;
        let bulkDeclareDialogService: BulkOperationDialogService;
        let closeDialogSubject: Subject<any>;

        beforeEach(() => {
            dialog = jasmine.createSpyObj('MatDialog', ['open']);
            bulkDeclareDialogService = new BulkOperationDialogService(dialog, bulkRecordService);
            closeDialogSubject = new Subject();

            dialog.open.and.returnValue({
                afterOpened: () => of(true),
                afterClosed: () => closeDialogSubject,
            });
        });

        it('should not open a new dialog', () => {
            bulkDeclareDialogService.declareBulkRecords(nodeFakeListNoRecord);
            expect(bulkDeclareDialogService.isDialogOpened()).toBeTruthy();
            bulkDeclareDialogService.declareBulkRecords(nodeFakeListNoRecord);
            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(bulkRecordService.addToQueue).toHaveBeenCalledWith(nodeFakeListNoRecord);
            closeDialogSubject.next();
        });

        it('should return false once the dialog has been closed', () => {
            bulkDeclareDialogService.declareBulkRecords(nodeFakeListNoRecord);
            expect(bulkDeclareDialogService.isDialogOpened()).toBeTruthy();
            closeDialogSubject.next();
            expect(bulkDeclareDialogService.isDialogOpened()).toBeFalsy();
        });
    });
});
