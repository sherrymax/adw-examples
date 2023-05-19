/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NotificationService, UpdateNotification, LogService } from '@alfresco/adf-core';
import { TaskListService, TaskDetailsModel } from '@alfresco/adf-process-services';
import { switchMap, tap, catchError, take, concatMap } from 'rxjs/operators';
import { loadTaskDetails, updateTaskDetails, reloadTaskDetails } from '../../../store/actions/task-details-ext.actions';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { throwError } from 'rxjs';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Store } from '@ngrx/store';
import { getSelectedTask } from '../../../process-services-ext.selector';

@Injectable()
export class TaskDetailsExtEffect {
    constructor(
        private actions$: Actions,
        private store: Store<ProcessServiceExtensionState>,
        private taskListService: TaskListService,
        private notificationService: NotificationService,
        private logService: LogService
    ) {}

    loadTaskDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadTaskDetails),
                tap((action) => {
                    this.store
                        .select(getSelectedTask)
                        .pipe(take(1))
                        .subscribe((taskDetails) => {
                            if (!taskDetails || action.taskId !== taskDetails.id) {
                                this.loadTaskDetails(action.taskId);
                            }
                        });
                })
            ),
        { dispatch: false }
    );

    reloadTaskDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(reloadTaskDetails),
                tap((action) => {
                    this.loadTaskDetails(action.taskId);
                })
            ),
        { dispatch: false }
    );

    updateTaskDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(updateTaskDetails),
                concatMap((action) => this.updateTaskDetails(action.taskId, action.taskDetails, action.updatedNotification))
            ),
        { dispatch: true }
    );

    private loadTaskDetails(taskId: string) {
        this.taskListService.getTaskDetails(taskId).subscribe(
            (taskDetails) => {
                this.store.dispatch(TaskDetailsExtActions.setTaskDetails({ taskDetails }));
            },
            (error: any) => {
                this.notificationService.showError('PROCESS-EXTENSION.TASK_DETAILS.FAILED_TO_LOAD');
                return this.handleError(error);
            }
        );
    }

    private updateTaskDetails(taskId: string, taskDetails: TaskDetailsModel, updateNotification: UpdateNotification) {
        return this.taskListService.updateTask(taskId, updateNotification.changed).pipe(
            tap(() => this.notificationService.showInfo('PROCESS-EXTENSION.TASK_DETAILS.UPDATED', null, { property: Object.keys(updateNotification.changed)[0] })),
            switchMap(() => [this.setUpdatedTaskDetails(taskDetails, updateNotification)]),
            catchError((error: any) => {
                this.notificationService.showError('PROCESS-EXTENSION.TASK_DETAILS.FAILED_TO_UPDATE', null, { property: Object.keys(updateNotification.changed)[0] });
                return this.handleError(error);
            })
        );
    }

    private setUpdatedTaskDetails(taskDetails: TaskDetailsModel, updateNotification: UpdateNotification) {
        const updated = new TaskDetailsModel({ ...taskDetails, ...updateNotification.changed });
        return TaskDetailsExtActions.setTaskDetails({ taskDetails: updated });
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error);
    }
}
