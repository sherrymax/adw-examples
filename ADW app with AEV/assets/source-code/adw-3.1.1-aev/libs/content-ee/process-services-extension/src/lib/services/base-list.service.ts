/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../store/reducers/process-services.reducer';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { ProcessServicesExtActions } from '../process-services-ext-actions-types';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Pagination, UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';

export class BaseListService {
    constructor(private userPreferenceService: UserPreferencesService, protected store: Store<ProcessServiceExtensionState>) {}

    selectFilter(filter: FilterRepresentationModel | UserProcessInstanceFilterRepresentation) {
        this.store.dispatch(
            ProcessServicesExtActions.selectFilterAction({
                filter: filter,
            })
        );
    }

    expandProcessManagementSection() {
        this.store.dispatch(
            ProcessServicesExtActions.toggleProcessManagement({
                expanded: true,
            })
        );
    }

    fetchPaginationPreference(): Observable<{ pageSize: string; supportedPageSizes: any[] }> {
        const preferencePageSize = this.userPreferenceService.get(UserPreferenceValues.PaginationSize);
        const pageSize$ = preferencePageSize ? of(preferencePageSize) : this.userPreferenceService.select(UserPreferenceValues.PaginationSize);
        return pageSize$.pipe(
            switchMap((pageSize) => this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).pipe(
                map((supportedPageSizes) => {
                    if (typeof supportedPageSizes === 'string') {
                        supportedPageSizes = JSON.parse(supportedPageSizes);
                    }
                    return { pageSize, supportedPageSizes };
                })
            ))
        );
    }

    setPageSize(event: Pagination) {
        this.userPreferenceService.paginationSize = event.maxItems;
    }
}
