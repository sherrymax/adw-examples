/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { setupTestBed, PipeModule, AppConfigService, MaterialModule, PaginationModule, DataColumnModule } from '@alfresco/adf-core';
import {
    completedTasksMockList,
    fakeTaskCloudDatatableSchema,
    fakeTaskCloudList,
    mockTaskListPresetColumns,
    myTasksMockList,
    queuedTasksMockList
} from '../../mock/task-list.mock';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { navigateToTaskDetails } from '../../store/actions/task-list-cloud.actions';
import {
    completedTasksQueryRequestMock,
    fakeEditTaskFilter,
    fakeTaskCloudFilters,
    fakeTaskFilter,
    myTasksQueryRequestMock,
    queuedTasksQueryRequestMock
} from '../../mock/task-filter.mock';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import {
    TaskCloudModule,
    TaskFiltersCloudModule,
    PeopleCloudModule,
    TaskDetailsCloudModel,
    TASK_LIST_CLOUD_TOKEN,
    TaskListCloudComponent
} from '@alfresco/adf-process-services-cloud';
import { TaskListCloudServiceInterface } from '@alfresco/adf-process-services-cloud/lib/services/task-list-cloud.service.interface';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialProcessServicesCloudState } from '../../../../store/states/state';
import { featureKey } from '../../../../store/reducers/reducer';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('TaskListCloudExtComponent', () => {
    let component: TaskListCloudExtComponent;
    let fixture: ComponentFixture<TaskListCloudExtComponent>;
    let taskCloudListService: TaskListCloudServiceInterface;
    let store: MockStore<any>;

    const processDefinitionCloudState = initialProcessServicesCloudState;
    processDefinitionCloudState.processDefinitions.loaded = true;
    const initialState = {
        [featureKey]: processDefinitionCloudState
    };

    let appConfig: AppConfigService;
    let getTaskByRequestSpy: jasmine.Spy;

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
        providers: [
            provideMockStore({initialState})
        ],
        declarations: [TaskListCloudExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskListCloudExtComponent);
        component = fixture.componentInstance;
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditTaskFilter);
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);

        store = TestBed.inject(MockStore);
        getTaskByRequestSpy = spyOn(taskCloudListService, 'getTaskByRequest').and.returnValue(of(fakeTaskCloudList));
        component.currentFilter = fakeTaskFilter;
        fixture.detectChanges();
    });

    it('Should load task list', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-cloud-task-list');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');
        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();
        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_nameFake1"]`));

        expect(value1).not.toBeNull();
        expect(value1.nativeElement.innerText.trim()).toBe('nameFake1');
    });

    it('should display the default columns', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const adfTaskList = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-cell-header .adf-datatable-cell-value');
        expect(adfTaskList).toBeDefined();
        expect(adfTaskList.length).toEqual(7);
        expect(adfTaskList[0].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.NAME');
        expect(adfTaskList[1].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS');
        expect(adfTaskList[2].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE');
        expect(adfTaskList[3].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE');
        expect(adfTaskList[4].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED');
        expect(adfTaskList[5].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE');
        expect(adfTaskList[6].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY');
    });

    it('should enable column selector feature', async () => {
        await fixture.whenStable();

        const taskListCloudComponent = fixture.debugElement.query(By.css('adf-cloud-task-list'));
        const taskListCloudComponentInstance = taskListCloudComponent.componentInstance as TaskListCloudComponent;
        expect(taskListCloudComponentInstance.showMainDatatableActions).toBe(true);
    });

    it('Should be able to dispatch navigateToTaskDetails action on row single click', () => {
        fixture.detectChanges();
        const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
        component.navigateToTaskDetails('999');
        fixture.detectChanges();
        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '999' }));
    });

    describe('Context Action Menu', () => {
        it('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);
            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        it('Should be able to dispatch navigateToTaskDetails action on view action click', async () => {
            fixture.detectChanges();
            const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');

            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);
            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();
            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(
                navigateToTaskDetails({
                    taskId: 'mockId',
                })
            );
        });
    });

    describe('Display Tasks based the filter params', () => {

        const myTasksFilter = fakeTaskCloudFilters[0];
        const queuedTasksFilter = fakeTaskCloudFilters[1];
        const completedTasksFilter = fakeTaskCloudFilters[2];

        function getTasksRowsByStatus(status: string) {
            return fixture.debugElement.queryAll(By.css(`[data-automation-id="text_${status}"]`));
        }

        it('Should be able to fetch only assigned tasks when currentFilter set to my tasks filter', async () => {
            getTaskByRequestSpy.calls.reset();
            getTaskByRequestSpy.and.returnValue(of(myTasksMockList));
            component.currentFilter = myTasksFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const myTasks = getTasksRowsByStatus('ASSIGNED');

            expect(getTaskByRequestSpy).toHaveBeenCalledWith(myTasksQueryRequestMock);
            expect(myTasks.length).toBe(2);
            expect(myTasks[0].nativeElement.innerText.trim()).toBe('ASSIGNED');
            expect(myTasks[1].nativeElement.innerText.trim()).toBe('ASSIGNED');
        });

        it('Should be able to fetch only queued tasks when currentFilter set to queued tasks filter', async () => {
            getTaskByRequestSpy.calls.reset();
            getTaskByRequestSpy.and.returnValue(of(queuedTasksMockList));
            component.currentFilter = queuedTasksFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const queuedTasks = getTasksRowsByStatus('CREATED');

            expect(getTaskByRequestSpy).toHaveBeenCalledWith(queuedTasksQueryRequestMock);
            expect(queuedTasks.length).toBe(2);
            expect(queuedTasks[0].nativeElement.innerText.trim()).toBe('CREATED');
            expect(queuedTasks[1].nativeElement.innerText.trim()).toBe('CREATED');
        });

        it('Should be able to fetch completed tasks when currentFilter set to completed tasks filter', async () => {
            getTaskByRequestSpy.calls.reset();
            getTaskByRequestSpy.and.returnValue(of(completedTasksMockList));
            component.currentFilter = completedTasksFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const completedTasks = getTasksRowsByStatus('COMPLETED');

            expect(completedTasks.length).toBe(2);
            expect(getTaskByRequestSpy).toHaveBeenCalledWith(completedTasksQueryRequestMock);
            expect(completedTasks[0].nativeElement.innerText.trim()).toBe('COMPLETED');
            expect(completedTasks[1].nativeElement.innerText.trim()).toBe('COMPLETED');
        });
    });
});

@Component({
    selector: 'apa-custom-task-name-column',
    template: `
        <span data-automation-id="task-name-custom-column">{{ displayValue.name }}</span><br>
        <div>
            <span>Assignee By : </span>
            <span data-automation-id="task-assignee-custom-column">{{ displayValue.assignee }}</span>
        </div>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskNameComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    constructor() {}

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}
@Component({
    selector: 'apa-custom-task-status-column',
    template: `
        <i data-automation-id="task-status-icon-custom-column" class="far fa-check-circle"></i>
        <span data-automation-id="task-status-custom-column">{{ displayValue.status }}</span>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskStatusComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    constructor() {}

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

describe('TaskListCloudExtComponent with Custom Columns', () => {
    let component: TaskListCloudExtComponent;
    let fixture: ComponentFixture<TaskListCloudExtComponent>;
    let taskCloudListService: TaskListCloudServiceInterface;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;

    const processDefinitionCloudState = initialProcessServicesCloudState;
    processDefinitionCloudState.processDefinitions.loaded = true;
    const initialState = {
        [featureKey]: processDefinitionCloudState
    };

    setupTestBed({
        imports: [
            PipeModule,
            TranslateModule,
            PaginationModule,
            TaskCloudModule,
            DataColumnModule,
            ExtensionsModule,
            TaskFiltersCloudModule,
            ProcessServicesCloudTestingModule,
            MaterialModule,
            PeopleCloudModule,
            PageLayoutModule,
            ScrollContainerModule,
        ],
        providers: [
            provideMockStore({initialState})
        ],
        declarations: [TaskListCloudExtComponent, MockCustomTaskStatusComponent, MockCustomTaskNameComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskListCloudExtComponent);
        component = fixture.componentInstance;
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);

        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getTasksColumns').and.returnValue(of(mockTaskListPresetColumns));
        spyOn(taskCloudListService, 'getTaskByRequest').and.returnValue(of(fakeTaskCloudList));

        TestBed.inject(ExtensionService).setComponents({
            'app.taskList.columns.name': MockCustomTaskNameComponent,
            'app.taskList.columns.status': MockCustomTaskStatusComponent,
        });

        component.currentFilter = fakeTaskFilter;
        fixture.detectChanges();
    });

    it('Should fetch task list and display custom columns preset from extension', async () => {
        fixture.detectChanges();

        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskList = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-cell-header .adf-datatable-cell-value');
        expect(adfTaskList).toBeDefined();
        expect(adfTaskList.length).toEqual(7);
        expect(adfTaskList[0].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.NAME');
        expect(adfTaskList[1].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS');
        expect(adfTaskList[2].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE');
        expect(adfTaskList[3].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE');
        expect(adfTaskList[4].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED');
        expect(adfTaskList[5].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE');
        expect(adfTaskList[6].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY');
    });

    it('Should task list display custom template extension columns', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const customTaskNameTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-name-column'));
        const customTaskNameColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-name-custom-column"]`));
        const customTaskAssigneeElement = fixture.debugElement.query(By.css(`[data-automation-id="task-assignee-custom-column"]`));

        expect(customTaskNameTemplateSelector).not.toBeNull();
        expect(customTaskNameColumn).not.toBeNull();
        expect(customTaskAssigneeElement).not.toBeNull();

        expect(customTaskNameColumn.nativeElement.innerText.trim()).toBe('nameFake1');
        expect(customTaskAssigneeElement.nativeElement.innerText.trim()).toBe('mock-assignee');

        const customTaskStatusTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-status-column'));
        const customTaskStatusColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-status-custom-column"]`));
        const customTaskStatusIconElement = fixture.debugElement.query(By.css(`[data-automation-id="task-status-icon-custom-column"]`));

        expect(customTaskStatusTemplateSelector).not.toBeNull();
        expect(customTaskStatusColumn).not.toBeNull();
        expect(customTaskStatusIconElement).not.toBeNull();

        expect(customTaskStatusColumn.nativeElement.innerText.trim()).toBe('ASSIGNED');
    });
});
