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
import { ReloadDocumentListService } from '../../core/services/reload-document-list.service';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { of, throwError } from 'rxjs';
import { AdminDeleteRecord } from '../actions/record.action';

describe('Admin Deletion Record', () => {
    let store: Store<any>;
    let recordService: RecordService;
    let extendedNotificationService: ExtendedNotificationService;
    let reloadService: ReloadDocumentListService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        recordService = TestBed.inject(RecordService);
        reloadService = TestBed.inject(ReloadDocumentListService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
        spyOn(reloadService, 'emitReloadEffect').and.stub();
    });

    it('should delete record', () => {
        spyOn(recordService, 'deleteRecord').and.returnValue(of(true));
        const node: any = { id: 'id', name: 'fake-name' };
        store.dispatch(new AdminDeleteRecord(node));
        expect(recordService.deleteRecord).toHaveBeenCalledWith(node);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DELETE-RECORD.SUCCESS');
    });

    it('should refresh the document list', () => {
        spyOn(recordService, 'deleteRecord').and.returnValue(of(true));
        const node: any = { id: 'id', name: 'fake-name' };
        store.dispatch(new AdminDeleteRecord(node));
        expect(reloadService.emitReloadEffect).toHaveBeenCalled();
    });

    it('should show a notification when failed', () => {
        spyOn(recordService, 'deleteRecord').and.returnValue(throwError('error'));
        const node: any = { id: 'id', name: 'fake-name' };
        store.dispatch(new AdminDeleteRecord(node));
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.DELETE-RECORD.FAIL');
    });
});
