/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { ProcessInstanceCloud, ProcessTaskListCloudService, TaskListCloudComponent, TASK_LIST_CLOUD_TOKEN } from '@alfresco/adf-process-services-cloud';
import { Pagination } from '@alfresco/js-api';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { navigateToTaskDetails } from '../../../task-list/store/actions/task-list-cloud.actions';
import { Store } from '@ngrx/store';

@Component({
    selector: 'apa-process-task-list-ext',
    templateUrl: './process-task-list-ext.component.html',
    styleUrls: ['./process-task-list-ext.component.scss'],
    host: { class: 'apa-process-task-list-ext' },
    providers: [
        { provide: TASK_LIST_CLOUD_TOKEN, useClass: ProcessTaskListCloudService }
    ]
})
export class ProcessTaskListExtComponent implements OnInit, OnDestroy {

    static TASK_FILTER_PROPERTY_KEYS = 'adf-edit-task-filter';
    public static ACTION_SAVE_AS = 'saveAs';
    public static ACTION_DELETE = 'delete';

    @ViewChild('processTaskList')
    taskListCloudComponent: TaskListCloudComponent;

    @Input()
    processInstance: ProcessInstanceCloud;

    paginationPageSize = 10;
    supportedPageSizes$: Observable<any[]>;
    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    private performAction$ = new Subject<any>();
    onDestroy$ = new Subject<boolean>();
    columns$: Observable<ExtensionColumnPreset[]>;

    constructor(
        private extensions: ProcessServicesCloudExtensionService,
        private store: Store<any>,
        private userPreferenceService: UserPreferencesService,
    ) {}

    ngOnInit() {
        this.fetchCloudPaginationPreference();
        this.performContextActions();
        this.columns$ = this.extensions.getTasksColumns('process-instance-task-list');
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
        this.store.dispatch(
            navigateToTaskDetails({
                taskId,
                processName: this.processInstance.name,
            })
        );
    }

    private performContextActions() {
        this.performAction$.pipe(takeUntil(this.onDestroy$)).subscribe((action: any) => {
            this.navigateToTaskDetails(action.data.id);
        });
    }

    private fetchCloudPaginationPreference() {
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
