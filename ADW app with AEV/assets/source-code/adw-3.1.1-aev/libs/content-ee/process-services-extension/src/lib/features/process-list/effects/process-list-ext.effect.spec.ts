/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store, Action } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { ALL_APPS } from '../../../models/process-service.model';
import { NAVIGATE_TO_PROCESSES, PROCESS_DETAILS } from '../../../actions/process-services-ext.actions';
import { ProcessListExtEffect } from '../effects/process-list-ext.effect';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { fakeRunningProcessInstance } from '../../../mock/process-instances.mock';

describe('Process List Effects', () => {
    let store: Store<ProcessServiceExtensionState>;
    let router: Router;
    let effects: ProcessListExtEffect;
    let actions$: Observable<Action>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [ProcessListExtEffect, provideMockActions(() => actions$)],
        });
        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        effects = TestBed.inject(ProcessListExtEffect);
    });

    it('Should navigate to process list with appId and filterId parameters', (done) => {
        actions$ = of({
            type: NAVIGATE_TO_PROCESSES,
            appId: ALL_APPS,
            filterId: 15,
        });

        spyOn(router, 'navigateByUrl');

        effects.navigateToProcesses$.subscribe(() => done());
        expect(router.navigateByUrl).toHaveBeenCalledWith(`/apps/${ALL_APPS}/processes/15`);
    });

    it('Should set the selected process and navigate to process-details', (done) => {
        const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
        const dispatchStoreSpy = spyOn(store, 'dispatch');
        actions$ = of({
            type: PROCESS_DETAILS,
            appId: ALL_APPS,
            processInstance: fakeRunningProcessInstance,
        });

        const expectedSetSelectedProcessActionPayload = {
            type: 'SET_SELECTED_PROCESS',
            processInstance: fakeRunningProcessInstance,
        };

        effects.processDetails$.subscribe(() => done());

        expect(navigateByUrlSpy).toHaveBeenCalledWith(`/apps/${ALL_APPS}/process-details/1`);
        expect(dispatchStoreSpy).toHaveBeenCalledWith(expectedSetSelectedProcessActionPayload);
    });
});
