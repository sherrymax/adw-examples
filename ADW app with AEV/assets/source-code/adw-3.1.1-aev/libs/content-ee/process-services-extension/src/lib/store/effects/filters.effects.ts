/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, take, filter } from 'rxjs/operators';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';
import { TaskFilterService, FilterRepresentationModel, ProcessFilterService } from '@alfresco/adf-process-services';
import { loadTaskFiltersAction, loadProcessFiltersAction, loadFiltersAction } from '../../actions/process-services-ext.actions';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { ALL_APPS } from '../../models/process-service.model';
import { Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../reducers/process-services.reducer';
import { getTaskFilters, getProcessFilters } from '../../process-services-ext.selector';

@Injectable()
export class FiltersEffects {
    constructor(
        private store: Store<ProcessServiceExtensionState>,
        private processFilterService: ProcessFilterService,
        private taskFilterService: TaskFilterService,
        private actions$: Actions
    ) {}

    loadFilters$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadFiltersAction),
                switchMap(() => [ProcessServicesExtActions.loadTaskFiltersAction({}), ProcessServicesExtActions.loadProcessFiltersAction({})])
            ),
        { dispatch: true }
    );

    loadTaskFilters$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadTaskFiltersAction),
                switchMap(() => this.store.select(getTaskFilters).pipe(take(1))),
                filter((taskFilters: FilterRepresentationModel[]) => taskFilters?.length === 0),
                switchMap(() => this.getTaskFilters())
            ),
        { dispatch: true }
    );

    loadProcessFilters$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadProcessFiltersAction),
                switchMap(() => this.store.select(getProcessFilters).pipe(take(1))),
                filter((processFilters: UserProcessInstanceFilterRepresentation[]) => processFilters?.length === 0),
                switchMap(() => this.getProcessFilters())
            ),
        { dispatch: true }
    );

    private getTaskFilters() {
        return this.taskFilterService.getTaskListFilters().pipe(
            switchMap((taskFilters: FilterRepresentationModel[]) => taskFilters && taskFilters.length > 0
                ? this.setTaskFilters(taskFilters)
                : this.taskFilterService.createDefaultFilters(ALL_APPS).pipe(switchMap((defaultFilters) => this.setTaskFilters(defaultFilters))))
        );
    }

    private getProcessFilters() {
        return this.processFilterService.getProcessFilters(ALL_APPS).pipe(
            switchMap((processFilters: UserProcessInstanceFilterRepresentation[]) => processFilters && processFilters.length > 0
                ? this.setProcessFilters(processFilters)
                : this.processFilterService.createDefaultFilters(ALL_APPS).pipe(switchMap((defaultFilters) => this.setProcessFilters(defaultFilters))))
        );
    }

    private setProcessFilters(filters: UserProcessInstanceFilterRepresentation[]) {
        return [
            ProcessServicesExtActions.setProcessFiltersAction({
                filters,
            }),
        ];
    }

    private setTaskFilters(filters: FilterRepresentationModel[]) {
        return [
            ProcessServicesExtActions.setTaskFiltersAction({
                filters,
            }),
        ];
    }
}
