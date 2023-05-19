/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { Store } from '@ngrx/store';
import { DeleteRecordAction } from '../actions/record.action';
import { of, throwError } from 'rxjs';
import { RecordService } from '../services/record.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Node } from '@alfresco/js-api';
import { ReloadDocumentListAction } from '@alfresco-dbp/content-ce/shared/store';

describe('delete record Effect', () => {
    let store: Store<any>;
    let node: Node;
    let recordService: RecordService;
    let extendedNotificationService: ExtendedNotificationService;
    let dialog: MatDialog;
    let deleteSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        recordService = TestBed.inject(RecordService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        dialog = TestBed.inject(MatDialog);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        deleteSpy = spyOn(recordService, 'hideRecord');

        node = { id: 'id', name: 'fake-name', properties: {} } as Node;
    });

    it('should delete the record', () => {
        spyOn(store, 'dispatch').and.callThrough();
        deleteSpy.and.returnValue(of({ entry: {} }));
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<any>);
        node.properties['rma:identifier'] = '123';
        node.name = 'abc (123).png';
        store.dispatch(new DeleteRecordAction(node));
        expect(recordService.hideRecord).toHaveBeenCalledWith(node);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DELETE-RECORD.SUCCESS', {
            name: 'abc.png',
        });
        expect(store.dispatch).toHaveBeenCalledTimes(3);
        expect(store.dispatch['calls'].argsFor(2)).toEqual([new ReloadDocumentListAction()]);
    });

    it('show error message when hide record failed', () => {
        deleteSpy.and.returnValue(throwError('error'));
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<any>);
        store.dispatch(new DeleteRecordAction(node));
        expect(recordService.hideRecord).toHaveBeenCalledWith(node);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DELETE-RECORD.FAIL', {
            recordId: 'id',
        });
    });

    it('should not call delete when we pressed NO', () => {
        deleteSpy.and.returnValue(throwError('error'));
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(false),
        } as MatDialogRef<any>);
        store.dispatch(new DeleteRecordAction(node));
        expect(recordService.hideRecord).not.toHaveBeenCalled();
    });
});
