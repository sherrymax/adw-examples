/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map } from 'rxjs/operators';
import { SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { updateProcessServiceHealth } from '../actions/process-services-health.actions';

@Injectable()
export class ProcessHealthEffects {
    constructor(private actions$: Actions) {}

    updateHealth$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(updateProcessServiceHealth),
                filter((action) => !action.health),
                map(() => new SnackbarErrorAction('PROCESS-EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'))
            ),
        { dispatch: true }
    );
}
