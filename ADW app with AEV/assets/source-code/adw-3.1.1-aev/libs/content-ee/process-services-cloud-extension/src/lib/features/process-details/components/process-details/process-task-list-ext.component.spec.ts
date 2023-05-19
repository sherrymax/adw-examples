/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { setupTestBed, PipeModule, AppConfigService, MaterialModule, PaginationModule, DataColumnModule } from '@alfresco/adf-core';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ProcessTaskListExtComponent } from './process-task-list-ext.component';
import { fakeEditTaskFilter } from '../../../task-list/mock/task-filter.mock';
import { fakeTaskCloudDatatableSchema, fakeTaskCloudList, processDetailsCloudMock } from '../../mock/process-details.mock';
import { mockTaskListPresetColumns } from '../../../task-list/mock/task-list.mock';
import {
    TaskCloudModule,
    PeopleCloudModule,
    TaskDetailsCloudModel,
    TASK_LIST_CLOUD_TOKEN,
    TaskListCloudComponent
} from '@alfresco/adf-process-services-cloud';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialProcessServicesCloudState } from '../../../../store/states/state';
import { featureKey } from '../../../../store/reducers/reducer';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('ProcessTaskListExtComponent', () => {
    let component: ProcessTaskListExtComponent;
    let fixture: ComponentFixture<ProcessTaskListExtComponent>;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;
    let store: MockStore<any>;
    let appConfig: AppConfigService;

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
            ProcessServicesCloudTestingModule,
            MaterialModule,
            PageLayoutModule,
            ScrollContainerModule
        ],
        providers: [provideMockStore({ initialState })],
        declarations: [ProcessTaskListExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeAll(async() => {

        const mockService = jasmine.createSpyObj<any>(
            'ProcessTaskListCloudService',
            ['getTaskByRequest']
        );
        mockService.getTaskByRequest.and.returnValue(of(fakeTaskCloudList));

        await TestBed
            // Override component's own provider
            .overrideComponent(ProcessTaskListExtComponent, {
                set: {
                    providers: [
                        {
                            provide: TASK_LIST_CLOUD_TOKEN,
                            useValue: mockService,
                        },
                    ],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessTaskListExtComponent);
        component = fixture.componentInstance;

        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditTaskFilter);
        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getTaskListPreset').and.returnValue(<any> mockTaskListPresetColumns);

        store = TestBed.inject(MockStore);
        component.processInstance = processDetailsCloudMock;
        component.columns$ = of(mockTaskListPresetColumns);
        fixture.detectChanges();
    });

    it('should navigate to task details page on click of task list row', async () => {
        const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
        fixture.detectChanges();
        await fixture.whenStable();

        component.navigateToTaskDetails('mockId');

        fixture.detectChanges();

        const expectedPayload = {
            taskId: 'mockId',
            processName: 'new name',
            type: '[Process Service Cloud Extension] navigate to task details',
        };
        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should load task list', async () => {
        await fixture.whenStable();
        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-cloud-task-list');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');

        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();

        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_mockTask"]`));

        expect(value1).not.toBeNull();
        expect(value1.nativeElement.innerText.trim()).toBe('mockTask');
    });

    it('should enable column selector feature', async () => {
        await fixture.whenStable();

        const taskListCloudComponent = fixture.debugElement.query(By.css('adf-cloud-task-list'));
        const taskListCloudComponentInstance = taskListCloudComponent.componentInstance as TaskListCloudComponent;
        expect(taskListCloudComponentInstance.showMainDatatableActions).toBe(true);
    });

    describe('Context Action Menu', () => {
        it('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_mockTask"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        it('Should be able to dispatch navigateToTaskDetails action on view action click', async () => {
            fixture.detectChanges();
            const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
            const expectedPayload = {
                taskId: 'mockId',
                processName: 'new name',
                type: '[Process Service Cloud Extension] navigate to task details',
            };

            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_mockTask"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');

            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
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

    constructor() { }

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

    constructor() { }

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

describe('ProcessTaskListExtComponent with Custom Columns', () => {
    let component: ProcessTaskListExtComponent;
    let fixture: ComponentFixture<ProcessTaskListExtComponent>;
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
            ProcessServicesCloudTestingModule,
            MaterialModule,
            PeopleCloudModule,
            PageLayoutModule,
            ScrollContainerModule,
        ],
        providers: [
            provideMockStore({ initialState })
        ],
        declarations: [ProcessTaskListExtComponent, MockCustomTaskStatusComponent, MockCustomTaskNameComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    const mockService = jasmine.createSpyObj<any>(
        'ProcessTaskListCloudService',
        ['getTaskByRequest']
    );

    mockService.getTaskByRequest.and.returnValue(of(fakeTaskCloudList));

    beforeAll(async() => {
        await TestBed
            // Override component's own provider
            .overrideComponent(ProcessTaskListExtComponent, {
                set: {
                    providers: [
                        {
                            provide: TASK_LIST_CLOUD_TOKEN,
                            useValue: mockService,
                        },
                    ],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessTaskListExtComponent);
        component = fixture.componentInstance;

        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getTaskListPreset').and.returnValue(<any> mockTaskListPresetColumns);

        TestBed.inject(ExtensionService).setComponents({
            'app.taskList.columns.name': MockCustomTaskNameComponent,
            'app.taskList.columns.status': MockCustomTaskStatusComponent,
        });

        component.processInstance = processDetailsCloudMock;
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

        expect(customTaskNameColumn.nativeElement.innerText.trim()).toBe('mockTask');
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
