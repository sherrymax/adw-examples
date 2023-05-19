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
import { ProcessListExtService } from './process-list-ext.service';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { of } from 'rxjs';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { getProcessFilterById } from '../../../process-services-ext.selector';
import { mockProcessFilter } from '../../../mock/process-filters.mock';
import { fakeRunningProcessInstance } from '../../../mock/process-instances.mock';
import { ProcessFilterService } from '@alfresco/adf-process-services';

describe('ProcessListExtService', () => {
    let store: Store<any>;
    let service: ProcessListExtService;
    let userPreferencesService: UserPreferencesService;
    let mockStore: MockStore<ProcessServiceExtensionState>;
    let processFilterService: ProcessFilterService;
    let getProcessFilterByIdSpy: jasmine.Spy;

    setupTestBed({
        imports: [TranslateModule.forRoot(), ProcessServicesTestingModule],
        providers: [ProcessListExtService, UserPreferencesService, MockStore, provideMockStore()],
    });

    beforeEach(() => {
        store = TestBed.inject(Store);
        service = TestBed.inject(ProcessListExtService);
        userPreferencesService = TestBed.inject(UserPreferencesService);
        processFilterService = TestBed.inject(ProcessFilterService);
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
        getProcessFilterByIdSpy = spyOn(processFilterService, 'getProcessFilterById').and.returnValue(of(<any> mockProcessFilter));
    });

    it('Should fetch supportedPageSizes', (done) => {
        service.fetchPaginationPreference().subscribe((pagination) => {
            expect(pagination.pageSize).toEqual('5');
            expect(pagination.supportedPageSizes).toEqual([5, 10, 15, 20]);
            done();
        });
    });

    it('Should be able fetch process filter by id from the store', (done) => {
        mockStore.overrideSelector(getProcessFilterById, mockProcessFilter);
        const selectSpy = spyOn(store, 'select').and.callThrough();
        service.getProcessFilterById(1).subscribe((res) => {
            expect(selectSpy).toHaveBeenCalled();
            expect(res).toEqual(mockProcessFilter);
            done();
        });
    });

    it('Should be able to call an API to fetch process filter by id if filter is not present in store', (done) => {
        mockStore.overrideSelector(getProcessFilterById, undefined);
        service.getProcessFilterById(1).subscribe((res) => {
            expect(getProcessFilterByIdSpy).toHaveBeenCalled();
            expect(res).toEqual(mockProcessFilter);
            done();
        });
    });

    it('Should dispatch selectFilterAction', () => {
        const expectedSelectFilterAction = ProcessServicesExtActions.selectFilterAction(
            ProcessServicesExtActions.selectFilterAction({
                filter: mockProcessFilter,
            })
        );
        service.selectFilter(mockProcessFilter);

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
        const expectedToggleProcessManagementAction = ProcessServicesExtActions.processDetailsAction(
            ProcessServicesExtActions.processDetailsAction({
                appId: 123,
                processInstance: fakeRunningProcessInstance,
            })
        );
        service.navigateToProcessDetails(123, fakeRunningProcessInstance);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedToggleProcessManagementAction]);
    });
});
