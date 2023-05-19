/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { take, tap } from 'rxjs/operators';
import { ProcessInstance, ProcessService } from '@alfresco/adf-process-services';
import { ProcessDetailsExtActions } from '../../../process-details-ext-actions-types';
import { loadSelectedProcess } from '../../../store/actions/process-details-ext.actions';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Store } from '@ngrx/store';
import { getSelectedProcess } from '../../../process-services-ext.selector';

@Injectable()
export class ProcessDetailsExtEffect {
    constructor(private actions: Actions, private processService: ProcessService, private store: Store<ProcessServiceExtensionState>) {}

    getSelectedProcess$ = createEffect(
        () =>
            this.actions.pipe(
                ofType(loadSelectedProcess),
                tap((action) => {
                    this.store
                        .select(getSelectedProcess)
                        .pipe(take(1))
                        .subscribe((processInstance) => {
                            if (!processInstance || action.processInstanceId !== processInstance.id) {
                                this.loadProcess(action.processInstanceId);
                            }
                        });
                })
            ),
        { dispatch: false }
    );

    private loadProcess(processInstanceId: string) {
        return this.processService
            .getProcess(processInstanceId)
            .subscribe((process: ProcessInstance) => this.store.dispatch(ProcessDetailsExtActions.setSelectedProcess({ processInstance: process })));
    }
}
