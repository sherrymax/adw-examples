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
import { ProcessModule, ProcessFilterService } from '@alfresco/adf-process-services';
import { Store } from '@ngrx/store';
import { setupTestBed } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessFiltersExtComponent } from './process-filters-ext.component';
import { of } from 'rxjs';
import { mockProcessFilter } from '../../mock/process-filters.mock';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';
import { ALL_APPS } from '../../models/process-service.model';

describe('ProcessFiltersExtComponent', () => {
    let component: ProcessFiltersExtComponent;
    let fixture: ComponentFixture<ProcessFiltersExtComponent>;
    let store: Store<ProcessServiceExtensionState>;
    let processFilterService: ProcessFilterService;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, TranslateModule.forRoot()],
        declarations: [ProcessFiltersExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessFiltersExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        processFilterService = fixture.debugElement.injector.get(ProcessFilterService);
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(of([mockProcessFilter]));
        component.appId = ALL_APPS;
        fixture.detectChanges();
    });

    it('Should dispatch a navigateToProcessesAction on click of a process filter', () => {
        const navigateToProcessesActionSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            appId: ALL_APPS,
            filterId: mockProcessFilter.id,
            type: 'NAVIGATE_TO_PROCESSES',
        };
        component.onProcessFilterClick(mockProcessFilter);

        expect(navigateToProcessesActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should filterSelected emit when a process filter is selected', () => {
        const filterSelectedEmitterSpy = spyOn(component.filterSelected, 'emit');
        component.onProcessFilterClick(mockProcessFilter);
        expect(filterSelectedEmitterSpy).toHaveBeenCalledWith(mockProcessFilter);
    });
});
