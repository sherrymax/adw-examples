/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { setupTestBed } from '@alfresco/adf-core';
import { ProcessServicesCloudTestingModule } from '../../../../../lib/testing/process-services-cloud-testing.module';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { ProcessFiltersCloudExtComponent } from './process-filters-cloud-ext.component';
import { fakeProcessCloudFilter } from '../../mock/process-filter.mock';
import { FilterType } from '../../../../store/states/extension.state';

describe('TaskFiltersCloudExtComponent', () => {
    let component: ProcessFiltersCloudExtComponent;
    let fixture: ComponentFixture<ProcessFiltersCloudExtComponent>;
    let store: Store<any>;

    setupTestBed({
        imports: [ProcessServicesCloudTestingModule, TranslateModule.forRoot()],
        providers: [
            {
                provide: Store,
                useValue: {
                    select: (selector) => {
                        if (selector === selectApplicationName) {
                            return of('mock-appName');
                        }
                        return of({});
                    },
                    dispatch: () => {},
                },
            },
        ],
        declarations: [ProcessFiltersCloudExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessFiltersCloudExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        fixture.detectChanges();
    });

    it('Should dispatch a navigateToFilterAction on click of process filter', () => {
        const navigateToProcessActionSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            filterId: '1',
            type: '[ProcessCloud] navigateToProcesses',
        };
        component.onProcessFilterClick(fakeProcessCloudFilter);
        expect(navigateToProcessActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should dispatch a setProcessManagementFilter on click of process filter', () => {
        const setProcessManagementFilterSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            payload: { filter: fakeProcessCloudFilter, type: FilterType.PROCESS },
            type: '[ProcessCloud] setProcessManagementFilter',
        };
        component.onProcessFilterClick(fakeProcessCloudFilter);
        expect(setProcessManagementFilterSpy).toHaveBeenCalledWith(expectedPayload);
    });
});
