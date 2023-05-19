/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Store } from '@ngrx/store';
import { setSelectedProcess } from '../../../store/actions/process-details-ext.actions';

@Injectable()
export class ProcessListExtEffect {
    constructor(private actions$: Actions, private router: Router, private store: Store<ProcessServiceExtensionState>) {}


    navigateToProcesses$ = createEffect(() => this.actions$.pipe(
        ofType(ProcessServicesExtActions.navigateToProcessesAction),
        tap((action) => {
            void this.router.navigateByUrl(`/apps/${action.appId}/processes/${action.filterId}`);
        })
    ), { dispatch: false });


    processDetails$ = createEffect(() => this.actions$.pipe(
        ofType(ProcessServicesExtActions.processDetailsAction),
        tap((action) => {
            this.store.dispatch(setSelectedProcess({ processInstance: action.processInstance }));
            void this.router.navigateByUrl(`/apps/${action.appId}/process-details/${action.processInstance.id}`);
        })
    ), { dispatch: false });
}
