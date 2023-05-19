/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { getDefaultTaskFilter } from '../../../process-services-ext.selector';
import { ALL_APPS } from '../../../models/process-service.model';
import { navigateToTaskDetails } from '../../../store/actions/task-details-ext.actions';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';

@Injectable()
export class TaskListExtEffect {
    constructor(private store: Store<ProcessServiceExtensionState>, private actions$: Actions, private router: Router) {}


    navigateToTasks$ = createEffect(() => this.actions$.pipe(
        ofType(ProcessServicesExtActions.navigateToTasksAction),
        map((action) => {
            void this.router.navigateByUrl(`apps/${action.appId}/tasks/${action.filterId}`);
        })
    ), { dispatch: false });


    navigateToTaskDetails$ = createEffect(() => this.actions$.pipe(
        ofType(navigateToTaskDetails),
        tap((action) => {
            this.store.dispatch(TaskDetailsExtActions.setTaskDetails({ taskDetails: action.selectedTask }));
            void this.router.navigateByUrl(`apps/${action.appId}/task-details/${action.selectedTask.id}`);
        })
    ), { dispatch: false });


    navigateToTaskDefaultFilter$ = createEffect(() => this.actions$.pipe(
        ofType(ProcessServicesExtActions.navigateToDefaultTaskFilter),
        switchMap(() => this.store.select(getDefaultTaskFilter).pipe(take(1))),
        map((defaultTaskFilter: FilterRepresentationModel) => {
            if (defaultTaskFilter) {
                void this.router.navigateByUrl(`apps/${ALL_APPS}/tasks/${defaultTaskFilter.id}`);
            }
        })
    ), { dispatch: false });


    showAttacheContentPreview$ = createEffect(() => this.actions$.pipe(
        ofType(ProcessServicesExtActions.showAttachedContentPreviewAction),
        map(() => {
            const previewLocation = `${this.router.url}/view`;
            void this.router.navigate([previewLocation, { outlets: { overlay: ['preview', 'blob'] } }]);
        })
    ), { dispatch: false });
}
