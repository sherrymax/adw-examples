/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, withLatestFrom, catchError } from 'rxjs/operators';
import { PreferenceCloudServiceInterface, PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';
import {
    loadRecentProcessDefinitions,
    loadProcessDefinitions,
    loadProcessDefinitionsSuccess,
    loadProcessDefinitionsFailure,
    setRecentProcessDefinitions
} from '../actions/process-definition.actions';
import { Store } from '@ngrx/store';
import { selectApplicationName } from '../selectors/extension.selectors';
import { of } from 'rxjs';

@Injectable()
export class ProcessDefinitionEffects {
    constructor(
        private actions$: Actions,
        private store: Store<any>,
        private startProcessCloudService: StartProcessCloudService,
        @Inject(PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN) private cloudPreferenceService: PreferenceCloudServiceInterface,
    ) {}

    loadProcessDefinitions$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadProcessDefinitions),
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([, application]) => this.startProcessCloudService.getProcessDefinitions(application, { include: 'variables' }).pipe(
                    map((definitions) => loadProcessDefinitionsSuccess({ definitions })),
                    catchError((error) => of(loadProcessDefinitionsFailure({ error: error.message })))
                ))
            ),
        { dispatch: true }
    );

    loadRecentProcessDefinitions$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadRecentProcessDefinitions),
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([, application]) => this.cloudPreferenceService.getPreferenceByKey(application, 'recent-process-definition-ids').pipe(
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    map((definitionKeys: String[]) => {
                        const keys = definitionKeys.map(key => key.valueOf());
                        return setRecentProcessDefinitions({ definitionKeys: keys });
                    }),
                    catchError(() => of(setRecentProcessDefinitions({ definitionKeys: [] })))
                ))
            ),
        { dispatch: true }
    );
}
