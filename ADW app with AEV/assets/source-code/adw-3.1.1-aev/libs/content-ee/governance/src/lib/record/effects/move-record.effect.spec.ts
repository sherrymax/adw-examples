/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { RecordService } from '../services/record.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { MoveRecordAction } from '../actions/record.action';
import { MoveRecordDialogService } from '../services/move-record-dialog.service';
import { Node, NodePaging } from '@alfresco/js-api';
import { of } from 'rxjs';

describe('Admin Deletion Record', () => {
    let store: Store<any>;
    let recordService: RecordService;
    let extendedNotificationService: ExtendedNotificationService;
    let reloadService: ReloadDocumentListService;
    let moveRecordDialogService: MoveRecordDialogService;

    const node: Node = <Node>{
        id: 'id',
        name: 'fake-name',
        properties: { 'rma:recordOriginatingLocation': 'fake-origin-id' },
    };
    const correctFakeDestination: Node[] = [<Node>{ id: 'destination-id', name: 'fake-destination' }];
    const wrongFakeDestination: Node[] = [<Node>{ id: 'fake-origin-id', name: 'wrong-fake-destination' }];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        recordService = TestBed.inject(RecordService);
        reloadService = TestBed.inject(ReloadDocumentListService);
        moveRecordDialogService = TestBed.inject(MoveRecordDialogService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        spyOn(reloadService, 'emitReloadEffect').and.stub();
    });

    it('should move a record with a valid selection', () => {
        spyOn(moveRecordDialogService, 'openMoveRecordDialog').and.returnValue(of(correctFakeDestination));
        spyOn(recordService, 'moveRecord').and.returnValue(of({} as NodePaging));
        store.dispatch(new MoveRecordAction(node));

        expect(recordService.moveRecord).toHaveBeenCalledWith(node, correctFakeDestination[0]);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.MOVE-RECORD.SUCCESSFUL');
        expect(reloadService.emitReloadEffect).toHaveBeenCalled();
    });

    it('should prevent the move when same node origin folder is selected', () => {
        spyOn(moveRecordDialogService, 'openMoveRecordDialog').and.returnValue(of(wrongFakeDestination));
        spyOn(recordService, 'moveRecord').and.returnValue(of({} as NodePaging));
        store.dispatch(new MoveRecordAction(node));

        expect(recordService.moveRecord).not.toHaveBeenCalled();
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.MOVE-RECORD.SAME-FOLDER-MOVE');
        expect(reloadService.emitReloadEffect).not.toHaveBeenCalled();
    });
});
