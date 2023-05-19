/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessModule, TaskListService } from '@alfresco/adf-process-services';
import { setupTestBed, FormService, AuthenticationService, WidgetVisibilityService } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { TaskDetailsExtComponent } from './task-details-ext.component';
import { of } from 'rxjs';
import { taskDetailsMock, claimedTaskDetailsMock } from '../../../mock/task-details.mock';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { SnackbarInfoAction, SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getSelectedTask } from '../../../process-services-ext.selector';

describe('TaskDetailsExtComponent', () => {
    let component: TaskDetailsExtComponent;
    let fixture: ComponentFixture<TaskDetailsExtComponent>;
    let formService: FormService;
    let taskListService: TaskListService;
    let visibilityService: WidgetVisibilityService;
    let store: Store<ProcessServiceExtensionState>;
    let mockStore: MockStore<ProcessServiceExtensionState>;
    let getTaskFormSpy: jasmine.Spy;
    let getTaskSpy: jasmine.Spy;
    let getTaskDetails: jasmine.Spy;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, MatButtonModule, MatTooltipModule, TranslateModule.forRoot()],
        declarations: [TaskDetailsExtComponent],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({ appId: '321', taskId: '123' }),
                },
            },
            MockStore,
            provideMockStore(),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDetailsExtComponent);
        component = fixture.componentInstance;
        component.appId = 123;

        store = TestBed.inject(Store);
        visibilityService = TestBed.inject(WidgetVisibilityService);
        taskListService = TestBed.inject(TaskListService);
        formService = TestBed.inject(FormService);

        mockStore = TestBed.inject(MockStore);
        mockStore.overrideSelector(getSelectedTask, taskDetailsMock);

        getTaskDetails = spyOn(taskListService, 'getTaskDetails').and.returnValue(of(taskDetailsMock));
        const authService = TestBed.inject(AuthenticationService);
        spyOn(authService, 'getBpmLoggedUser').and.returnValue(of({ email: 'fake-email' }));

        getTaskFormSpy = spyOn(formService, 'getTaskForm').and.returnValue(of([]));

        spyOn(visibilityService, 'getTaskProcessVariable').and.returnValue(of([]));
        getTaskSpy = spyOn(formService, 'getTask').and.returnValue(of([]));
    });

    it('Should get taskId and appId from route params', () => {
        fixture.detectChanges();
        expect(+component.taskId).toBe(123);
        expect(component.appId).toBe(321);
    });

    it('Should be able to dispatch loadTaskDetails action', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedValue = TaskDetailsExtActions.loadTaskDetails({ taskId: '123' });
        fixture.detectChanges();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedValue);
    });

    it('Should be able fetch selectedTask from the store', (done) => {
        fixture.detectChanges();
        component.taskDetails$.subscribe((details) => {
            expect(details).toEqual(taskDetailsMock);
            done();
        });
    });

    it('Should be able to dispatch resetSelectedTask action on component destroy', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedValue = TaskDetailsExtActions.resetSelectedTask();

        fixture.destroy();
        expect(dispatchSpy).toHaveBeenCalledWith(expectedValue);
    });

    it('Should show success notification on task claim', () => {
        fixture.detectChanges();
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = new SnackbarInfoAction('PROCESS-EXTENSION.TASK_FORM.CLAIM_TASK');
        component.onClaim();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should show success notification on task unclaim', () => {
        fixture.detectChanges();
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = new SnackbarInfoAction('PROCESS-EXTENSION.TASK_FORM.UNCLAIM_TASK');
        component.onUnClaim();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should show error notification on task claim/unclaim failure', () => {
        fixture.detectChanges();
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = new SnackbarWarningAction('PROCESS-EXTENSION.TASK_FORM.CLAIM_FAILED');
        component.onError();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should show success notification on task completion', () => {
        fixture.detectChanges();
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = new SnackbarInfoAction('PROCESS-EXTENSION.TASK_FORM.FORM_COMPLETED');
        component.onFormCompleted();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('[C362180] Should show warning notification when user opens a task claimed by another candidate user', () => {
        getTaskDetails.and.returnValue(of(claimedTaskDetailsMock));
        getTaskFormSpy.and.returnValue(of([]));
        getTaskSpy.and.returnValue(of(claimedTaskDetailsMock));
        fixture.detectChanges();
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.TASK_ACCESS_WARNING');
        component.onFormLoaded();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should be able to toggle task metadata on click of the info icon from the toolbar actions', () => {
        fixture.detectChanges();
        const infoIcon = fixture.debugElement.query(By.css('[data-automation-id="aps-task-metadata-icon-icon"]'));
        infoIcon.nativeElement.click();
        fixture.detectChanges();
        const showTaskMetadata = fixture.debugElement.nativeElement.querySelector('aps-task-metadata-ext');

        expect(showTaskMetadata).not.toBeNull();

        infoIcon.nativeElement.click();
        fixture.detectChanges();
        const hideTaskMetadata = fixture.debugElement.nativeElement.querySelector('aps-task-metadata-ext');

        expect(hideTaskMetadata).toBeNull();
    });
});
