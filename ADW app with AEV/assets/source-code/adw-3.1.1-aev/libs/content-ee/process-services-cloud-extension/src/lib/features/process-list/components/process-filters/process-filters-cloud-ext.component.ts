/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
    FilterParamsModel,
    ProcessFilterCloudModel,
} from '@alfresco/adf-process-services-cloud';
import {
    navigateToProcesses,
    setProcessManagementFilter,
} from '../../../../store/actions/process-management-filter.actions';
import {
    selectApplicationName,
    selectProcessManagementFilter,
} from '../../../../store/selectors/extension.selectors';
import { FilterType } from '../../../../store/states/extension.state';

@Component({
    selector: 'apa-process-filters-ext',
    templateUrl: './process-filters-cloud-ext.component.html',
})
export class ProcessFiltersCloudExtComponent implements OnInit {
    appName$: Observable<string>;
    currentFilter$: Observable<FilterParamsModel>;

    constructor(private store: Store<any>) {}

    ngOnInit() {
        this.appName$ = this.store.select(selectApplicationName);
        this.currentFilter$ = this.store.select(selectProcessManagementFilter);
    }

    onProcessFilterClick(filter: ProcessFilterCloudModel) {
        if (filter) {
            this.setProcessManagementFilter(filter);
            this.navigateToProcesses(filter.id);
        }
    }

    private setProcessManagementFilter(filter: ProcessFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter,
                },
            })
        );
    }

    private navigateToProcesses(filterId: string) {
        this.store.dispatch(
            navigateToProcesses({
                filterId,
            })
        );
    }
}
