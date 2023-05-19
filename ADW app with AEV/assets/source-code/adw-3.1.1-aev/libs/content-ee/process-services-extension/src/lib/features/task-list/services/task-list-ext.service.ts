/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { UserPreferencesService } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Observable, of } from 'rxjs';
import { FilterRepresentationModel, TaskDetailsModel, TaskFilterService } from '@alfresco/adf-process-services';
import { getTaskFilterById } from '../../../process-services-ext.selector';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { BaseListService } from '../../../services/base-list.service';
import { switchMap } from 'rxjs/operators';
import { ALL_APPS } from '../../../models/process-service.model';

@Injectable({
    providedIn: 'root',
})
export class TaskListExtService extends BaseListService {
    constructor(userPreferenceService: UserPreferencesService, protected store: Store<ProcessServiceExtensionState>, private taskFilterService: TaskFilterService) {
        super(userPreferenceService, store);
    }

    getTaskFilterById(filterId: number): Observable<FilterRepresentationModel> {
        return this.store.select(getTaskFilterById, { id: filterId }).pipe(
            switchMap((filter: FilterRepresentationModel) => filter ? of(filter) : this.taskFilterService.getTaskFilterById(filterId, ALL_APPS))
        );
    }

    navigateToTaskDetails(appId: number, selectedTask: TaskDetailsModel) {
        this.store.dispatch(
            TaskDetailsExtActions.navigateToTaskDetails({
                appId: appId,
                selectedTask,
            })
        );
    }
}
