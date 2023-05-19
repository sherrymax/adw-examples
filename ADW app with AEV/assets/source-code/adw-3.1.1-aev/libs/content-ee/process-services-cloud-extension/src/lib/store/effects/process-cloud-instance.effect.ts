/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { processCreationSuccess } from '../actions/process-instance-cloud.action';
import { switchMap, tap, take } from 'rxjs/operators';
import { SnackbarInfoAction } from '@alfresco-dbp/content-ce/shared/store';
import { combineLatest, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectRecentProcessDefinitionKeys } from '../selectors/process-definitions.selector';
import { setRecentProcessDefinitions } from '../actions/process-definition.actions';
import { PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN, PreferenceCloudServiceInterface } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName } from '../selectors/extension.selectors';

@Injectable()
export class ProcessInstanceEffect {
    constructor(
        private actions$: Actions,
        private store: Store<any>,
        @Inject(PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN) private cloudPreferenceService: PreferenceCloudServiceInterface,
    ) {}

    processCreationSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(processCreationSuccess),
            switchMap(({ processDefinitionKey }) => {
                return combineLatest([
                    this.store.select(selectRecentProcessDefinitionKeys),
                    this.store.select(selectApplicationName),
                ]).pipe(
                    take(1),
                    switchMap(([currentRecentDefinitions, applicationName]) => {
                        const recentDefinitions = this.getRecentProcessDefinitionsKeys(
                            processDefinitionKey,
                            currentRecentDefinitions
                        );

                        return of<[string[], string]>([recentDefinitions, applicationName]);
                    })
                );
            }),
            tap<[string[], string]>(([definitionKeys, applicationName]) => {
                this.cloudPreferenceService.updatePreference(
                    applicationName,
                    'recent-process-definition-ids',
                    definitionKeys
                );
            }),
            switchMap(([definitionKeys]) => of(setRecentProcessDefinitions({ definitionKeys })))
        ),
    );

    showProcessCreationSuccessMessage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(processCreationSuccess),
            switchMap(({ processName }) => of(
                new SnackbarInfoAction(
                    'PROCESS_CLOUD_EXTENSION.SNACKBAR.PROCESS-CREATED',
                    { processName }
                )
            )),
        )
    );

    private getRecentProcessDefinitionsKeys(
        newRecentDefinitionKey: string,
        currentRecentProcessDefinitions: string[]
    ): string[] {
        const recentList = [...currentRecentProcessDefinitions];

        const newRecentDefinitionIndex = recentList.findIndex(
            (definitionKey) => definitionKey === newRecentDefinitionKey
        );
        const isNewRecentDefinitionAlreadyOnList = newRecentDefinitionIndex > -1;

        if (isNewRecentDefinitionAlreadyOnList) {
            recentList.splice(newRecentDefinitionIndex, 1);
        } else if (recentList.length >= 3) {
            recentList.pop();
        }

        recentList.unshift(newRecentDefinitionKey);

        return recentList;
    }
}

