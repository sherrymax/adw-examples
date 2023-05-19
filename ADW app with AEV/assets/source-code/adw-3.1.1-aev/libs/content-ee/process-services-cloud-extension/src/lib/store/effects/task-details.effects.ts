/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { SnackbarInfoAction, SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { IdentityUserModel, TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { Location } from '@angular/common';
import { openTaskAssignmentDialog, assignTask, taskAssignmentSuccess, taskAssignmentFailure } from '../actions/task-details.actions';
import { DialogService } from '../../services/dialog.service';
import { TaskAssigneeModel } from '../../features/task-details/models/task-assignee.model';

@Injectable()
export class TaskDetailsEffects {
    constructor(
        private actions$: Actions,
        private store: Store<any>,
        private dialogService: DialogService,
        private taskCloudService: TaskCloudService,
        private location: Location
    ) {}

    openTaskAssignmentDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openTaskAssignmentDialog),
                tap((settings) => this.openDialog(settings))
            ),
        { dispatch: false }
    );

    assignTask$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(assignTask),
                tap((res) => {
                    this.assign(res);
                })
            ),
        { dispatch: false }
    );

    taskAssignmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(taskAssignmentSuccess),
                map(() => new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.SUCCESS'))
            ),
        { dispatch: true }
    );

    taskAssignmentFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(taskAssignmentFailure),
                map(() => new SnackbarErrorAction('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.FAILED'))
            ),
        { dispatch: true }
    );

    private openDialog(settings: TaskAssigneeModel) {
        this.dialogService
            .openTaskAssignmentDialog(settings)
            .afterClosed()
            .subscribe((newAssignee: IdentityUserModel) => {
                if (newAssignee && newAssignee.username) {
                    const payload = <TaskAssigneeModel> { taskId: settings.taskId, appName: settings.appName, assignee: newAssignee.username };
                    this.store.dispatch(assignTask(payload));
                }
            });
    }

    private assign(payload: TaskAssigneeModel) {
        this.taskCloudService.assign(payload.appName, payload.taskId, payload.assignee).subscribe(
            () => {
                this.location.back();
                this.store.dispatch(taskAssignmentSuccess());
            },
            (error) => {
                this.store.dispatch(taskAssignmentFailure(error));
            }
        );
    }
}
