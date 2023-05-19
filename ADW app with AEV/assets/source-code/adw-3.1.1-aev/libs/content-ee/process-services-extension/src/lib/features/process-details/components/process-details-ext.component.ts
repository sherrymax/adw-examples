/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessInstance } from '@alfresco/adf-process-services';
import { SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';
import { UserPreferenceValues, UserPreferencesService, DataCellEvent } from '@alfresco/adf-core';
import { Pagination } from '@alfresco/js-api';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Subject } from 'rxjs';
import { ALL_APPS } from '../../../models/process-service.model';
import { ProcessDetailsExtActions } from '../../../process-details-ext-actions-types';
import { loadSelectedProcess } from '../../../store/actions/process-details-ext.actions';
import { getSelectedProcess } from '../../../process-services-ext.selector';
import { takeUntil } from 'rxjs/operators';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';

@Component({
    selector: 'aps-process-details-ext',
    templateUrl: './process-details-ext.component.html',
    styleUrls: ['./process-details-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProcessDetailsExtComponent implements OnInit, OnDestroy {
    processInstanceDetails: ProcessInstance;
    presetColumn = 'aps-process-task-list';
    paginationPageSize = 10;
    supportedPageSizes: any[];
    showMetadata = false;

    private performAction$ = new Subject<any>();
    private onDestroy$ = new Subject<boolean>();

    constructor(private route: ActivatedRoute, private userPreferenceService: UserPreferencesService, private store: Store<ProcessServiceExtensionState>) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            const processInstanceId = params['processId'];
            this.loadProcessDetails(processInstanceId);
        });
        this.fetchPaginationPreference();
        this.performContextActions();

        this.store
            .select(getSelectedProcess)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((processInstanceDetails) => {
                this.processInstanceDetails = processInstanceDetails;
            });
    }

    private loadProcessDetails(processInstanceId) {
        this.store.dispatch(
            loadSelectedProcess({
                processInstanceId,
            })
        );
    }

    getTaskStatus(taskDetails: any): string {
        return taskDetails.endDate ? 'Completed' : 'Open';
    }

    private fetchPaginationPreference() {
        if (this.userPreferenceService.get(UserPreferenceValues.PaginationSize)) {
            this.paginationPageSize = +this.userPreferenceService.get(UserPreferenceValues.PaginationSize);
        } else {
            this.userPreferenceService.select(UserPreferenceValues.PaginationSize).subscribe((pageSize) => {
                this.paginationPageSize = pageSize;
            });
        }
        this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).subscribe((supportedPageSizes) => {
            if (typeof supportedPageSizes === 'string') {
                supportedPageSizes = JSON.parse(supportedPageSizes);
            }
            this.supportedPageSizes = supportedPageSizes;
        });
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    onAuditError(event: any): void {
        this.store.dispatch(
            new SnackbarErrorAction('PROCESS-EXTENSION.ERROR.AUDIT_ERROR', {
                error: event,
            })
        );
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
            this.store.dispatch(
                TaskDetailsExtActions.navigateToTaskDetails({
                    appId: ALL_APPS,
                    selectedTask: action.data,
                })
            );
        });
    }

    onRowClick(event: Event) {
        const selectedTask = (event as CustomEvent).detail.value.obj;
        this.store.dispatch(
            TaskDetailsExtActions.navigateToTaskDetails({
                appId: ALL_APPS,
                selectedTask,
            })
        );
    }

    toggleMetadata() {
        this.showMetadata = !this.showMetadata;
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
        this.store.dispatch(ProcessDetailsExtActions.resetSelectedProcess());
    }
}
