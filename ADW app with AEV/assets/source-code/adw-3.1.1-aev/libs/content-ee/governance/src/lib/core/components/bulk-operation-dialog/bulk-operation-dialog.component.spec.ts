/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, ComponentRef, Type } from '@angular/core';
import { BulkOperationDialogComponent } from './bulk-operation-dialog.component';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BulkOperationService } from '../../services/bulk-operation.service';
import { NodeEntry } from '@alfresco/js-api';
import { BulkOperationModel, OperationStatus } from '../../model/bulk-operation.model';

describe('BulkOperationDialogComponent', () => {
    let fixture: ComponentFixture<BulkOperationDialogComponent>;
    const dialogRef = {
        close: jasmine.createSpy('close'),
    };
    let bulkRecordService: BulkOperationService;
    let changeDetectorRef: ChangeDetectorRef;
    let declaredRecordStatus: BulkOperationModel;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BulkOperationDialogComponent);
        bulkRecordService = TestBed.inject(BulkOperationService);
        const componentRef: ComponentRef<BulkOperationDialogComponent> = fixture.componentRef;
        changeDetectorRef = componentRef.injector.get<ChangeDetectorRef>(ChangeDetectorRef as Type<ChangeDetectorRef>);
        spyOn(changeDetectorRef, 'detectChanges').and.callThrough();
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    beforeEach(() => {
        declaredRecordStatus = <BulkOperationModel>{
            node: <NodeEntry>{
                entry: {
                    id: 'fake-node',
                    name: 'fake-node-name',
                    isFile: true,
                },
            },
        };
    });

    it('should show the queued declared record', async () => {
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.nativeElement.querySelector('span[data-automation-id="fake-node-name-name"]')).not.toBeNull();
    });

    it('should close the dialog by clicking close', async () => {
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        fixture.nativeElement.querySelector('button[data-automation-id="bulk-dialog-upload-cancel"]').click();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should show the pending status for record in pending', async () => {
        declaredRecordStatus.status = OperationStatus.Pending;
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.nativeElement.querySelector('mat-icon[data-automation-id="fake-node-name-pending"]')).not.toBeNull();
    });

    it('should show the spinner for record started', async () => {
        declaredRecordStatus.status = OperationStatus.Starting;
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.nativeElement.querySelector('mat-spinner[data-automation-id="fake-node-name-spinner"]')).not.toBeNull();
    });

    it('should show the error status for record in error', async () => {
        declaredRecordStatus.status = OperationStatus.Error;
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.nativeElement.querySelector('mat-icon[data-automation-id="fake-node-name-error"]')).not.toBeNull();
    });

    it('should show the complete status for record completed', async () => {
        declaredRecordStatus.status = OperationStatus.Complete;
        bulkRecordService.queuedOperations.next([declaredRecordStatus]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.nativeElement.querySelector('mat-icon[data-automation-id="fake-node-name-done"]')).not.toBeNull();
    });
});
