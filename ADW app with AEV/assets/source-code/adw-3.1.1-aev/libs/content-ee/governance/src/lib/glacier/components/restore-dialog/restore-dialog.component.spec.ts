/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestoreDialogComponent } from './restore-dialog.component';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { setupTestBed } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioGroup } from '@angular/material/radio';

describe('RestoreDialogComponent', () => {
    let component: RestoreDialogComponent;
    let fixture: ComponentFixture<RestoreDialogComponent>;

    setupTestBed({
        imports: [GovernanceTestingModule],
        providers: [{ provide: MAT_DIALOG_DATA, useValue: { data: {} } }],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RestoreDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('canShowTypes', () => {
        it('should not show the types if CanShow is false', () => {
            component.canShowTypes = false;
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('[data-automation-id="restore-type"]'));
            expect(nameElement).toBeFalsy();
            expect(component.form.controls['type'].value).toEqual('Bulk');
            expect(component.form.valid).toBeTruthy();
        });

        it('should show the types if CanShow is true', () => {
            component.canShowTypes = true;
            fixture.detectChanges();
            const radioElement = fixture.debugElement.query(By.css('.mat-radio-checked'));
            expect(radioElement.nativeElement).toBeTruthy();
            const radioButton = <MatRadioGroup>radioElement.componentInstance;
            expect(radioButton.value).toEqual('Bulk');
        });
    });

    it('should show default value', () => {
        expect(component.form.controls['type'].value).toEqual('Bulk');
        expect(component.form.valid).toBeTruthy();
        expect(fixture.debugElement.query(By.css('h1')).nativeElement.innerHTML).toBe('GOVERNANCE.GLACIER.RESTORE.DIALOG.TITLE');
    });

    it('should not enable yes button when days is null', () => {
        component.form.controls['type'].setValue('Expedited');
        component.form.controls['days'].setValue(null);
        expect(component.form.valid).toBeFalsy();
        fixture.detectChanges();
        const nameElement = fixture.debugElement.query(By.css('[data-automation-id="restore-yes-action"]'));
        expect(nameElement.nativeElement.disabled).toBeTruthy();
    });

    it('should not enable yes button when form is invalid', () => {
        component.form.controls['type'].setValue(null);
        component.form.controls['days'].setValue(1);
        expect(component.form.valid).toBeFalsy();
        fixture.detectChanges();
        component.form.controls['days'].setValue(0);
        expect(component.form.valid).toBeFalsy();
        fixture.detectChanges();
        component.form.controls['days'].setValue(1001);
        expect(component.form.valid).toBeFalsy();
        fixture.detectChanges();
        const nameElement = fixture.debugElement.query(By.css('[data-automation-id="restore-yes-action"]'));
        expect(nameElement.nativeElement.disabled).toBeTruthy();
    });

    it('should enable yes button when both type and days are there', () => {
        component.form.controls['type'].setValue('Expedited');
        component.form.controls['days'].setValue(1);
        expect(component.form.valid).toBeTruthy();
        fixture.detectChanges();
        const nameElement = fixture.debugElement.query(By.css('[data-automation-id="restore-yes-action"]'));
        expect(nameElement.nativeElement.disabled).toBeFalsy();
    });
});
