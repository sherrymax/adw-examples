/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TaskFiltersProxyComponent } from './task-filters-proxy.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import {
    LocalPreferenceCloudService,
    TASK_FILTERS_SERVICE_TOKEN,
    TaskFilterCloudService
} from '@alfresco/adf-process-services-cloud';
import { AppConfigService, AppConfigServiceMock, setupTestBed } from '@alfresco/adf-core';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import { of } from 'rxjs';
import { mockTaskCloudFilters } from '../mock/cloud-filters.mock';
import { navigateToTasks } from '../../store/actions/process-management-filter.actions';

describe('TaskFiltersProxyComponent', () => {
    let fixture: ComponentFixture<TaskFiltersProxyComponent>;
    let store: Store<any>;
    let taskFilterCloudService: TaskFilterCloudService;
    let appConfigService: AppConfigService;

    setupTestBed({
        imports: [ProcessServicesCloudTestingModule],
        declarations: [TaskFiltersProxyComponent],
        providers: [
            { provide: AppConfigService, useClass: AppConfigServiceMock },
            { provide: TASK_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService }
        ]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskFiltersProxyComponent);
        store = TestBed.inject(Store);
        taskFilterCloudService = TestBed.inject(TaskFilterCloudService);

        appConfigService = TestBed.inject(AppConfigService);
        appConfigService.config = Object.assign(appConfigService.config, {
            'alfresco-deployed-apps': [{ name: 'mockApp' }]
        });
    });

    it('should navigate to the first task filter', () => {
        spyOn(taskFilterCloudService, 'getTaskListFilters').and.returnValue(of(mockTaskCloudFilters));
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedAction = navigateToTasks({ filterId: '199' });
        fixture.detectChanges();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
    });

    it('should get the app name from app config deployed apps to fetch the filters', () => {
        const getTaskFiltersSpy = spyOn(taskFilterCloudService, 'getTaskListFilters').and.returnValue(of([]));
        fixture.detectChanges();

        expect(getTaskFiltersSpy).toHaveBeenCalledWith('mockApp');
    });
});
