/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, withLatestFrom, switchMap } from 'rxjs/operators';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { TaskCloudService, TaskDetailsCloudModel, FilterParamsModel, TaskFilterCloudService, TaskFilterCloudModel } from '@alfresco/adf-process-services-cloud';
import { navigateToFilter, navigateToTasks } from '../../../../store/actions/process-management-filter.actions';
import { SnackbarInfoAction, PluginPreviewAction, SetFileUploadingDialogAction, SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { CardViewUpdateService, ClickNotification, FormOutcomeEvent } from '@alfresco/adf-core';
import { DialogService } from '../../../../services/dialog.service';
import { openTaskAssignmentDialog } from '../../../../store/actions/task-details.actions';
import { TaskAssigneeModel } from '../../models/task-assignee.model';
import { navigateToProcessDetails } from '../../../../store/actions/process-list-cloud.actions';

@Component({
    selector: 'apa-task-details-cloud-ext',
    templateUrl: './task-details-cloud-ext.component.html',
    styleUrls: ['./task-details-cloud-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TaskDetailsCloudExtComponent implements OnInit, OnDestroy {
    static COMPLETED_TASK = 'completed-tasks';
    appName: string;
    processName: string;
    onDestroy$ = new Subject<boolean>();
    taskDetails$: Observable<TaskDetailsCloudModel>;
    currentFilter: FilterParamsModel;
    showMetadata = false;
    taskId: string;

    constructor(
        private store: Store<any>,
        private location: Location,
        private route: ActivatedRoute,
        public dialogService: DialogService,
        private cardViewUpdateService: CardViewUpdateService,
        private taskCloudService: TaskCloudService,
        private taskFilterCloudService: TaskFilterCloudService
    ) {}

    ngOnInit(): void {
        this.setFileUploadingDialogVisibility(false);
        this.taskDetails$ = this.route.params.pipe(
            withLatestFrom(this.store.select(selectApplicationName)),
            switchMap(([params, appName]) => {
                this.appName = appName;
                this.processName = params['processName'];
                this.taskId = params['taskId'];
                return this.taskCloudService.getTaskById(appName, this.taskId).pipe(takeUntil(this.onDestroy$));
            })
        );
        this.store
            .select(selectProcessManagementFilter)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((filter: FilterParamsModel) => {
                this.currentFilter = filter;
            });

        this.cardViewUpdateService.itemClicked$.pipe(takeUntil(this.onDestroy$)).subscribe(this.clickTaskDetails.bind(this));
    }

    onCompleteTaskForm() {
        this.store.dispatch(new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED'));
        if (!this.currentFilter) {
            this.navigateToCompleteTask();
        } else {
            this.navigateToSelectedFilter(this.currentFilter.id);
        }
    }

    onFormSaved() {
        this.store.dispatch(new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_SAVED'));
    }

    onExecuteOutcome({ outcome }: FormOutcomeEvent) {
        if (!outcome.isSystem) {
            this.store.dispatch(new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION', { outcome: outcome.name }));
        }
    }

    navigateToSelectedFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    navigateToCompleteTask() {
        this.taskFilterCloudService.getTaskListFilters(this.appName).subscribe((filters: TaskFilterCloudModel[]) => {
            const completedTaskFilter = filters.find((key: TaskFilterCloudModel) => key.key === TaskDetailsCloudExtComponent.COMPLETED_TASK);
            this.store.dispatch(
                navigateToTasks({
                    filterId: completedTaskFilter.id,
                })
            );
        });
    }

    onCancelForm() {
        this.navigateBack();
    }

    onFilterClick() {
        this.store.dispatch(
            navigateToFilter({
                filterId: this.currentFilter.id,
            })
        );
    }

    onFormContentClicked({ nodeId }) {
        let pluginRoute = `task-details-cloud/${this.taskId}`;
        if (this.processName) {
            pluginRoute = `task-details-cloud/${this.taskId}/${this.processName}`;
        }
        this.store.dispatch(new PluginPreviewAction(pluginRoute, nodeId));
    }

    onError({ message: error }: Error) {
        let errorMessage;
        try {
            const errorPayload = JSON.parse(error);
            errorMessage = this.getErrorMessage(errorPayload);
        } catch {}
        this.store.dispatch(new SnackbarErrorAction(errorMessage || error));
    }

    getErrorMessage(errorPayload) {
        if (errorPayload.errors) {
            const errorMessages = errorPayload.errors.map(errorDetails => errorDetails.message);
            return errorMessages.join(', ');
        } else {
            const errorMessage = errorPayload.message || errorPayload.entry?.message;
            return errorMessage;
        }
    }

    private navigateBack() {
        this.location.back();
    }

    ngOnDestroy() {
        this.setFileUploadingDialogVisibility(true);
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    private clickTaskDetails(clickNotification: ClickNotification) {
        if (clickNotification.target.key === 'assignee') {
            this.openDialog(clickNotification.target.value);
        }
        if (clickNotification.target.key === 'processInstanceId') {
            this.navigateToProcessDetails(clickNotification.target.value);
        }
    }

    private openDialog(assignee: string) {
        this.store.dispatch(
            openTaskAssignmentDialog(<TaskAssigneeModel> {
                taskId: this.taskId,
                appName: this.appName,
                assignee: assignee,
            })
        );
    }

    private navigateToProcessDetails(processInstanceId: string) {
        this.store.dispatch(
            navigateToProcessDetails({
                processInstanceId,
            })
        );
    }

    private setFileUploadingDialogVisibility(visibility: boolean) {
        this.store.dispatch(new SetFileUploadingDialogAction(visibility));
    }
}
