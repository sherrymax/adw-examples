/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action, Store } from '@ngrx/store';
import { of, Observable, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { TaskDetailsExtEffect } from './task-details-ext.effect';
import { TaskListService, TaskDetailsModel } from '@alfresco/adf-process-services';
import { taskDetailsMock } from '../../../mock/task-details.mock';
import { loadTaskDetails, updateTaskDetails } from '../../../store/actions/task-details-ext.actions';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { NotificationService, UpdateNotification } from '@alfresco/adf-core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

describe('TaskDetailsExtEffect', () => {
    let store: Store<ProcessServiceExtensionState>;
    let effects: TaskDetailsExtEffect;
    let taskListService: TaskListService;
    let notificationService: NotificationService;
    let actions$: Observable<Action>;
    let getTaskDetailsSpy: jasmine.Spy;
    let updateTaskSpy: jasmine.Spy;
    let showInfoSpy: jasmine.Spy;
    let showErrorSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule, MatSnackBarModule],
            providers: [TaskDetailsExtEffect, MatSnackBar, provideMockActions(() => actions$)],
        });

        store = TestBed.inject(Store);
        effects = TestBed.inject(TaskDetailsExtEffect);
        notificationService = TestBed.inject(NotificationService);
        taskListService = TestBed.inject(TaskListService);
        getTaskDetailsSpy = spyOn(taskListService, 'getTaskDetails').and.returnValue(of(taskDetailsMock));
        updateTaskSpy = spyOn(taskListService, 'updateTask').and.returnValue(of(taskDetailsMock));
        showInfoSpy = spyOn(notificationService, 'showInfo').and.callThrough();
        showErrorSpy = spyOn(notificationService, 'showError').and.callThrough();
    });

    it('Should be able call getTaskDetails API and dispatch setTaskDetails action if store does not have the selectedTask', () => {
        const mockTaskId = '123';
        actions$ = of(loadTaskDetails({ taskId: mockTaskId }));
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
        const expectedValue = TaskDetailsExtActions.setTaskDetails({ taskDetails: taskDetailsMock });

        effects.loadTaskDetails$.subscribe(() => {});
        expect(getTaskDetailsSpy).toHaveBeenCalledWith(mockTaskId);
        expect(dispatchSpy).toHaveBeenCalledWith(expectedValue);
    });

    it('Should be able show a error notification in case getTaskDetails API failed to load', () => {
        const mockTaskId = '123';
        getTaskDetailsSpy.and.returnValue(throwError('Failed to load'));
        actions$ = of(loadTaskDetails({ taskId: mockTaskId }));
        TaskDetailsExtActions.setTaskDetails({ taskDetails: taskDetailsMock });

        effects.loadTaskDetails$.subscribe(() => {});
        expect(getTaskDetailsSpy).toHaveBeenCalledWith(mockTaskId);
        expect(showErrorSpy).toHaveBeenCalledWith('PROCESS-EXTENSION.TASK_DETAILS.FAILED_TO_LOAD');
    });

    it('Should not be able call getTaskDetails API and dispatch setTaskDetails action if store has selectedTask', () => {
        const taskIdPresentInMemory = '91';
        actions$ = of(loadTaskDetails({ taskId: taskIdPresentInMemory }));
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
        const selectSpy = spyOn(store, 'select').and.returnValue(of(taskDetailsMock));
        const expectedValue = TaskDetailsExtActions.setTaskDetails({ taskDetails: taskDetailsMock });

        effects.loadTaskDetails$.subscribe(() => {});

        expect(getTaskDetailsSpy).not.toHaveBeenCalledWith(taskIdPresentInMemory);
        expect(dispatchSpy).not.toHaveBeenCalledWith(expectedValue);
        expect(selectSpy).toHaveBeenCalled();
    });

    it('Should be able call updateTask API and dispatch setTaskDetails action', (done) => {
        const mockTaskId = '123';
        const mockChanged = { priority: 30 };
        actions$ = of(updateTaskDetails({ taskId: mockTaskId, taskDetails: taskDetailsMock, updatedNotification: <UpdateNotification> { changed: mockChanged } }));
        const expectedValue = TaskDetailsExtActions.setTaskDetails({ taskDetails: new TaskDetailsModel({ ...taskDetailsMock, ...mockChanged }) });

        effects.updateTaskDetails$.subscribe((action) => {
            expect(updateTaskSpy).toHaveBeenCalledWith(mockTaskId, mockChanged);
            expect(action).toEqual(expectedValue);
            done();
        });
    });

    it('Should be able show success notification when task details updated', (done) => {
        const mockTaskId = '123';
        const mockChanged = { priority: 30 };
        actions$ = of(updateTaskDetails({ taskId: mockTaskId, taskDetails: taskDetailsMock, updatedNotification: <UpdateNotification> { changed: mockChanged } }));

        effects.updateTaskDetails$.subscribe(() => {
            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS-EXTENSION.TASK_DETAILS.UPDATED', null, { property: 'priority' });
            done();
        });
    });

    it('Should fetch the taskdetails from the API when the taskDetails present in memory is different from the requested task', () => {
        const taskIdNotPresentInMemory = '1002';
        actions$ = of(loadTaskDetails({ taskId: taskIdNotPresentInMemory }));
        spyOn(store, 'select').and.returnValue(of(taskDetailsMock));
        effects.loadTaskDetails$.subscribe(() => {});

        expect(getTaskDetailsSpy).toHaveBeenCalledWith(taskIdNotPresentInMemory);
    });
});
