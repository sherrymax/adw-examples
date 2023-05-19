/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { setupTestBed, PipeModule, FormOutcomeEvent, FormOutcomeModel, FormModel } from '@alfresco/adf-core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { TaskFilterCloudService, ProcessCloudModule, TaskFiltersCloudModule, TaskCloudModule, TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { TaskDetailsCloudExtComponent } from './task-details-cloud-ext.component';
import {
    fakeTaskDetails,
    suspendedTaskDetailsCloudMock,
    cancelledTaskDetailsCloudMock,
    completedTaskDetailsCloudMock,
    createdTaskDetailsCloudMock,
    assignedTaskDetailsCloudMock,
} from '../../mock/task-details.mock';
import { navigateToFilter, navigateToTasks } from '../../../../store/actions/process-management-filter.actions';
import { TaskDetailsCloudMetadataComponent } from '../task-details-cloud-metadata/task-details-cloud-metadata.component';
import { By } from '@angular/platform-browser';
import { openTaskAssignmentDialog } from '../../../../store/actions/task-details.actions';
import { SetFileUploadingDialogAction, PluginPreviewAction, SnackbarErrorAction, SnackbarInfoAction } from '@alfresco/aca-shared/store';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrintDirective } from '../../../../directives/print/print.directive';

describe('TaskDetailsCloudExtComponent', () => {
    let component: TaskDetailsCloudExtComponent;
    let fixture: ComponentFixture<TaskDetailsCloudExtComponent>;
    let store: Store<any>;
    let taskCloudService: TaskCloudService;
    let location: Location;
    let getTaskByIdSpy: jasmine.Spy;
    let getCandidateUsersSpy: jasmine.Spy;
    let getCandidateGroupsSpy: jasmine.Spy;
    const mockRouterParams = new Subject();

    setupTestBed({
        imports: [PipeModule, TranslateModule, TaskCloudModule, MatTooltipModule, ProcessCloudModule, TaskFiltersCloudModule, ProcessServicesCloudTestingModule, PageLayoutModule],
        declarations: [
            TaskDetailsCloudExtComponent,
            TaskDetailsCloudMetadataComponent,
            PrintDirective
        ],
        providers: [
            {
                provide: TaskFilterCloudService,
                useValue: {
                    getTaskFilterById: () => of([]),
                    getTaskListFilters: () =>
                        of([
                            {
                                key: TaskDetailsCloudExtComponent.COMPLETED_TASK,
                                id: 'completed-task-filter-id',
                            },
                        ]),
                },
            },
            {
                provide: ActivatedRoute,
                useValue: {
                    params: mockRouterParams,
                },
            },
            {
                provide: Store,
                useValue: {
                    select: (selector) => {
                        if (selector === selectApplicationName) {
                            return of('mock-appName');
                        }
                        if (selector === selectProcessManagementFilter) {
                            return of({
                                id: 'mockId',
                                name: 'mockFilter',
                            });
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
        fixture = TestBed.createComponent(TaskDetailsCloudExtComponent);
        component = fixture.componentInstance;
        taskCloudService = TestBed.inject(TaskCloudService);
        store = TestBed.inject(Store);
        location = TestBed.inject(Location);

        getTaskByIdSpy = spyOn(taskCloudService, 'getTaskById').and.returnValue(of(fakeTaskDetails));
        getCandidateUsersSpy = spyOn(taskCloudService, 'getCandidateUsers').and.returnValue(of([]));
        getCandidateGroupsSpy = spyOn(taskCloudService, 'getCandidateGroups').and.returnValue(of([]));

        fixture.detectChanges();
        mockRouterParams.next({ taskId: '123' });
    });

    it('should get the task by id', () => {
        fixture.detectChanges();

        expect(taskCloudService.getTaskById).toHaveBeenCalledWith('mock-appName', '123');
    });

    it('should load task empty form', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfCloudForm = fixture.debugElement.nativeElement.querySelector('adf-cloud-form');
        const adfCloudFormTitle = fixture.debugElement.nativeElement.querySelector('adf-empty-content__title');

        expect(adfCloudForm).toBeDefined();
        expect(adfCloudFormTitle).toBeDefined();
    });

    it('should display task filter breadcrumb when navigating from task list', () => {
        fixture.detectChanges();

        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(4);
        expect(breadcrumb[2].textContent).toBe('mockFilter');
        expect(breadcrumb[3].textContent).toBe('task1');
    });

    it('should display process name breadcrumb when navigating from process details', () => {
        mockRouterParams.next({ taskId: '123', processName: 'mock-process-name' });
        fixture.detectChanges();

        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(5);
        expect(breadcrumb[3].textContent).toBe('mock-process-name');
    });

    it('should display task details sidebar', async () => {
        component.showMetadata = true;

        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector('apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header');

        expect(adfTaskDetailsCardView).not.toBeNull();
    });

    it('should display task details info icon', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');

        expect(adfTaskDetailsInfoIcon).toBeDefined();
    });

    it('should show/hide task details sidebar when clicking info icon', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        let adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector('apa-task-details-cloud-metadata adf-info-drawer adf-card-view');

        expect(component.showMetadata).toEqual(false);
        expect(adfTaskDetailsCardView).toBeNull();

        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');
        adfTaskDetailsInfoIcon.click();

        fixture.detectChanges();
        await fixture.whenStable();

        adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector('apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header');

        expect(adfTaskDetailsCardView).not.toBeNull();
        expect(component.showMetadata).toEqual(true);
    });

    it('should redirect back when clicking cancel task button', async () => {
        spyOn(location, 'back');

        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskDetailsCancelButton = fixture.debugElement.nativeElement.querySelector('#adf-cloud-cancel-task');
        adfTaskDetailsCancelButton.click();

        fixture.detectChanges();

        expect(location.back).toHaveBeenCalled();
    });

    it('should redirect back when clicking close button', async () => {
        spyOn(location, 'back');

        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskDetailsCancelButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-close-drawer-icon"]');
        adfTaskDetailsCancelButton.click();

        fixture.detectChanges();

        expect(location.back).toHaveBeenCalled();
    });

    it('should navigate to the specific filter when clicking the breadcrumb', async () => {
        spyOn(store, 'dispatch');

        fixture.detectChanges();
        await fixture.whenStable();

        const taskFilterBreadcrumb = fixture.debugElement.nativeElement.querySelector('.apa-task-filter-item');
        taskFilterBreadcrumb.dispatchEvent(new MouseEvent('click'));

        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(
            navigateToFilter({
                filterId: 'mockId',
            })
        );
    });

    it('should navigate to completed task with the specific filter when filter is not defined', () => {
        spyOn(store, 'dispatch').and.callThrough();
        component.currentFilter = null;

        fixture.detectChanges();
        component.onCompleteTaskForm();
        fixture.detectChanges();

        const dispatchedAction = store.dispatch['calls'].argsFor(1);

        expect(dispatchedAction[0]).toEqual(
            navigateToTasks({
                filterId: 'completed-task-filter-id',
            })
        );
    });

    describe('Change assignee', () => {
        const openTaskAssignmentAction = (taskId: string, appName: string, assignee: string) => openTaskAssignmentDialog({
            taskId: taskId,
            appName: appName,
            assignee: assignee,
        });

        it('should not open task assignment dialog on click of assignee prop if task is in SUSPENDED state', async () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(suspendedTaskDetailsCloudMock));

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CANCELLED state', async () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(cancelledTaskDetailsCloudMock));

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in COMPLETED state', async () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(completedTaskDetailsCloudMock));

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CREATED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(createdTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should open task assignment dialog if task is in ASSIGNED state', async () => {
            component.showMetadata = true;
            getTaskByIdSpy.and.returnValue(of(assignedTaskDetailsCloudMock));

            getCandidateUsersSpy.and.returnValue(of(['user-1', 'user-2']));
            getCandidateGroupsSpy.and.returnValue(of(['mock-group-1', 'mock-group-2']));
            spyOn(store, 'dispatch');

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-toggle-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).toHaveBeenCalledWith(
                openTaskAssignmentAction(assignedTaskDetailsCloudMock.id, assignedTaskDetailsCloudMock.appName, assignedTaskDetailsCloudMock.assignee)
            );
        });

        it('should dispatch an action to disable main file uploading dialog visibility when the component gets initialized', () => {
            const expectedAction = new SetFileUploadingDialogAction(false);
            const actionDispatchSpy = spyOn(store, 'dispatch');
            component.ngOnInit();

            expect(actionDispatchSpy).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch an action to enable main file uploading dialog visibility when the component gets destroyed', () => {
            const expectedAction = new SetFileUploadingDialogAction(true);
            const actionDispatchSpy = spyOn(store, 'dispatch');
            component.ngOnDestroy();

            expect(actionDispatchSpy).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch PluginPreviewAction on click of file content', () => {
            const taskId = '123';
            const mockNodeId = 'mock-node-id';
            const dispatchSpy = spyOn(store, 'dispatch');
            const expectedResult = new PluginPreviewAction(`task-details-cloud/${taskId}`, mockNodeId);
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(dispatchSpy).toHaveBeenCalledWith(expectedResult);
        });

        it('should include processName in the pluginPreviewAction url if the processName defined', () => {
            const taskId = '123';
            const processName = 'mock-process-name';
            const mockNodeId = 'mock-node-id';
            const dispatchSpy = spyOn(store, 'dispatch');
            component.processName = processName;
            const expectedResult = new PluginPreviewAction(`task-details-cloud/${taskId}/${processName}`, mockNodeId);
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(dispatchSpy).toHaveBeenCalledWith(expectedResult);
        });
    });

    describe('error handling', () => {
        const message = 'Failed to complete the task';

        it('should show error message on api fail', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const error = new Error(message);
            component.onError(error);
            expect(dispatchSpy).toHaveBeenCalledWith(new SnackbarErrorAction(message));
        });

        it('should show error message on api fail', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const error = new Error(JSON.stringify({ message }));
            component.onError(error);
            expect(dispatchSpy).toHaveBeenCalledWith(new SnackbarErrorAction(message));
        });

        it('should show error message on api fail', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const error = new Error(JSON.stringify({ entry: { message } }));
            component.onError(error);
            expect(dispatchSpy).toHaveBeenCalledWith(new SnackbarErrorAction(message));
        });

        it('should show all the error messages as comma separated when there are list of errors', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const error = new Error(JSON.stringify({ errors: [
                { message: 'Textfield-1 is a required field and has to have some value' },
                { message: 'Dropdown-123 is a required field and has to have some value' }
            ] }));
            component.onError(error);
            expect(dispatchSpy).toHaveBeenCalledWith(
                new SnackbarErrorAction('Textfield-1 is a required field and has to have some value, Dropdown-123 is a required field and has to have some value')
            );
        });
    });

    describe('onExecuteOutcome', () => {
        it('should dispatch snackbar notification when custom outcome button is clicked', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, { id: 'custom1', name: outcomeName });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(dispatchSpy).toHaveBeenCalledWith(
                new SnackbarInfoAction('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION',
                { outcome: 'Custom Action' })
            );
        });

        it('should NOT dispatch snackbar notification when a system button is clicked', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, { id: 'custom1', name: outcomeName, isSystem: true });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });
});
