/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObjectDataTableAdapter, DataSorting, DataCellEvent } from '@alfresco/adf-core';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '@alfresco/js-api';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { TaskListExtService } from '../services/task-list-ext.service';

@Component({
    selector: 'aps-task-list-ext',
    templateUrl: './task-list-ext.component.html',
    styleUrls: ['./task-list-ext.component.scss'],
})
export class TaskListExtComponent implements OnInit, OnDestroy {
    static COMPLETED_TASK_FILTER_NAME = 'Completed Tasks';
    static COMPLETED_SCHEMA = 'completed';
    static DEFAULT_SCHEMA = 'default';

    appId = null;
    filterId: number;
    currentFilter: FilterRepresentationModel;
    paginationPageSize = 10;
    supportedPageSizes: any[];
    dataTasks: ObjectDataTableAdapter;
    private performAction$ = new Subject<any>();
    private onDestroy$ = new Subject<boolean>();

    constructor(private taskListExtService: TaskListExtService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.params
            .pipe(
                switchMap((params) => {
                    this.appId = +params['appId'];
                    this.filterId = +params['filterId'];
                    return this.taskListExtService.getTaskFilterById(this.filterId);
                })
            )
            .subscribe((filter: FilterRepresentationModel) => {
                this.currentFilter = filter;
                this.taskListExtService.selectFilter(filter);
                this.taskListExtService.expandProcessManagementSection();
            });

        this.fetchPaginationPreference();
        this.setSortOrder();
        this.performContextActions();
    }

    getAppId(): number {
        return +this.appId === 0 ? null : this.appId;
    }

    private fetchPaginationPreference() {
        this.taskListExtService
            .fetchPaginationPreference()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((res) => {
                this.paginationPageSize = +res.pageSize;
                this.supportedPageSizes = res.supportedPageSizes;
            });
    }

    private setSortOrder(): void {
        this.dataTasks = new ObjectDataTableAdapter([], []);
        this.dataTasks.setSorting(new DataSorting('created', 'desc'));
    }

    onChangePageSize(pagination: Pagination): void {
        this.taskListExtService.setPageSize(pagination);
    }

    onShowRowContextMenu(event: DataCellEvent) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: {
                    key: 'task-details',
                    icon: 'open_in_new',
                    title: 'PROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS',
                    visible: true,
                },
                subject: this.performAction$,
            },
        ];
    }

    performContextActions() {
        this.performAction$.subscribe((action: any) => {
            this.taskListExtService.navigateToTaskDetails(this.appId, action.data);
        });
    }

    onRowClick(event: Event) {
        const selectedTask = (event as CustomEvent).detail.value.obj;
        this.taskListExtService.navigateToTaskDetails(this.appId, selectedTask);
    }

    getTaskStatus(taskDetails: any): string {
        return taskDetails && taskDetails.isCompleted() ? 'Completed' : 'Running';
    }

    getTaskListSchema(): string {
        return this.isCompletedFilter() ? TaskListExtComponent.COMPLETED_SCHEMA : TaskListExtComponent.DEFAULT_SCHEMA;
    }

    isCompletedFilter(): boolean {
        return this.currentFilter.name === TaskListExtComponent.COMPLETED_TASK_FILTER_NAME;
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }
}
