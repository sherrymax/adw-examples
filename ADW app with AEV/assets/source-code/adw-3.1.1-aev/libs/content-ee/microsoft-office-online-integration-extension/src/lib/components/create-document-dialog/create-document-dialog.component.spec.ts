/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule, setupTestBed, TranslateLoaderService } from '@alfresco/adf-core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { MaterialModule } from '../../material.module';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateOfficeDocumentAndOpenViewerAction, CreateOfficeDocumentAndStartSessionAction, EXCEL, POWERPOINT, WORD } from '../../store/extension.actions';
import { CreateDocumentDialogComponent } from './create-document-dialog.component';

function text(length: number) {
    return new Array(length).fill(Math.random().toString().substring(2, 3)).join('');
}

describe('CreateDocumentDialogComponent', () => {
    let component: CreateDocumentDialogComponent;
    let fixture: ComponentFixture<CreateDocumentDialogComponent>;
    let dialogRef: MatDialogRef<any>;
    let store: Store<any>;

    setupTestBed({
        imports: [
            NoopAnimationsModule,
            CoreModule.forRoot(),
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateLoaderService,
                },
            }),
            MaterialModule,
            MatRadioModule,
            StoreModule.forRoot({ app: () => {} }, { initialState: {} }),
        ],
        providers: [
            {
                provide: MatDialogRef,
                useValue: {
                    close: jasmine.createSpy('close'),
                    open: jasmine.createSpy('open'),
                },
            },
            {
                provide: Store,
                useValue: {
                    dispatch: jasmine.createSpy('dispatch'),
                },
            },
            { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
        declarations: [CreateDocumentDialogComponent],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateDocumentDialogComponent);
        dialogRef = TestBed.inject(MatDialogRef);
        store = TestBed.inject(Store);
        component = fixture.componentInstance;
        component.fileType = WORD;
        component.ooiEnabled = true;
    });

    it('should display "Create and Open" button if ooi is enabled', () => {
        component.ooiEnabled = true;
        fixture.detectChanges();

        const element = document.getElementById('adw-create-and-open-dialog-button');
        expect(element).not.toEqual(null);
    });

    it('should not display "Create and Open" button if ooi is NOT enabled', () => {
        component.ooiEnabled = false;
        fixture.detectChanges();

        const element = document.getElementById('adw-create-and-open-dialog-button');
        expect(element).toEqual(null);
    });

    it('should not have primary themed "Create" button when ooiEnabled', () => {
        component.ooiEnabled = true;
        fixture.detectChanges();

        const elementContainsClass = document.getElementById('adw-create-dialog-button').classList.contains('adf-dialog-action-button');
        expect(elementContainsClass).toEqual(false);
    });

    it('should have primary themed "Create" button when !ooiEnabled', () => {
        component.ooiEnabled = false;
        fixture.detectChanges();

        const elementContainsClass = document.getElementById('adw-create-dialog-button').classList.contains('adf-dialog-action-button');
        expect(elementContainsClass).toEqual(true);
    });

    it('should return .docx for WORD fileType', () => {
        component.fileType = WORD;
        fixture.detectChanges();

        expect(component.extension).toEqual('.docx');
    });

    it('should return .xlsx for EXCEL fileType', () => {
        component.fileType = EXCEL;
        fixture.detectChanges();

        expect(component.extension).toEqual('.xlsx');
    });

    it('should return .pptx for POWERPOINT fileType', () => {
        component.fileType = POWERPOINT;
        fixture.detectChanges();

        expect(component.extension).toEqual('.pptx');
    });

    it('should return form `name` field with `.docx` extension when fileType=WORD', () => {
        component.fileType = WORD;
        fixture.detectChanges();

        component.form.controls.name.setValue('My New File');
        fixture.detectChanges();

        expect(component.fileName).toEqual('My New File.docx');
    });

    it('should return form `name` field with `.xlsx` extension when fileType=EXCEL', () => {
        component.fileType = EXCEL;
        fixture.detectChanges();

        component.form.controls.name.setValue('My New File');
        fixture.detectChanges();

        expect(component.fileName).toEqual('My New File.xlsx');
    });

    it('should return form `name` field with `.pptx` extension when fileType=POWERPOINT', () => {
        component.fileType = POWERPOINT;
        fixture.detectChanges();

        component.form.controls.name.setValue('My New File');
        fixture.detectChanges();

        expect(component.fileName).toEqual('My New File.pptx');
    });

    it('should return form `description` field as object with `cm:description` field', () => {
        fixture.detectChanges();
        const description = 'Very important new business document.';
        component.form.controls.description.setValue(description);
        fixture.detectChanges();

        const expectedProperties = jasmine.objectContaining({ 'cm:description': description });

        expect(component.properties).toEqual(expectedProperties);
    });

    it('should return correct header with for WORD files ', () => {
        component.fileType = WORD;
        fixture.detectChanges();

        expect(component.header).toEqual('MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.WORD.HEADER');
    });

    it('should return correct header with for EXCEL files ', () => {
        component.fileType = EXCEL;
        fixture.detectChanges();

        expect(component.header).toEqual('MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.EXCEL.HEADER');
    });

    it('should return correct header with for POWERPOINT files ', () => {
        component.fileType = POWERPOINT;
        fixture.detectChanges();

        expect(component.header).toEqual('MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.POWERPOINT.HEADER');
    });

    it('should invalidate form if required `name` field is invalid', () => {
        fixture.detectChanges();

        component.form.controls.name.setValue('');
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
    });

    it('should invalidate form if required `name` field has `only spaces`', () => {
        fixture.detectChanges();

        component.form.controls.name.setValue('   ');
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
    });

    it('should invalidate form if required `name` field has `ending dot`', () => {
        fixture.detectChanges();

        component.form.controls.name.setValue('something.');
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
    });

    it('should invalidate form if required `name` field has `special char`', () => {
        fixture.detectChanges();

        component.form.controls.name.setValue('"');
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
    });

    it('should invalidate form if `description` text length is long', () => {
        fixture.detectChanges();

        component.form.controls.description.setValue(text(520));
        fixture.detectChanges();

        expect(component.form.invalid).toBe(true);
    });

    it('should close dialog if clicked on cancel', () => {
        const closeButtonElement = document.getElementById('adw-end-dialog-button');
        closeButtonElement.click();
        fixture.detectChanges();

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should dispatch create and open viewer action if clicked on "Create" button clicked', () => {
        fixture.detectChanges();

        const fileName = 'New File';
        const description = 'This is my new file';
        component.form.controls.name.setValue(fileName);
        component.form.controls.description.setValue(description);
        fixture.detectChanges();

        const expectedFileName = `${fileName}.docx`;
        const expectedFilePath = 'assets/blank-documents/blank-doc.docx';
        const expectedProperties = { 'cm:description': description };

        const createButtonElement = document.getElementById('adw-create-dialog-button');
        createButtonElement.click();
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new CreateOfficeDocumentAndOpenViewerAction(expectedFilePath, expectedFileName, expectedProperties));
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should dispatch create and start session action if clicked on "Create and Open" button clicked', () => {
        fixture.detectChanges();

        const fileName = 'New File';
        const description = 'This is my new file';
        component.form.controls.name.setValue(fileName);
        component.form.controls.description.setValue(description);
        fixture.detectChanges();

        const expectedFileName = `${fileName}.docx`;
        const expectedFilePath = 'assets/blank-documents/blank-doc.docx';
        const expectedProperties = { 'cm:description': description };

        const createAndOpenButtonElement = document.getElementById('adw-create-and-open-dialog-button');
        createAndOpenButtonElement.click();
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new CreateOfficeDocumentAndStartSessionAction(expectedFilePath, expectedFileName, expectedProperties));
        expect(dialogRef.close).toHaveBeenCalled();
    });
});
