/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { setupTestBed, PipeModule, AppConfigService, MaterialModule, AlfrescoApiService, PaginationModule } from '@alfresco/adf-core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import {
    TaskFilterCloudService,
    TaskCloudModule,
    TaskCloudService,
    ProcessDefinitionCloud,
    TaskFiltersCloudModule,
    TASK_FILTERS_SERVICE_TOKEN,
    LocalPreferenceCloudService,
    EditTaskFilterCloudComponent,
    ApplicationInstanceModel,
    PeopleCloudModule,
    TaskFilterAction,
    TaskFilterCloudModel,
    TASK_LIST_CLOUD_TOKEN,
} from '@alfresco/adf-process-services-cloud';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { fakeTaskCloudDatatableSchema, fakeTaskCloudList } from '../../mock/task-list.mock';
import { fakeEditTaskFilter, fakeTaskFilter, fakeTaskFilters } from '../../mock/task-filter.mock';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { TaskListCloudContainerExtComponent } from './task-list-cloud-container-ext.component';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import { TaskListCloudServiceInterface } from '@alfresco/adf-process-services-cloud/lib/services/task-list-cloud.service.interface';
import { selectProcessDefinitionsVariableColumnsSchema } from '../../../../store/selectors/datatable-columns-schema.selector';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('TaskListCloudContainerExtComponent', () => {
    let fixture: ComponentFixture<TaskListCloudContainerExtComponent>;
    let taskFilterCloudService: TaskFilterCloudService;
    let component: TaskListCloudContainerExtComponent;
    let taskCloudListService: TaskListCloudServiceInterface;
    let alfrescoApiService: AlfrescoApiService;
    let taskCloudService: TaskCloudService;
    let getTaskFilterByIdSpy: jasmine.Spy;
    let appConfig: AppConfigService;
    let store: Store<any>;

    const activatedRoute = {
        queryParams: new BehaviorSubject<any>({ filterId: '123' }),
    };

    const fakeApplicationInstance: ApplicationInstanceModel[] = [
        { name: 'application-new-1', createdAt: '2018-09-21T12:31:39.000Z', status: 'Running', theme: 'theme-2', icon: 'favorite_border' },
        { name: 'application-new-2', createdAt: '2018-09-21T12:31:39.000Z', status: 'Pending', theme: 'theme-2', icon: 'favorite_border' },
        { name: 'application-new-3', createdAt: '2018-09-21T12:31:39.000Z', status: 'Pending' },
    ];

    const mock = {
        oauth2Auth: {
            callCustomApi: () => Promise.resolve(fakeApplicationInstance),
        },
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
            TranslateModule,
            PaginationModule,
            TaskCloudModule,
            TaskFiltersCloudModule,
            ProcessServicesCloudTestingModule,
            MaterialModule,
            PeopleCloudModule,
            PageLayoutModule,
            ScrollContainerModule
        ],
        declarations: [TaskListCloudContainerExtComponent, TaskListCloudExtComponent, EditTaskFilterCloudComponent],
        providers: [
            { provide: TASK_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService },
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

                        if (selector === selectProcessDefinitionsVariableColumnsSchema) {
                            return of([]);
                        }

                        return of({
                            extension: {},
                        });
                    },
                    dispatch: () => {},
                },
            },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskListCloudContainerExtComponent);
        component = fixture.componentInstance;
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditTaskFilter);
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        taskFilterCloudService = TestBed.inject(TaskFilterCloudService);
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);
        taskCloudService = TestBed.inject(TaskCloudService);
        store = TestBed.inject(Store);

        activatedRoute.queryParams = new BehaviorSubject<any>({ filterId: 'mock-id' });

        spyOn(alfrescoApiService, 'getInstance').and.returnValue(<any> mock);
        getTaskFilterByIdSpy = spyOn(taskFilterCloudService, 'getTaskFilterById').and.returnValue(of(fakeTaskFilter));
        spyOn(taskCloudListService, 'getTaskByRequest').and.returnValue(of(fakeTaskCloudList));
        spyOn(taskCloudService, 'getProcessDefinitions').and.returnValue(of(processDefinitions));
        fixture.detectChanges();
    });

    it('Should get params from routing', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getTaskFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'mock-id');
    });

    it('should get edit task filters default properties', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.taskFilterProperties.filterProperties.length).toBeGreaterThan(0);
        expect(component.taskFilterProperties.sortProperties.length).toBeGreaterThan(0);
        expect(component.taskFilterProperties.actions.length).toBeGreaterThan(0);
    });

    it('should display taskName filter if it is in the config file', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adf-cloud-edit-task-property-taskName"]');
        expect(taskNameFilter).not.toBeNull();
    });

    it('should display task priority filter if it is in the config file', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adf-cloud-edit-task-property-priority"]');
        expect(taskNameFilter).toBeTruthy();
    });

    it('should display process definition name filter if it is in the config file', async () => {
        fixture.detectChanges();
        expect(getTaskFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'mock-id');
        await fixture.whenStable();
        const taskNameFilter = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-processDefinitionName"]');
        expect(taskNameFilter).toBeTruthy();
    });

    it('should display process definition option when process definition dropdown is selected', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const processDefinitionNameElement = fixture.debugElement.query(By.css('[data-automation-id="adf-cloud-edit-task-property-processDefinitionName"] .mat-select-trigger'));
        processDefinitionNameElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        await fixture.whenStable();
        const options: any = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(options).not.toBeNull();
        expect(options[0].nativeElement.innerText).toContain('ADF_CLOUD_TASK_FILTERS.STATUS.ALL');
        expect(options[1].nativeElement.innerText).toContain(processDefinitions[0].name);
    });

    it('should display dueDate filter if it is in the config file', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adf-cloud-edit-process-property-dueDate"]');
        expect(taskNameFilter).toBeTruthy();
    });

    it('should display completedBy filter if is present in the config', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const completedByElement = fixture.debugElement.query(By.css('#adf-people-cloud-title-id'));
        expect(completedByElement.nativeElement.textContent).toEqual('ADF_CLOUD_EDIT_TASK_FILTER.LABEL.COMPLETED_BY');
    });

    it('should display assignment filter if is present in the config', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const assignmentElement = fixture.debugElement.query(By.css('adf-cloud-task-assignment-filter'));
        expect(assignmentElement).toBeDefined();
        expect(assignmentElement).not.toBeNull();
    });

    it('should display status filter if it is in the config file', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const statusFilter = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adf-cloud-edit-task-property-status"]');
        expect(statusFilter).toBeTruthy();
    });

    it('should update the task list pagination on filter change', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const paginationSpy = spyOn(component.taskListExtCloudComponent, 'fetchCloudPaginationPreference');
        component.onFilterChange(<TaskFilterCloudModel> { id: 'filter-id' });
        fixture.detectChanges();
        expect(paginationSpy).toHaveBeenCalled();
    });

    describe('Router Query params', () => {

        it('Should able to call getTaskFilterById to get filter details on router params change', async () => {
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();
            activatedRoute.queryParams.next({ filterId: 'new-filter-id'});
            fixture.detectChanges();

            expect(getTaskFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'new-filter-id');
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
                        type: FilterType.TASK,
                        filter: fakeTaskFilter
                    }
                })
            );
        });
    });

    describe('Edit filter actions', () => {

        it('Should be able to dispatch navigateToFilter action on filter delete', async () => {
            const getTaskListFiltersSpy = spyOn(taskFilterCloudService, 'getTaskListFilters').and.returnValue(of (fakeTaskFilters));
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();

            component.onTaskFilterAction(<TaskFilterAction> { actionType: 'delete', filter: fakeTaskFilter });
            fixture.detectChanges();

            expect(getTaskListFiltersSpy).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: 'mock-id' }));
        });

        it('Should be able to dispatch navigateToFilter action on filter Save/SaveAs', async () => {
            const getTaskListFiltersSpy = spyOn(taskFilterCloudService, 'getTaskListFilters');
            spyOn(store, 'dispatch');
            fixture.detectChanges();
            await fixture.whenStable();

            component.onTaskFilterAction(<TaskFilterAction> { actionType: 'saveAs', filter: fakeTaskFilter });
            fixture.detectChanges();

            expect(getTaskListFiltersSpy).not.toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: 'mock-id' }));

            component.onTaskFilterAction(<TaskFilterAction> { actionType: 'save', filter: fakeTaskFilter });
            fixture.detectChanges();

            expect(getTaskListFiltersSpy).not.toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(navigateToFilter({ filterId: 'mock-id' }));
        });
    });
});
