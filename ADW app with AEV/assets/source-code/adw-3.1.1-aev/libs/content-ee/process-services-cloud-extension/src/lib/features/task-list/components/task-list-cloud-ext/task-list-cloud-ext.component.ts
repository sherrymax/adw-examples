/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild, Input, OnChanges } from '@angular/core';
import { TaskFilterCloudModel, TaskListCloudSortingModel, TaskListCloudComponent, IdentityGroupModel } from '@alfresco/adf-process-services-cloud';
import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { Pagination } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { navigateToTaskDetails } from '../../store/actions/task-list-cloud.actions';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';

@Component({
    selector: 'apa-task-list-cloud-ext',
    templateUrl: './task-list-cloud-ext.component.html',
    styleUrls: ['./task-list-cloud-ext.component.scss'],
    host: { class: 'apa-task-list-cloud-ext' }
})
export class TaskListCloudExtComponent implements OnInit, OnChanges, OnDestroy {
    static TASK_FILTER_PROPERTY_KEYS = 'adf-edit-task-filter';
    public static ACTION_SAVE_AS = 'saveAs';
    public static ACTION_DELETE = 'delete';

    @ViewChild(TaskListCloudComponent)
    taskListCloudComponent: TaskListCloudComponent;

    @Input()
    currentFilter: TaskFilterCloudModel;

    paginationPageSize = 10;
    supportedPageSizes$: Observable<any[]>;
    sortArray: TaskListCloudSortingModel[] = [];
    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    private performAction$ = new Subject<any>();
    onDestroy$ = new Subject<boolean>();
    columns$: Observable<ExtensionColumnPreset[]>;

    constructor(
        private extensions: ProcessServicesCloudExtensionService,
        private userPreferenceService: UserPreferencesService,
        private store: Store<any>
    ) {}

    ngOnInit() {
        this.fetchCloudPaginationPreference();
        if (this.currentFilter) {
            this.setSorting();
        }
        this.performContextActions();
        this.columns$ = this.extensions.getTasksColumns('default');
    }

    ngOnChanges(): void {
        if (this.currentFilter) {
            this.setSorting();
        }
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    onShowRowContextMenu(event: any) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: {
                    key: 'task-details',
                    icon: 'open_in_new',
                    title: 'PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS',
                    visible: true,
                },
                subject: this.performAction$,
            },
        ];
    }

    navigateToTaskDetails(taskId: string) {
        this.store.dispatch(navigateToTaskDetails({ taskId }));
    }

    getCandidateGroups(): string {
        return this.currentFilter?.candidateGroups?.length ? this.currentFilter?.candidateGroups?.map((group: IdentityGroupModel) => group.name).join(',') : null;
    }

    isSortingChanged(): boolean {
        return this.sortArray[0]?.orderBy !== this.currentFilter?.sort || this.sortArray[0]?.direction !== this.currentFilter?.order;
    }

    private setSorting() {
        if (this.isSortingChanged()) {
            this.sortArray = [
                new TaskListCloudSortingModel({
                    orderBy: this.currentFilter?.sort,
                    direction: this.currentFilter?.order,
                }),
            ];
        }
    }

    private performContextActions() {
        this.performAction$.pipe(takeUntil(this.onDestroy$)).subscribe((action: any) => {
            this.navigateToTaskDetails(action.data.id);
        });
    }

    fetchCloudPaginationPreference() {
        this.supportedPageSizes$ = this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).pipe(
            map((supportedPageSizes) => {
                if (typeof supportedPageSizes === 'string') {
                    return JSON.parse(supportedPageSizes);
                }
                return supportedPageSizes;
            })
        );

        if (this.taskListCloudComponent) {
            this.defaultPagination.maxItems = this.taskListCloudComponent.size;
            this.taskListCloudComponent.resetPagination();
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
