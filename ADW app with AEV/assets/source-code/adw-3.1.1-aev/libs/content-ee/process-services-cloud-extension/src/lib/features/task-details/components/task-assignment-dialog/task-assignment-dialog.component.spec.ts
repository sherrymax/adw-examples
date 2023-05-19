/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { setupTestBed, PipeModule } from '@alfresco/adf-core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IdentityUserModel, PeopleCloudComponent } from '@alfresco/adf-process-services-cloud';
import { TaskAssignmentDialogComponent } from './task-assignment-dialog.component';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { TranslateModule } from '@ngx-translate/core';

describe('TaskAssignmentDialogComponent', () => {
    let component: TaskAssignmentDialogComponent;
    let fixture: ComponentFixture<TaskAssignmentDialogComponent>;
    let taskAssignmentService: TaskAssignmentService;
    let searchSpy: jasmine.Spy;

    const mockUsers = [{ username: 'user1' }, { username: 'user2' }];

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    const mockDialogData = {
        appName: 'mock-Application-name',
        taskId: 'mock-task-id',
        assignee: 'mock-user-name',
    };

    setupTestBed({
        imports: [
            MatDialogModule,
            MatIconModule,
            MatCardModule,
            MatInputModule,
            MatAutocompleteModule,
            MatChipsModule,
            MatSnackBarModule,
            FormsModule,
            ReactiveFormsModule,
            TranslateModule,
            PipeModule,
            ProcessServicesCloudTestingModule,
        ],
        declarations: [TaskAssignmentDialogComponent, PeopleCloudComponent],
        providers: [TaskAssignmentService, { provide: MatDialogRef, useValue: mockDialogRef }, { provide: MAT_DIALOG_DATA, useValue: mockDialogData }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskAssignmentDialogComponent);
        component = fixture.componentInstance;
        taskAssignmentService = TestBed.inject(TaskAssignmentService);
        searchSpy = spyOn(taskAssignmentService, 'search').and.returnValue(of(mockUsers));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should be defined adf-cloud-people', () => {
        fixture.detectChanges();
        const adfCloudPeople = fixture.debugElement.nativeElement.querySelector('adf-cloud-people');
        const searchInputElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-people-cloud-search-input"]');

        expect(adfCloudPeople).toBeDefined();
        expect(searchInputElement).toBeDefined();
    });

    it('should get appName from MAT_DIALOG_DATA as an input to the dialog', () => {
        fixture.detectChanges();
        const mockData = component.settings;

        expect(mockData).toEqual(mockDialogData);
        expect(mockData.appName).toEqual('mock-Application-name');
    });

    it('should display title', () => {
        fixture.detectChanges();
        const titleElement = fixture.debugElement.nativeElement.querySelector('.mat-dialog-title');

        expect(titleElement.textContent.trim()).toEqual('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.TITLE');
    });

    it('should be able to close dialog when close button is clicked', () => {
        fixture.detectChanges();
        const discardButton = fixture.debugElement.nativeElement.querySelector('#closeButton');
        discardButton.click();

        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('Should be able to call dialog close with selected user on click of assign button', async () => {
        searchSpy.and.returnValue(of([]));
        const selectedUser = <IdentityUserModel> { username: 'mock-selected-name' };
        component.onSelect(selectedUser);

        fixture.detectChanges();
        await fixture.whenStable();

        const assignButton = fixture.debugElement.nativeElement.querySelector('#assignButton');
        assignButton.click();

        expect(mockDialogRef.close).toHaveBeenCalledWith(selectedUser);
    });

    it('Should enable assign button if a selected user different from current assignee', async () => {
        fixture.detectChanges();
        component.onSelect({ username: 'mock-new-assignee' });

        fixture.detectChanges();
        await fixture.whenStable();

        const assignButton = fixture.debugElement.nativeElement.querySelector('#assignButton');

        expect(assignButton.disabled).toBeFalsy();
    });

    it('Should disable assign button if current assignee is selected', async () => {
        const selectedUser = <IdentityUserModel> { username: 'mock-user-name' };
        fixture.detectChanges();
        component.onSelect(selectedUser);

        fixture.detectChanges();
        await fixture.whenStable();

        const assignButton = fixture.debugElement.nativeElement.querySelector('#assignButton');

        expect(assignButton.disabled).toBeTruthy();
    });

    it('Should current assignee be removable', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const selectedUserChip = fixture.debugElement.nativeElement.querySelector('mat-chip');

        expect(selectedUserChip.attributes['ng-reflect-removable'].value).toEqual('true');
    });

    it('Should disable assign button when assignee removed', async () => {
        fixture.detectChanges();
        const selectedUserChip = fixture.debugElement.nativeElement.querySelector('mat-chip');
        selectedUserChip.click();

        fixture.detectChanges();
        await fixture.whenStable();

        const assignButton = fixture.debugElement.nativeElement.querySelector('#assignButton');

        expect(assignButton.disabled).toBeTruthy();
    });
});
