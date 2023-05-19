/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { Observable, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { provideMockActions } from '@ngrx/effects/testing';
import { ProcessDetailsExtEffect } from '../effects/process-details-ext.effect';
import { LOAD_SELECTED_PROCESS } from '../../../store/actions/process-details-ext.actions';
import { ProcessService } from '@alfresco/adf-process-services';
import { fakeRunningProcessInstance } from '../../../mock/process-instances.mock';

describe('ProcessDetailsExtEffects', () => {
    let store: Store<ProcessServiceExtensionState>;
    let effects: ProcessDetailsExtEffect;
    let actions$: Observable<Action>;
    let processService: ProcessService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [ProcessDetailsExtEffect, provideMockActions(() => actions$), ProcessService],
        });
        store = TestBed.inject(Store);
        effects = TestBed.inject(ProcessDetailsExtEffect);
        processService = TestBed.inject(ProcessService);
    });

    it('Should fetch the selected process instance from the API when it is not present in the store', () => {
        const getProcessSpy = spyOn(processService, 'getProcess').and.returnValue(of(fakeRunningProcessInstance));
        const processIdNotPresentInMemory = '1002';
        actions$ = of({
            type: LOAD_SELECTED_PROCESS,
            processInstanceId: processIdNotPresentInMemory,
        });
        effects.getSelectedProcess$.subscribe(() => {});

        expect(getProcessSpy).toHaveBeenCalledWith(processIdNotPresentInMemory);
    });

    it('Should not fetch the selected process instance from the API when it is already present in the store', () => {
        spyOn(store, 'select').and.returnValue(of(fakeRunningProcessInstance));
        const getProcessSpy = spyOn(processService, 'getProcess').and.returnValue(of(fakeRunningProcessInstance));
        actions$ = of({
            type: LOAD_SELECTED_PROCESS,
            processInstanceId: fakeRunningProcessInstance.id,
        });
        effects.getSelectedProcess$.subscribe(() => {});

        expect(getProcessSpy).not.toHaveBeenCalledWith(fakeRunningProcessInstance.id);
    });

    it('Should fetch the process from the API when the process present in memory is different from the requested process', () => {
        spyOn(store, 'select').and.returnValue(of(fakeRunningProcessInstance));
        const getProcessSpy = spyOn(processService, 'getProcess').and.returnValue(of(fakeRunningProcessInstance));
        const processIdNotPresentInMemory = '1002';
        actions$ = of({
            type: LOAD_SELECTED_PROCESS,
            processInstanceId: processIdNotPresentInMemory,
        });
        effects.getSelectedProcess$.subscribe(() => {});

        expect(getProcessSpy).toHaveBeenCalledWith(processIdNotPresentInMemory);
    });
});
