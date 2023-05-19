/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of, BehaviorSubject } from 'rxjs';
import { PipeModule, setupTestBed, AppConfigService, MaterialModule, PaginationModule, DataColumnModule } from '@alfresco/adf-core';
import {
    ProcessCloudModule,
    ProcessFiltersCloudModule,
    ProcessFilterCloudService,
    ProcessListCloudService,
    ProcessCloudService,
    ProcessDefinitionCloud,
    PROCESS_FILTERS_SERVICE_TOKEN,
    LocalPreferenceCloudService,
    DateCloudFilterType,
    ProcessFilterAction,
} from '@alfresco/adf-process-services-cloud';
import { ProcessServicesCloudTestingModule } from '../../../../../lib/testing/process-services-cloud-testing.module';
import { ProcessFiltersCloudExtComponent } from '../process-filters/process-filters-cloud-ext.component';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { fakeProcessCloudFilter, fakeProcessFilters } from '../../mock/process-filter.mock';
import { fakeProcessCloudList, fakeProcessCloudFilterProperties, fakeProcessCloudDatatableSchema } from '../../mock/process-list.mock';
import { CommonModule } from '@angular/common';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { ProcessListCloudContainerExtComponent } from './process-list-cloud-container-ext.component';
import { ProcessListCloudExtComponent } from './process-list-cloud-ext.component';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import { selectProcessDefinitionsLoaderIndicator, selectProcessesWithVariableEntities } from '../../../../store/selectors/process-definitions.selector';
import { selectProcessDefinitionsVariableColumnsSchema } from '../../../../store/selectors/datatable-columns-schema.selector';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('ProcessListCloudContainerExtComponent', () => {
    let component: ProcessListCloudContainerExtComponent;
    let fixture: ComponentFixture<ProcessListCloudContainerExtComponent>;
    let processCloudFilterService: ProcessFilterCloudService;
    let processCloudListService: ProcessListCloudService;
    let processServiceCloud: ProcessCloudService;
    let getFilterByIdSpy: jasmine.Spy;
    let appConfig: AppConfigService;
    let store: Store<any>;
    const activatedRoute = {
        queryParams: new BehaviorSubject<any>({ filterId: '123' }),
    };
    const processDefinitions = [
        new ProcessDefinitionCloud({
            appName: 'myApp',
            appVersion: 0,
            id: 'NewProcess:1',
            name: 'process1',
            key: 'process-12345-f992-4ee6-9742-3a04617469fe',
            formKey: 'mockFormKey',
            category: 'fakeCategory',
            description: 'fakeDesc',
        }),
    ];

    setupTestBed({
        imports: [
            PipeModule,
            PaginationModule,
            TranslateModule,
            CommonModule,
            DataColumnModule,
            ProcessCloudModule,
            ProcessFiltersCloudModule,
            ProcessServicesCloudTestingModule,
            MaterialModule,
            PageLayoutModule,
            ScrollContainerModule
        ],
        declarations: [ProcessListCloudContainerExtComponent, ProcessListCloudExtComponent, ProcessFiltersCloudExtComponent],
        providers: [
            { provide: PROCESS_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService },
            {
                provide: ActivatedRoute,
                useValue: activatedRoute,
            },
            {
                provide: Store,
                useValue: {
                    select: (selector) => {
                        if (selector === selectApplicationName) {
                            return of('mock-appName');
                        }

                        if (selector === selectProcessDefinitionsLoaderIndicator) {
                            return of(true);
                        }

                        if (selector === selectProcessesWithVariableEntities) {
                            return of([]);
                        }

                        if (selector === selectProcessDefinitionsVariableColumnsSchema) {
                            return of([]);
                        }

                        return of({});
                    },
                    dispatch: () => {},
                },
            },
        ],
    });

    beforeEach(() => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeProcessCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeProcessCloudFilterProperties);
        processServiceCloud = TestBed.inject(ProcessCloudService);
        processCloudFilterService = TestBed.inject(ProcessFilterCloudService);
        processCloudListService = TestBed.inject(ProcessListCloudService);
        store = TestBed.inject(Store);
        activatedRoute.queryParams = new BehaviorSubject<any>({ filterId: '123' });

        spyOn(processServiceCloud, 'getProcessDefinitions').and.returnValue(of(processDefinitions));
        getFilterByIdSpy = spyOn(processCloudFilterService, 'getFilterById').and.returnValue(of(fakeProcessCloudFilter));
        spyOn(processCloudListService, 'getProcessByRequest').and.returnValue(of(fakeProcessCloudList));

        fixture = TestBed.createComponent(ProcessListCloudContainerExtComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('Should get params from routing', () => {
        fixture.detectChanges();
        expect(processCloudFilterService.getFilterById).toHaveBeenCalledWith('mock-appName', '123');
    });

    it('should load filter dashboard with selected filter', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessFilter = fixture.debugElement.nativeElement.querySelector('adf-cloud-edit-process-filter');
        adfProcessFilter.click();
        fixture.detectChanges();

        const properties = fixture.debugElement.queryAll(By.css('[data-automation-id^="adf-cloud-edit-process-property-"]'));
        expect(properties[2].nativeElement.textContent).toBe('ADF_CLOUD_PROCESS_FILTERS.STATUS.RUNNING');
        expect(properties[4].nativeElement.textContent).toBe('ADF_CLOUD_PROCESS_FILTERS.DIRECTION.DESCENDING');
    });

    it('should filter list when edit filter property is changed', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessFilter = fixture.debugElement.nativeElement.querySelector('adf-cloud-edit-process-filter');
        adfProcessFilter.click();

        fixture.detectChanges();
        await fixture.whenStable();

        const processName = fixture.debugElement.query(By.css('[data-automation-id="adf-cloud-edit-process-property-processName"]'));
        processName.nativeElement.value = 'mockProcess2';
        processName.nativeElement.focus();
        processName.nativeElement.dispatchEvent(new Event('input'));

        activatedRoute.queryParams.next({ filterId: '123456', processName: 'mockProcess2' });

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.currentFilter.processName).toEqual('mockProcess2');
    });

    it('should display process definition name if is present in the config', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const processDefinitionNameElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-processDefinitionName"]');
        expect(processDefinitionNameElement).toBeTruthy();
    });

    it('should display process definition option when process definition dropdown is selected', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const processDefinitionNameElement = fixture.debugElement.query(By.css('[data-automation-id="adf-cloud-edit-process-property-processDefinitionName"] .mat-select-trigger'));
        processDefinitionNameElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        await fixture.whenStable();
        const options: any = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options).not.toBeNull();
        expect(options[0].nativeElement.innerText).toContain('ADF_CLOUD_PROCESS_FILTERS.STATUS.ALL');
        expect(options[1].nativeElement.innerText).toContain(processDefinitions[0].name);
    });

    it('should display initiator filter if is present in the config', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const processDefinitionNameElement = fixture.debugElement.nativeElement.querySelector('adf-cloud-people');
        expect(processDefinitionNameElement).toBeTruthy();
    });

    it('should display initiator filter if is present in the config', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const processDefinitionNameElement = fixture.debugElement.nativeElement.querySelector('adf-cloud-people');
        expect(processDefinitionNameElement).toBeTruthy();
    });

    it('should set filter suspendedDate from route queryParams', async () => {
        activatedRoute.queryParams.next({ filterId: '123456', processName: 'mockProcess2' });

        fixture.detectChanges();
        await fixture.whenStable();

        activatedRoute.queryParams.next({
            filterId: '123456',
            suspendedDateType: DateCloudFilterType.RANGE,
            _suspendedFrom: new Date(2021, 1, 1),
            _suspendedTo: new Date(2021, 1, 2),
        });
        fixture.detectChanges();
        expect(component.currentFilter.suspendedFrom.toString()).toEqual(new Date(2021, 1, 1).toString());
        expect(component.currentFilter.suspendedTo.toString()).toEqual(new Date(2021, 1, 2).toString());
    });

    describe('Router Query params', () => {

        it('Should able to call getFilterById to get filter details on router params change', async () => {
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();
            activatedRoute.queryParams.next({ filterId: 'new-filter-id'});
            fixture.detectChanges();

            expect(getFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'new-filter-id');
        });

        it('Should able to dispatch setProcessManagementFilter action on router params change', async () => {
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();
            activatedRoute.queryParams.next({ filterId: 'new-filter-id'});
            fixture.detectChanges();

            expect(store.dispatch).toHaveBeenCalledWith(
                setProcessManagementFilter({
                    payload: {
                        type: FilterType.PROCESS,
                        filter: fakeProcessCloudFilter
                    }
                })
            );
        });
    });

    describe('Edit Filter Actions', () => {

        it('Should be able to dispatch navigateToFilter action on filter delete', async () => {
            const getProcessFiltersSpy = spyOn(processCloudFilterService, 'getProcessFilters').and.returnValue(of(fakeProcessFilters));
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();

            component.onProcessFilterAction(<ProcessFilterAction> { actionType: 'delete', filter: fakeProcessCloudFilter });
            fixture.detectChanges();

            expect(getProcessFiltersSpy).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: '1' }));
        });

        it('Should be able to dispatch navigateToFilter action on filter Save/SaveAs', async () => {
            const getProcessFiltersSpy = spyOn(processCloudFilterService, 'getProcessFilters');
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();

            component.onProcessFilterAction(<ProcessFilterAction> { actionType: 'saveAs', filter: fakeProcessCloudFilter });
            fixture.detectChanges();

            expect(getProcessFiltersSpy).not.toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: '1' }));

            component.onProcessFilterAction(<ProcessFilterAction> { actionType: 'save', filter: fakeProcessCloudFilter });
            fixture.detectChanges();

            expect(getProcessFiltersSpy).not.toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: '1' }));
        });
    });
});
