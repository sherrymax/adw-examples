/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessServicesTestingModule } from '../../testing/process-services-testing.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessModule, TaskFilterService } from '@alfresco/adf-process-services';
import { Store } from '@ngrx/store';
import { setupTestBed } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { TaskFiltersExtComponent } from './task-filters-ext.component';
import { of } from 'rxjs';
import { fakeTaskFilters, mockTaskFilter } from '../../mock/task-filters.mock';
import { ALL_APPS } from '../../models/process-service.model';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';

describe('TaskFiltersExtComponent', () => {
    let component: TaskFiltersExtComponent;
    let fixture: ComponentFixture<TaskFiltersExtComponent>;
    let taskFilterService: TaskFilterService;
    let store: Store<ProcessServiceExtensionState>;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, TranslateModule.forRoot()],
        declarations: [TaskFiltersExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskFiltersExtComponent);
        component = fixture.componentInstance;
        taskFilterService = fixture.debugElement.injector.get(TaskFilterService);
        store = TestBed.inject(Store);
        spyOn(taskFilterService, 'getTaskListFilters').and.returnValue(of(fakeTaskFilters));
        component.appId = ALL_APPS;
        fixture.detectChanges();
    });

    it('Should dispatch a navigateToProcessesAction on click of task filter', () => {
        const navigateToTasksActionSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            appId: ALL_APPS,
            filterId: mockTaskFilter.id,
            type: 'NAVIGATE_TO_TASKS',
        };
        component.onTaskFilterClick(mockTaskFilter);

        expect(navigateToTasksActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should filterSelected emit when a task filter is selected', () => {
        const filterSelectedEmitterSpy = spyOn(component.filterSelected, 'emit');
        component.onTaskFilterClick(mockTaskFilter);
        expect(filterSelectedEmitterSpy).toHaveBeenCalledWith(mockTaskFilter);
    });
});
