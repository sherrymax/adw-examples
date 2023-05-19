/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { NAVIGATE_TO_TASKS } from '../../../actions/process-services-ext.actions';
import { TaskListExtEffect } from './task-list-ext.effect';
import { NAVIGATE_TO_TASK_DETAILS } from '../../../store/actions/task-details-ext.actions';
import { taskDetailsMock } from '../../../mock/task-details.mock';

describe('TaskListExtEffect', () => {
    let router: Router;
    let effects: TaskListExtEffect;
    let actions$: Observable<Action>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [TaskListExtEffect, provideMockActions(() => actions$)],
        });
        router = TestBed.inject(Router);
        effects = TestBed.inject(TaskListExtEffect);
    });

    it('Should navigate to tasks page on dispatching of NavigateToTasksAction', (done) => {
        actions$ = of({ type: NAVIGATE_TO_TASKS, appId: 0, filterId: 123 });

        spyOn(router, 'navigateByUrl');

        effects.navigateToTasks$.subscribe(() => done());

        expect(router.navigateByUrl).toHaveBeenCalledWith(`apps/0/tasks/123`);
    });

    it('Should navigate to task details page on dispatching of NavigateToTaskDetails', (done) => {
        actions$ = of({
            type: NAVIGATE_TO_TASK_DETAILS,
            appId: 0,
            selectedTask: taskDetailsMock,
        });

        spyOn(router, 'navigateByUrl');

        effects.navigateToTaskDetails$.subscribe(() => done());

        expect(router.navigateByUrl).toHaveBeenCalledWith(`apps/0/task-details/91`);
    });
});
