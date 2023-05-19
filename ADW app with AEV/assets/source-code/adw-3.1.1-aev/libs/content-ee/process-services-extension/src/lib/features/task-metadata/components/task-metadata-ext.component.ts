/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TaskDetailsModel } from '@alfresco/adf-process-services';
import { CardViewUpdateService, UpdateNotification } from '@alfresco/adf-core';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';

@Component({
    selector: 'aps-task-metadata-ext',
    templateUrl: './task-metadata-ext.component.html',
    styleUrls: ['./task-metadata-ext.component.scss'],
})
export class TaskMetadataExtComponent implements OnInit, OnDestroy {
    @Input()
    taskDetails: TaskDetailsModel;

    cardViewUpdateSub: Subscription;

    constructor(private store: Store<ProcessServiceExtensionState>, private cardViewUpdateService: CardViewUpdateService) {}

    ngOnInit(): void {
        this.cardViewUpdate();
    }

    private cardViewUpdate() {
        this.cardViewUpdateSub = this.cardViewUpdateService.itemUpdated$.subscribe(this.updateTaskDetails.bind(this));
    }

    private updateTaskDetails(updatedNotification: UpdateNotification) {
        this.store.dispatch(
            TaskDetailsExtActions.updateTaskDetails({
                taskId: this.taskDetails.id,
                taskDetails: this.taskDetails,
                updatedNotification: updatedNotification,
            })
        );
    }

    ngOnDestroy() {
        this.cardViewUpdateSub.unsubscribe();
    }
}
