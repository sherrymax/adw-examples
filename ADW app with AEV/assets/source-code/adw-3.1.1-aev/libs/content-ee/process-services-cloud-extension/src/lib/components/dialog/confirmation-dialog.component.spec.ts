/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { setupTestBed } from '@alfresco/adf-core';
import { ConfirmationDialogComponent, ConfirmDialogSettings } from './confirmation-dialog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import { TranslateModule } from '@ngx-translate/core';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    const mockDialogData: ConfirmDialogSettings = { title: 'mock-title', message: 'mock-message', action: 'mock-action' };

    setupTestBed({
        imports: [ProcessServicesCloudTestingModule, MatDialogModule, TranslateModule],
        declarations: [ConfirmationDialogComponent],
        providers: [
            { provide: MatDialogRef, useValue: mockDialogRef },
            { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should get data from MAT_DIALOG_DATA as an input to the dialog', () => {
        const data = component.data;
        expect(data).toEqual(mockDialogData);
    });

    it('should be able to display title', () => {
        const dialogTitle = document.querySelector('.mat-dialog-title');
        expect(dialogTitle.textContent).toEqual(mockDialogData.title);
    });

    it('should be able to display message', () => {
        const dialogMessage = document.querySelector('.mat-dialog-content');
        expect(dialogMessage.textContent).toEqual(mockDialogData.message);
    });

    it('should be able close dialog with true on confirm button clicked', () => {
        const confirmButton = fixture.nativeElement.querySelector('[data-automation-id="apa-dialog-confirmation-yes"]');
        confirmButton.click();
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should be able close dialog with false on close button clicked', () => {
        const closeButton = fixture.nativeElement.querySelector('[data-automation-id="apa-dialog-confirmation-no"]');
        closeButton.click();
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
});
