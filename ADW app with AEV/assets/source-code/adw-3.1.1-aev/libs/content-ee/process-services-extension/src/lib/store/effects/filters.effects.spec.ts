/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action, Store } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { ProcessServicesTestingModule } from '../../testing/process-services-testing.module';
import { FiltersEffects } from './filters.effects';
import { ProcessFilterService, TaskFilterService } from '@alfresco/adf-process-services';
import { loadTaskFiltersAction, loadProcessFiltersAction } from '../../actions/process-services-ext.actions';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { fakeTaskFilters } from '../../mock/task-filters.mock';
import { fakeProcessFilters } from '../../mock/process-filters.mock';
import { ProcessServiceExtensionState } from '../reducers/process-services.reducer';

describe('FiltersEffects', () => {
    let effects: FiltersEffects;
    let actions$: Observable<Action>;
    let processFilterService: ProcessFilterService;
    let taskFilterService: TaskFilterService;
    let getTaskListFiltersSpy: jasmine.Spy;
    let getProcessFiltersSpy: jasmine.Spy;
    let createTaskDefaultFiltersSpy: jasmine.Spy;
    let createProcessDefaultFiltersSpy: jasmine.Spy;
    let store: Store<ProcessServiceExtensionState>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [FiltersEffects, provideMockActions(() => actions$)],
        });
        effects = TestBed.inject(FiltersEffects);
        store = TestBed.inject(Store);
        processFilterService = TestBed.inject(ProcessFilterService);
        taskFilterService = TestBed.inject(TaskFilterService);
        getTaskListFiltersSpy = spyOn(taskFilterService, 'getTaskListFilters').and.returnValue(of(fakeTaskFilters));
        getProcessFiltersSpy = spyOn(processFilterService, 'getProcessFilters').and.returnValue(of(<any> fakeProcessFilters));

        createTaskDefaultFiltersSpy = spyOn(taskFilterService, 'createDefaultFilters').and.returnValue(of(fakeTaskFilters));
        createProcessDefaultFiltersSpy = spyOn(processFilterService, 'createDefaultFilters').and.returnValue(of(<any> fakeProcessFilters));
    });

    it('Should dispatch setTaskFiltersAction action on loadTaskFiltersAction', (done) => {
        actions$ = of(loadTaskFiltersAction({}));
        const expectedValue = ProcessServicesExtActions.setTaskFiltersAction({ filters: fakeTaskFilters });

        effects.loadTaskFilters$.subscribe((action) => {
            expect(action).toEqual(expectedValue);
            done();
        });
    });

    it('Should dispatch setProcessFiltersAction action on loadProcessFiltersAction', (done) => {
        actions$ = of(loadProcessFiltersAction({}));
        const expectedValue = ProcessServicesExtActions.setProcessFiltersAction({ filters: fakeProcessFilters });

        effects.loadProcessFilters$.subscribe((action) => {
            expect(action).toEqual(expectedValue);
            done();
        });
    });

    it('Should be able to fetch task filters', (done) => {
        actions$ = of(loadTaskFiltersAction({}));

        effects.loadTaskFilters$.subscribe(() => {
            expect(getTaskListFiltersSpy).toHaveBeenCalled();
            done();
        });
    });

    it('Should be able to fetch process filters', (done) => {
        actions$ = of(loadProcessFiltersAction({}));

        effects.loadProcessFilters$.subscribe(() => {
            expect(getProcessFiltersSpy).toHaveBeenCalled();
            done();
        });
    });

    it('Should not be able to call an API to fetch process filters if filters are present in store', () => {
        spyOn(store, 'select').and.returnValue(of(fakeProcessFilters));
        actions$ = of(loadProcessFiltersAction({}));

        effects.loadProcessFilters$.subscribe(() => {});
        expect(getProcessFiltersSpy).not.toHaveBeenCalled();
    });

    it('Should not be able to call an API to fetch task filters if filters are present in store', () => {
        spyOn(store, 'select').and.returnValue(of(fakeTaskFilters));
        actions$ = of(loadTaskFiltersAction({}));

        effects.loadTaskFilters$.subscribe(() => {});
        expect(getTaskListFiltersSpy).not.toHaveBeenCalled();
    });

    it('Should be able to call an API to fetch process filters if filters are not present in store', () => {
        spyOn(store, 'select').and.returnValue(of([]));
        actions$ = of(loadProcessFiltersAction({}));

        effects.loadProcessFilters$.subscribe(() => {});
        expect(getProcessFiltersSpy).toHaveBeenCalled();
    });

    it('Should be able to call an API to fetch task filters if filters are not present in store', () => {
        spyOn(store, 'select').and.returnValue(of([]));
        actions$ = of(loadTaskFiltersAction({}));

        effects.loadTaskFilters$.subscribe(() => {});
        expect(getTaskListFiltersSpy).toHaveBeenCalled();
    });

    it('Should be able to call an API to create task filters if filters are not yet created and dispatch set task filters action', () => {
        spyOn(store, 'select').and.returnValue(of([]));
        getTaskListFiltersSpy.and.returnValue(of([]));
        actions$ = of(loadTaskFiltersAction({}));

        effects.loadTaskFilters$.subscribe(() => {});
        expect(createTaskDefaultFiltersSpy).toHaveBeenCalled();
    });

    it('Should be able to call an API to create process filters if filters are not yet created and dispatch set process filters action', () => {
        spyOn(store, 'select').and.returnValue(of([]));
        getProcessFiltersSpy.and.returnValue(of([]));
        actions$ = of(loadProcessFiltersAction({}));

        effects.loadProcessFilters$.subscribe(() => {});
        expect(createProcessDefaultFiltersSpy).toHaveBeenCalled();
    });
});
