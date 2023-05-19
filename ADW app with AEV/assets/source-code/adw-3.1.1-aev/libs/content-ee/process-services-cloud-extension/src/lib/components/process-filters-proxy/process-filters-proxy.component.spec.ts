/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFiltersProxyComponent } from './process-filters-proxy.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AppConfigService, AppConfigServiceMock, setupTestBed } from '@alfresco/adf-core';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import {
    LocalPreferenceCloudService,
    PROCESS_FILTERS_SERVICE_TOKEN,
    ProcessFilterCloudService
} from '@alfresco/adf-process-services-cloud';
import { of } from 'rxjs';
import { navigateToProcesses } from '../../store/actions/process-management-filter.actions';
import { mockProcessCloudFilters } from '../mock/cloud-filters.mock';

describe('ProcessFiltersProxyComponent', () => {
    let fixture: ComponentFixture<ProcessFiltersProxyComponent>;
    let store: Store<any>;
    let processFilterCloudService: ProcessFilterCloudService;
    let appConfigService: AppConfigService;

    setupTestBed({
        imports: [ProcessServicesCloudTestingModule],
        declarations: [ProcessFiltersProxyComponent],
        providers: [
            { provide: AppConfigService, useClass: AppConfigServiceMock },
            { provide: PROCESS_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService }
        ]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessFiltersProxyComponent);
        store = TestBed.inject(Store);
        processFilterCloudService = TestBed.inject(ProcessFilterCloudService);

        appConfigService = TestBed.inject(AppConfigService);
        appConfigService.config = Object.assign(appConfigService.config, {
            'alfresco-deployed-apps': [{ name: 'mockApp' }]
        });
    });

    it('should navigate to the first process filter', () => {
        spyOn(processFilterCloudService, 'getProcessFilters').and.returnValue(of(mockProcessCloudFilters));
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedAction = navigateToProcesses({ filterId: '14' });
        fixture.detectChanges();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
    });

    it('should get the app name from app config deployed apps to fetch the filters', () => {
        const getProcessFiltersSpy = spyOn(processFilterCloudService, 'getProcessFilters').and.returnValue(of([]));
        fixture.detectChanges();

        expect(getProcessFiltersSpy).toHaveBeenCalledWith('mockApp');
    });
});
