/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { setupTestBed, UserPreferencesService, AppConfigService } from '@alfresco/adf-core';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { of } from 'rxjs';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { getTaskFilterById } from '../../../process-services-ext.selector';
import { TaskListExtService } from './task-list-ext.service';
import { mockTaskFilter } from '../../../mock/task-filters.mock';
import { taskDetailsMock } from '../../../mock/task-details.mock';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { TaskFilterService } from '@alfresco/adf-process-services';

describe('TaskListExtService', () => {
    let store: Store<ProcessServiceExtensionState>;
    let service: TaskListExtService;
    let taskFilterService: TaskFilterService;
    let userPreferencesService: UserPreferencesService;
    let mockStore: MockStore<ProcessServiceExtensionState>;
    let getTaskFilterByIdSpy: jasmine.Spy;

    setupTestBed({
        imports: [TranslateModule.forRoot(), ProcessServicesTestingModule],
        providers: [TaskListExtService, UserPreferencesService, MockStore, provideMockStore()],
    });

    beforeEach(() => {
        store = TestBed.inject(Store);
        service = TestBed.inject(TaskListExtService);
        userPreferencesService = TestBed.inject(UserPreferencesService);
        taskFilterService = TestBed.inject(TaskFilterService);
        const appConfig = TestBed.inject(AppConfigService);
        appConfig.config = {
            pagination: {
                size: 10,
                supportedPageSizes: [5, 10, 15, 20],
            },
        };

        spyOn(store, 'dispatch');
        spyOn(userPreferencesService, 'get').and.returnValue('5');
        spyOn(userPreferencesService, 'select').and.returnValue(of('[5, 10, 15, 20]'));
        mockStore = TestBed.inject(MockStore);
        getTaskFilterByIdSpy = spyOn(taskFilterService, 'getTaskFilterById').and.returnValue(of(mockTaskFilter));
    });

    it('Should fetch supportedPageSizes', (done) => {
        service.fetchPaginationPreference().subscribe((pagination) => {
            expect(pagination.pageSize).toEqual('5');
            expect(pagination.supportedPageSizes).toEqual([5, 10, 15, 20]);
            done();
        });
    });

    it('Should be able fetch task filter by id from the store', (done) => {
        mockStore.overrideSelector(getTaskFilterById, mockTaskFilter);
        const selectSpy = spyOn(store, 'select').and.callThrough();
        const mockFilterId = 1;
        service.getTaskFilterById(mockFilterId).subscribe((res) => {
            expect(selectSpy).toHaveBeenCalled();
            expect(res).toEqual(mockTaskFilter);
            done();
        });
    });

    it('Should be able to call an API to fetch process filter by id if filter is not present in store', (done) => {
        mockStore.overrideSelector(getTaskFilterById, undefined);
        service.getTaskFilterById(1).subscribe((res) => {
            expect(getTaskFilterByIdSpy).toHaveBeenCalled();
            expect(res).toEqual(mockTaskFilter);
            done();
        });
    });

    it('Should dispatch selectFilterAction', () => {
        const expectedSelectFilterAction = ProcessServicesExtActions.selectFilterAction(
            ProcessServicesExtActions.selectFilterAction({
                filter: mockTaskFilter,
            })
        );
        service.selectFilter(mockTaskFilter);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedSelectFilterAction]);
    });

    it('Should dispatch toggleProcessManagement', () => {
        const expectedToggleProcessManagementAction = ProcessServicesExtActions.toggleProcessManagement(
            ProcessServicesExtActions.toggleProcessManagement({
                expanded: true,
            })
        );
        service.expandProcessManagementSection();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedToggleProcessManagementAction]);
    });

    it('Should dispatch processDetailsAction', () => {
        const expectedToggleProcessManagementAction = TaskDetailsExtActions.navigateToTaskDetails(
            TaskDetailsExtActions.navigateToTaskDetails({
                appId: 123,
                selectedTask: taskDetailsMock,
            })
        );
        service.navigateToTaskDetails(123, taskDetailsMock);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedToggleProcessManagementAction]);
    });
});
