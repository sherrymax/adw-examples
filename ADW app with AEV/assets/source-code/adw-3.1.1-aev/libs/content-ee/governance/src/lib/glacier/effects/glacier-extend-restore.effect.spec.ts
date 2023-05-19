/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { ExtendedNotificationService } from '../../core/services/extended-notification.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { Node, ActionExecResultEntry } from '@alfresco/js-api';
import { of, throwError } from 'rxjs';
import { GlacierService } from '../services/glacier.service';
import { GlacierExtendRestoreAction } from '../actions/glacier.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

describe('GlacierExtendRestoreEffect', () => {
    let store: Store<any>;
    let glacierService: GlacierService;
    let extendedNotificationService: ExtendedNotificationService;
    let dialog: MatDialog;

    const node: Node = <Node>{
        id: 'id',
        name: 'fake-name',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        store = TestBed.inject(Store);
        glacierService = TestBed.inject(GlacierService);
        extendedNotificationService = TestBed.inject(ExtendedNotificationService);
        dialog = TestBed.inject(MatDialog);
        spyOn(extendedNotificationService, 'sendNotificationMessage');
    });

    it('should restore the record', () => {
        spyOn(glacierService, 'extendRestore').and.returnValue(of({} as ActionExecResultEntry));

        spyOn(glacierService, 'getRestoreCache').and.returnValue({
            type: 'Expedited',
            days: 5,
            initiated: 1557992743390,
        });

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of({ type: 'Expedited', days: 5 }),
        } as MatDialogRef<any>);

        store.dispatch(new GlacierExtendRestoreAction(node));

        expect(glacierService.extendRestore).toHaveBeenCalledWith(node, 'Expedited', 5);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.EXTEND-RESTORE.SUCCESS', {
            days: 5,
            date: '16/May/2019',
        });
    });

    it('should show proper error message when api failed', () => {
        spyOn(glacierService, 'extendRestore').and.returnValue(throwError('error'));

        spyOn(glacierService, 'getRestoreCache').and.returnValue({
            type: 'Expedited',
            days: 5,
        });

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of({ type: 'standard', days: 5 }),
        } as MatDialogRef<any>);

        store.dispatch(new GlacierExtendRestoreAction(node));

        expect(glacierService.extendRestore).toHaveBeenCalledWith(node, 'standard', 5);
        expect(extendedNotificationService.sendNotificationMessage).toHaveBeenCalledWith('GOVERNANCE.GLACIER.EXTEND-RESTORE.FAIL', {
            name: 'fake-name',
        });
    });
});
