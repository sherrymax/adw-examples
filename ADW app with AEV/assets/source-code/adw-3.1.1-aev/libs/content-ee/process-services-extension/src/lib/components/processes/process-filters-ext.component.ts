/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ALL_APPS } from '../../models/process-service.model';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';
import { BaseFiltersExtComponent } from '../../models/base-filters-ext.component';

@Component({
    selector: 'aps-process-filters-ext',
    templateUrl: './process-filters-ext.component.html',
})
export class ProcessFiltersExtComponent extends BaseFiltersExtComponent {
    constructor(private store: Store<ProcessServiceExtensionState>) {
        super();
    }

    onProcessFilterClick(filter: UserProcessInstanceFilterRepresentation) {
        this.store.dispatch(
            ProcessServicesExtActions.navigateToProcessesAction({
                appId: ALL_APPS,
                filterId: filter.id,
            })
        );
        this.filterSelected.emit(filter);
    }
}
