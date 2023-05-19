/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { ALL_APPS } from '../../models/process-service.model';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';
import { BaseFiltersExtComponent } from '../../models/base-filters-ext.component';

@Component({
    selector: 'aps-task-filters-ext',
    templateUrl: './task-filters-ext.component.html',
})
export class TaskFiltersExtComponent extends BaseFiltersExtComponent {
    constructor(private store: Store<ProcessServiceExtensionState>) {
        super();
    }

    onTaskFilterClick(selectedFilter: FilterRepresentationModel) {
        this.store.dispatch(
            ProcessServicesExtActions.navigateToTasksAction({
                appId: ALL_APPS,
                filterId: selectedFilter.id,
            })
        );
        this.filterSelected.emit(selectedFilter);
    }
}
