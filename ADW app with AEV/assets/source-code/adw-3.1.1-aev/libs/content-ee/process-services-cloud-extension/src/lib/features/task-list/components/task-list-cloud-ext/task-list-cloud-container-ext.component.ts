/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IdentityGroupModel, TaskFilterAction, TaskFilterCloudModel, TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { ActivatedRoute, Params } from '@angular/router';
import { AppConfigService } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { takeUntil, switchMap, withLatestFrom, map, filter } from 'rxjs/operators';
import { Subject, Observable, combineLatest } from 'rxjs';
import { SnackbarInfoAction } from '@alfresco-dbp/content-ce/shared/store';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import { FilterType } from '../../../../store/states/extension.state';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';

@Component({
    selector: 'apa-task-list-cloud-container-ext',
    templateUrl: './task-list-cloud-container-ext.component.html',
    styleUrls: ['./task-list-cloud-container-ext.component.scss']
})
export class TaskListCloudContainerExtComponent implements OnInit, OnDestroy {
    static TASK_FILTER_PROPERTY_KEYS = 'adf-edit-task-filter';
    public static ACTION_SAVE_AS = 'saveAs';
    public static ACTION_DELETE = 'delete';

    @ViewChild('apaTaskListCloudExt')
    taskListExtCloudComponent: TaskListCloudExtComponent;

    taskFilter: TaskFilterCloudModel;
    appName: string;
    taskFilterProperties: any = {
        filterProperties: [],
        sortProperties: [],
        actions: [],
    };
    onDestroy$ = new Subject<boolean>();

    constructor(
        private taskFilterCloudService: TaskFilterCloudService,
        private route: ActivatedRoute,
        private store: Store<any>,
        private appConfig: AppConfigService
    ) {}

    ngOnInit() {
        this.route.queryParams
            .pipe(
                map((queryParams: Params) => queryParams['filterId']),
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([filterId, appName]) => {
                    this.appName = appName;

                    return combineLatest([
                        this.getCurrentTaskFilter(appName, filterId),
                        this.waitUntilProcessDefinitionsAreLoaded()
                    ]);
                })
            )
            .subscribe(([taskFilter]) => {
                if (taskFilter) {
                    this.setTaskFilter(taskFilter);
                }
            });

        this.getEditFilterProperties();
    }

    private getCurrentTaskFilter(appName: string, filterId: string): Observable<TaskFilterCloudModel> {
        return this.taskFilterCloudService.getTaskFilterById(appName, filterId).pipe(takeUntil(this.onDestroy$));
    }

    onFilterChange(taskFilter: TaskFilterCloudModel) {
        if (this.taskListExtCloudComponent) {
            this.taskListExtCloudComponent.fetchCloudPaginationPreference();
        }
        this.setTaskFilter(taskFilter);
    }

    private setTaskFilter(taskFilter: TaskFilterCloudModel) {
        this.taskFilter = new TaskFilterCloudModel(taskFilter);
        this.setProcessManagementFilter(taskFilter);
    }

    onTaskFilterAction(filterAction: TaskFilterAction) {
        if (filterAction.actionType === TaskListCloudContainerExtComponent.ACTION_DELETE) {
            this.taskFilterCloudService.getTaskListFilters(this.appName).pipe(takeUntil(this.onDestroy$)).subscribe((filters: TaskFilterCloudModel[]) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
                this.navigateToTaskFilter(filters[0].id);
            });
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
            this.navigateToTaskFilter(filterAction.filter.id);
        }
    }

    getCandidateGroups(): string {
        return this.taskFilter.candidateGroups?.length ? this.taskFilter.candidateGroups?.map((group: IdentityGroupModel) => group.name).join(',') : null;
    }

    private showFilterNotification(key: string) {
        this.store.dispatch(new SnackbarInfoAction(key));
    }

    private navigateToTaskFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    private setProcessManagementFilter(taskFilter: TaskFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.TASK,
                    filter: taskFilter,
                },
            })
        );
    }

    private getEditFilterProperties() {
        const properties = this.appConfig.get<Array<any>>(TaskListCloudContainerExtComponent.TASK_FILTER_PROPERTY_KEYS);
        if (properties) {
            this.taskFilterProperties = properties;
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter(areDefinitionsLoaded => areDefinitionsLoaded));
    }
}
