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
import { initialiseExtension } from '../actions/extension.actions';

@Injectable()
export class ProcessCloudHealthEffects {
    constructor(private actions$: Actions) {}

    updateHealth$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(initialiseExtension),
                filter((action) => !action.health),
                map(() => new SnackbarErrorAction('PROCESS_CLOUD_EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'))
            ),
        { dispatch: true }
    );
}
