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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RecordService } from '../services/record.service';
import { RemoveRejectedWarningAction } from '../actions/record.action';

describe('RejectRecordEffect', () => {
    let store: Store<any>;
    let recordService: RecordService;
    let extendedNotificationService: ExtendedNotificationService;
    let reloadService: ReloadDocumentListService;
    let dialog: MatDialog;

    const node: NodeEntry = <NodeEntry>{
        entry: {
            id: 'id',
            name: 'fake-name',
            aspectNames: [],
        },
    };

    const response = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            aspectNames: [],
            allowableOperations: [],
            properties: {},
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        recordService = TestBed.inject(RecordService);
        reloadService = TestBed.inject(ReloadDocumentListService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        dialog = TestBed.inject(MatDialog);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        spyOn(reloadService, 'emitReloadEffect').and.stub();
    });

    it('should call the api when yes clicked from dialog', () => {
        spyOn(recordService, 'removeNodeRejectedWarning').and.returnValue(of(response));

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<any>);

        store.dispatch(new RemoveRejectedWarningAction(node));

        expect(recordService.removeNodeRejectedWarning).toHaveBeenCalledWith(node.entry);
        expect(extendedNotificationService.sendNotificationMessage).not.toHaveBeenCalled();
        expect(reloadService.emitReloadEffect).toHaveBeenCalled();
    });

    it('should not call the api when no pressed from api', () => {
        spyOn(recordService, 'removeNodeRejectedWarning').and.stub();
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(false),
        } as MatDialogRef<any>);

        store.dispatch(new RemoveRejectedWarningAction(node));

        expect(recordService.removeNodeRejectedWarning).not.toHaveBeenCalled();
        expect(extendedNotificationService.sendNotificationMessage).not.toHaveBeenCalled();
        expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
    });

    it('should show proper error message when api failed', () => {
        spyOn(recordService, 'removeNodeRejectedWarning').and.returnValue(throwError('error'));

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<any>);

        store.dispatch(new RemoveRejectedWarningAction(node));

        expect(recordService.removeNodeRejectedWarning).toHaveBeenCalledWith(node.entry);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.REJECTED-INFO-RECORD.FAILED-REMOVE', {
            nodeName: 'fake-name',
            errorMessage: 'error',
        });
        expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
    });
});
