/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { hot } from 'jasmine-marbles';
import { SnackbarInfoAction, SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { Store } from '@ngrx/store';

import { assignTask, openTaskAssignmentDialog, taskAssignmentSuccess, taskAssignmentFailure } from '../actions/task-details.actions';
import { assignedTaskDetailsCloudMock } from '../../features/task-details/mock/task-details.mock';
import { DialogService } from '../../services/dialog.service';
import { TaskDetailsEffects } from './task-details.effects';

describe('TaskDetailsEffects', () => {
    let actions$: Observable<any>;
    let store: Store<any>;
    let effects: TaskDetailsEffects;
    let dialogService: DialogService;
    let taskCloudService: TaskCloudService;
    let openTaskAssignmentDialogSpy: jasmine.Spy;
    let assignSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesCloudTestingModule, MatDialogModule],
            providers: [TaskDetailsEffects, provideMockActions(() => actions$)],
        });

        store = TestBed.inject(Store);
        effects = TestBed.inject(TaskDetailsEffects);
        taskCloudService = TestBed.inject(TaskCloudService);
        dialogService = TestBed.inject(DialogService);
        const dialogReturnValue: any = {
            afterClosed() {
                return of();
            },
        };
        openTaskAssignmentDialogSpy = spyOn(dialogService, 'openTaskAssignmentDialog').and.returnValue(dialogReturnValue);
        assignSpy = spyOn(taskCloudService, 'assign').and.returnValue(of(assignedTaskDetailsCloudMock));
    });

    it('should open change assignee dialog on openTaskAssignmentDialog action', (done) => {
        actions$ = of(openTaskAssignmentDialog({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }));
        effects.openTaskAssignmentDialog$.subscribe(() => {
            expect(openTaskAssignmentDialogSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should call assign api on assignTask action dispatch', () => {
        actions$ = hot('-a-', { a: assignTask({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }) });

        const expected$ = hot('-b-', {
            b: {
                type: '[TaskDetails] Assign Task',
                appName: 'mock-appName',
                taskId: 'mock-id',
                assignee: 'mock-assignee',
            },
        });
        expect(effects.assignTask$).toBeObservable(expected$);
        expect(assignSpy).toHaveBeenCalledWith('mock-appName', 'mock-id', 'mock-assignee');
    });

    it('should dispatch taskAssignmentSuccess if task assignee changed successfully', () => {
        actions$ = hot('-a-', { a: assignTask({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }) });
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

        effects.assignTask$.subscribe(() => {
            expect(dispatchSpy).toHaveBeenCalledWith(taskAssignmentSuccess());
        });
    });

    it('Should dispatch SnackbarInfoAction on taskAssignmentSuccess action', (done) => {
        actions$ = of(taskAssignmentSuccess());

        effects.taskAssignmentSuccess$.subscribe((action) => {
            expect(action).toEqual(new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.SUCCESS'));
            done();
        });
    });

    it('Should dispatch SnackbarErrorAction on taskAssignmentFailure action', (done) => {
        actions$ = of(taskAssignmentFailure({ error: '' }));

        effects.taskAssignmentFailure$.subscribe((action) => {
            expect(action).toEqual(new SnackbarErrorAction('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.FAILED'));
            done();
        });
    });
});
