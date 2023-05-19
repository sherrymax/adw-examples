/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { setupTestBed } from '@alfresco/adf-core';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { SidenavExtComponent } from './sidenav-ext.component';
import { ProcessServicesTestingModule } from '../../../../../process-services-extension/src/lib/testing/process-services-testing.module';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';
import { mockProcessFilter } from '../../mock/process-filters.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { fakeTaskFilters, mockTaskFilter } from '../../mock/task-filters.mock';

describe('SidenavExtComponent', () => {
    let component: SidenavExtComponent;
    let fixture: ComponentFixture<SidenavExtComponent>;
    let store: Store<ProcessServiceExtensionState>;

    describe('Process management section', () => {
        const eventsStub = new BehaviorSubject<RouterEvent>(null);
        class RouterStub {
            events = eventsStub;
        }

        setupTestBed({
            imports: [ProcessServicesTestingModule, TranslateModule.forRoot(), MatMenuModule, RouterTestingModule],
            declarations: [SidenavExtComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: Router, useClass: RouterStub }],
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(SidenavExtComponent);
            component = fixture.componentInstance;
            store = TestBed.inject(Store);
            component.data = { state: 'expanded' };
        });

        it('Should unselect filter and collapse process management when the url does not contain "process" or "task" keyword', () => {
            spyOn(store, 'select').and.returnValue(of(mockProcessFilter));
            const filterActionSpy = spyOn(component, 'dispatchSelectFilterAction');
            const toggleProcessManagementSpy = spyOn(component, 'toggleProcessManagement');

            fixture.detectChanges();
            const fakeNavigationEvent = new NavigationStart(1, '/fake-url');
            eventsStub.next(fakeNavigationEvent);

            expect(filterActionSpy).toHaveBeenCalledWith(undefined);
            expect(toggleProcessManagementSpy).toHaveBeenCalledWith(false);
        });

        it('Should mark process management section as active when a filter is selected', () => {
            spyOn(store, 'select').and.returnValue(of(mockProcessFilter));
            fixture.detectChanges();

            const processManagementButton = fixture.debugElement.query(By.css('[data-automation-id="aps-process-management-button"'));
            expect(processManagementButton.classes['action-button--active']).toBe(true);
        });

        it('Should display Task and Process section', () => {
            spyOn(store, 'select').and.returnValue(of(mockTaskFilter));
            fixture.detectChanges();

            const processManagementSection = fixture.debugElement.queryAll(By.css('.aps-filters-title'));
            const taskSection = processManagementSection[0];
            const processSection = processManagementSection[1];
            expect(taskSection.nativeElement.innerText).toBe('PROCESS-EXTENSION.TASK_LIST.TASKS');
            expect(processSection.nativeElement.innerText).toBe('PROCESS-EXTENSION.BREADCRUMB.PROCESS_LIST.PROCESSES');
        });

        it('Should select the first filter by default when expanded by dispatching a navigateToDefaultTaskFilter action', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const expectedDispatchPayload = {
                type: 'NAVIGATE_TO_DEFAULT_TASK_FILTER',
            };
            spyOn(store, 'select').and.returnValue(of(fakeTaskFilters));
            component.currentFilter = undefined;
            component.toggleProcessManagement(true);

            expect(dispatchSpy).toHaveBeenCalledWith(expectedDispatchPayload);
        });

        it('Should dispatch loadFiltersAction', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const expectedDispatchPayload = {
                type: 'LOAD_FILTERS',
            };
            component.loadFilters();
            fixture.detectChanges();

            expect(dispatchSpy).toHaveBeenCalledWith(expectedDispatchPayload);
        });
    });
});
