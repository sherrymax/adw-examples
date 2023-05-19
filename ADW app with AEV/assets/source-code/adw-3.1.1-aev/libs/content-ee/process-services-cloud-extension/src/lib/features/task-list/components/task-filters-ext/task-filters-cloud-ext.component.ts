/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import {
    TaskFilterCloudModel,
    FilterParamsModel,
} from '@alfresco/adf-process-services-cloud';
import { Store } from '@ngrx/store';
import {
    navigateToTasks,
    setProcessManagementFilter,
} from '../../../../store/actions/process-management-filter.actions';
import { Observable } from 'rxjs';
import {
    selectProcessManagementFilter,
    selectApplicationName,
} from '../../../../store/selectors/extension.selectors';
import { FilterType } from '../../../../store/states/extension.state';

@Component({
    selector: 'apa-task-filters-cloud-ext',
    templateUrl: './task-filters-cloud-ext.component.html',
})
export class TaskFiltersCloudExtComponent implements OnInit {
    appName$: Observable<string>;
    currentTaskFilter$: Observable<FilterParamsModel>;

    constructor(private store: Store<any>) {}

    ngOnInit() {
        this.appName$ = this.store.select(selectApplicationName);
        this.currentTaskFilter$ = this.store.select(
            selectProcessManagementFilter
        );
    }

    onTaskFilterClick(filter: TaskFilterCloudModel) {
        if (filter) {
            this.setProcessManagementFilter(filter);
            this.navigateToTasks(filter.id);
        }
    }

    private setProcessManagementFilter(filter: TaskFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.TASK,
                    filter,
                },
            })
        );
    }

    private navigateToTasks(filterId: string) {
        this.store.dispatch(
            navigateToTasks({
                filterId,
            })
        );
    }
}
