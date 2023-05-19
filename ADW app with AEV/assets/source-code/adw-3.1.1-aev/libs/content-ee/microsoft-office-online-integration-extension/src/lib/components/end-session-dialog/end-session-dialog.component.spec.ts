/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndSessionDialogComponent } from './end-session-dialog.component';
import { CoreModule, setupTestBed, TranslateLoaderService } from '@alfresco/adf-core';
import { VersionUploadComponent } from '@alfresco/adf-content-services';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { MaterialModule } from '../../material.module';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CancelSessionOfficeAction, EndSessionOfficeAction } from '../../store/extension.actions';

describe('EndSessionDialogComponent', () => {
    let component: EndSessionDialogComponent;
    let fixture: ComponentFixture<EndSessionDialogComponent>;
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
        declarations: [VersionUploadComponent],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EndSessionDialogComponent);
        dialogRef = TestBed.inject(MatDialogRef);
        store = TestBed.inject(Store);
        component = fixture.componentInstance;
        component.node = {
            entry: {
                id: '1234',
                name: 'TEST-NODE',
                isFile: true,
                nodeType: 'FAKE',
                isFolder: false,
                modifiedAt: new Date(),
                modifiedByUser: null,
                createdAt: new Date(),
                createdByUser: null,
                content: {
                    mimeType: 'text/html',
                    mimeTypeName: 'HTML',
                    sizeInBytes: 13,
                },
            },
        };
    });

    it('should display version type options if end editing method is selected', () => {
        component.endingMethod = 'end';
        fixture.detectChanges();

        const versionChooserElement = document.getElementById('adf-version-upload-panel');
        expect(versionChooserElement).not.toEqual(null);
    });

    it('should not display version type options if cancel editing method is selected', () => {
        component.endingMethod = 'cancel';
        fixture.detectChanges();

        const versionChooserElement = document.getElementById('adf-version-upload-panel');
        expect(versionChooserElement).toEqual(null);
    });

    it('should update isMajor type if changed', () => {
        component.endingMethod = 'end';
        component.isMajorVersion = false;
        component.handleVersionChange(true);
        fixture.detectChanges();

        expect(component.isMajorVersion).toEqual(true);
    });

    it('should update comment if modified', () => {
        component.comment = '';
        component.handleCommentChange('fakeComment');
        fixture.detectChanges();

        expect(component.comment).toEqual('fakeComment');
    });

    it('should close dialog if clicked on cancel', () => {
        const closeButtonElement = document.getElementById('adw-end-dialog-button');
        closeButtonElement.click();
        fixture.detectChanges();

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should dispatch end session action if clicked on end editing and type is end', () => {
        component.endingMethod = 'end';
        component.isMajorVersion = false;
        component.comment = 'nice version';
        fixture.detectChanges();

        const closeButtonElement = document.getElementById('adw-submit-dialog-button');
        closeButtonElement.click();
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new EndSessionOfficeAction({ node: component.node, isMajor: component.isMajorVersion, comment: component.comment }));
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should dispatch cancel session action if clicked on end editing and type is cancel', () => {
        component.endingMethod = 'cancel';
        fixture.detectChanges();

        const closeButtonElement = document.getElementById('adw-submit-dialog-button');
        closeButtonElement.click();
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new CancelSessionOfficeAction(component.node));
        expect(dialogRef.close).toHaveBeenCalled();
    });
});
