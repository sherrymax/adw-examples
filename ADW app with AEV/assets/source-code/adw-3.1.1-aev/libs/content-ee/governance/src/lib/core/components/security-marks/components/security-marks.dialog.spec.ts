/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TranslationService, TranslationMock } from '@alfresco/adf-core';
import { SecurityMarkPaging } from '@alfresco/js-api';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { SecurityMarksDialogComponent } from './security-marks.dialog';
import { SecurityMarksService } from './security-marks.service';
import { AppStore } from '@alfresco/aca-shared/store';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

const mockDialog = {
    close: jasmine.createSpy('close')
};

const mockMatDialog = {
    open: jasmine.createSpy('open')
};

const mockStore = {
    dispatch(){
        return EMPTY;
    }
};

class MockSecurityMarkService {
    getNodeSecurityMarks(input: string): Promise<SecurityMarkPaging> {
        return new Promise((resolve) => {
            resolve(new SecurityMarkPaging(input));
        });
    }

    onSave(testNodeId) {
        return new Promise((resolve) => {
            resolve(new SecurityMarkPaging(testNodeId));
        });
    }
}

describe('SecurityMarksDialogSpec', () => {
    let fixture: ComponentFixture<SecurityMarksDialogComponent>;
    let component: SecurityMarksDialogComponent;
    let matDialogRef: MatDialogRef<SecurityMarksDialogComponent>;
    let securityMarksService: SecurityMarksService;
    let store: Store<AppStore>;
    let matDialog: MatDialog;
    let mockSecurityMarkService: SecurityMarksService;

    const mockDialogData = {
        title: 'GOVERNANCE.SECURITY_MARKS.DIALOG_TITLE',
        isMarksDialogEnabled: true,
        isHelpDialogEnabled: false,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatDialogModule,
                MatIconModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatIconModule,
                MatInputModule,
                MatSnackBarModule,
                HttpClientModule,
                NoopAnimationsModule,
                TranslateModule.forRoot(),
            ],
            declarations: [ SecurityMarksDialogComponent ],
            providers: [
                { provide: SecurityMarksService, useClass:  MockSecurityMarkService },
                { provide: TranslationService, useClass: TranslationMock },
                { provide: MatDialogRef, useValue: mockDialog },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                { provide: Store, useValue: mockStore },
                { provide: MatDialog, useValue: mockMatDialog }
            ]
        });

        fixture = TestBed.createComponent(SecurityMarksDialogComponent);
        component = fixture.componentInstance;
        matDialogRef = TestBed.inject(MatDialogRef);
        securityMarksService = TestBed.inject(SecurityMarksService);
        store = TestBed.inject(Store);
        matDialog = TestBed.inject(MatDialog);
        mockSecurityMarkService = TestBed.inject(SecurityMarksService);
    });

    it('should close dialog when cancel is clicked', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const discardButton = fixture.debugElement.nativeElement.querySelector('#cancelButton');
        discardButton.dispatchEvent(new Event('click'));

        expect(matDialogRef.close).toHaveBeenCalled();
    });

    it('save button should not be clickable unless any change is made', async () => {
        spyOn(store, 'dispatch');
        spyOn(securityMarksService, 'onSave');
        const saveButton = fixture.debugElement.nativeElement.querySelector('#saveButton');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(saveButton).toBeNull();
    });

    it('should open help dialog when clicked', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const helpIcon = fixture.debugElement.nativeElement.querySelector('#helpIcon');
        helpIcon.dispatchEvent(new Event('click'));

        expect(matDialog.open).toHaveBeenCalled();
    });

    it('should disable save button when dialog is first opened', async () => {
        fixture.detectChanges();

        component.ngOnInit();

        await fixture.whenStable();
        expect(component.isSaveButtonDisabled).toBeTruthy();
    });

    it('should disable save button while save is in progress', async () => {
        const mockNodeID = 'TestNodeID';
        const mockSecurityMarksArray = [
            {
                id: 'TestID',
                groupId: 'TestGroupID',
                op: 'ADD'
            }
        ];

        securityMarksService.onSave(mockNodeID, mockSecurityMarksArray);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.isSaveButtonDisabled).toBeTruthy();
    });

    it('should opens edit security marks dialog', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.data.isMarksDialogEnabled).toBeTruthy();
    });

    it('should get a list of assigned security marks on a node', async () => {
        spyOn(component, 'getSecurityMarksAssignedOnNode').and.callThrough();
        spyOn(mockSecurityMarkService, 'getNodeSecurityMarks').and.callThrough();
        component.ngOnInit();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.getSecurityMarksAssignedOnNode).toHaveBeenCalled();
        expect(mockSecurityMarkService.getNodeSecurityMarks).toHaveBeenCalled();
    });

    it('should save changes on click of save button', async () => {
        spyOn(component, 'onSave').and.callThrough();
        fixture.detectChanges();
        await fixture.whenStable();

        const saveButton = fixture.debugElement.query(By.css('.save'));
        saveButton.triggerEventHandler('click', null);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.onSave).toHaveBeenCalled();
    });

    it('should manage security marks hierarchically if groupType is HIERARCHICAL', async () => {
        spyOn(component, 'manageSecurityMarksList').and.callThrough();
        spyOn<any>(component, 'handleHierarchicalGroup').and.callThrough();
        component.ngOnInit();

        const securityMarkId = 'TestSecurityMarkID';
        const securityGroupId = 'TestSecurityGroupID';
        const groupType = 'HIERARCHICAL';
        component.manageSecurityMarksList(securityMarkId, securityGroupId, groupType);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component['handleHierarchicalGroup']).toHaveBeenCalled();

    });

});
