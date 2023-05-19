/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppStore } from '@alfresco/aca-shared/store';
import { CreateOfficeDocumentAndOpenViewerAction, CreateOfficeDocumentAndStartSessionAction, EXCEL, POWERPOINT, WORD } from '../../store/extension.actions';
import { isMicrosoftOnlinePluginEnabled } from '../../rules/office-online-integration.rules';

@Component({
    selector: 'ooi-create-document-dialog',
    templateUrl: './create-document-dialog.component.html',
    styleUrls: ['./create-document-dialog.component.scss'],
})
export class CreateDocumentDialogComponent implements OnInit {
    fileType: string;
    form: UntypedFormGroup;
    ooiEnabled: boolean;

    private blankDocPath = 'assets/blank-documents';

    private fileTypesOptions = [
        {
            value: WORD,
            extension: '.docx',
            header: 'MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.WORD.HEADER',
            filePath: `${this.blankDocPath}/blank-doc.docx`,
        },
        {
            value: EXCEL,
            extension: '.xlsx',
            header: 'MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.EXCEL.HEADER',
            filePath: `${this.blankDocPath}/blank-xls.xlsx`,
        },
        {
            value: POWERPOINT,
            extension: '.pptx',
            header: 'MICROSOFT-ONLINE.CREATE_DOCUMENT_DIALOG.POWERPOINT.HEADER',
            filePath: `${this.blankDocPath}/blank-ppt.pptx`,
        },
    ];

    constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
                             private dialogRef: MatDialogRef<CreateDocumentDialogComponent>,
                             private store: Store<AppStore>,
                             private formBuilder: UntypedFormBuilder
    ) {
        this.fileType = data.fileType;
        this.ooiEnabled = isMicrosoftOnlinePluginEnabled();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            name: ['', [Validators.required, this.forbidEndingDot, this.forbidOnlySpaces, this.forbidSpecialCharacters]],
            description: ['', Validators.maxLength(512)],
        });
    }

    get description(): string {
        return this.form.value.description;
    }

    get header(): string {
        return this.fileTypesOptions.find((option) => option.value === this.fileType).header;
    }

    get extension(): string {
        return this.fileTypesOptions.find((option) => option.value === this.fileType).extension;
    }

    get filePath(): string {
        return this.fileTypesOptions.find((option) => option.value === this.fileType).filePath;
    }

    get properties(): any {
        return this.description ? { 'cm:description': this.description } : {};
    }

    get fileName(): string {
        return this.form.value.name.trim() + this.extension;
    }

    public onSubmitCreate() {
        if (this.form.valid) {
            this.store.dispatch(new CreateOfficeDocumentAndOpenViewerAction(this.filePath, this.fileName, this.properties));
        }
        this.dialogRef.close();
    }

    public onSubmitCreateAndOpen() {
        if (this.form.valid) {
            this.store.dispatch(new CreateOfficeDocumentAndStartSessionAction(this.filePath, this.fileName, this.properties));
        }
        this.dialogRef.close();
    }

    private forbidSpecialCharacters({ value }: UntypedFormControl): ValidationErrors | null {
        // eslint-disable-next-line no-useless-escape
        const specialCharacters = /([\*\"\<\>\\\/\?\:\|])/;
        const isValid = !specialCharacters.test(value);

        return isValid ? null : { message: `NODE_FROM_TEMPLATE.FORM.ERRORS.SPECIAL_CHARACTERS` };
    }

    private forbidEndingDot({ value }: UntypedFormControl): ValidationErrors | null {
        const isValid: boolean = (value || '').trim().split('').pop() !== '.';

        return isValid ? null : { message: `NODE_FROM_TEMPLATE.FORM.ERRORS.ENDING_DOT` };
    }

    private forbidOnlySpaces({ value }: UntypedFormControl): ValidationErrors | null {
        if (value.length) {
            const isValid = !!(value || '').trim();
            return isValid ? null : { message: `NODE_FROM_TEMPLATE.FORM.ERRORS.ONLY_SPACES` };
        } else {
            return { message: `NODE_FROM_TEMPLATE.FORM.ERRORS.REQUIRED` };
        }
    }
}
