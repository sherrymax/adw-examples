/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDetailsExtComponent } from './process-details-ext.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService, PipeModule, setupTestBed } from '@alfresco/adf-core';
import { ProcessModule, TaskListService } from '@alfresco/adf-process-services';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { fakeRunningProcessInstance } from '../../../mock/process-instances.mock';
import { SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { fakeTaskList } from '../../../mock/task-list.mock';
import { fakeProcessTaskListDatatableSchema } from '../../../mock/process-list.mock';
import { ProcessMetadataExtComponent } from '../components/metadata/process-metadata-ext.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { loadSelectedProcess } from '../../../store/actions/process-details-ext.actions';
import { getSelectedProcess } from '../../../process-services-ext.selector';

describe('ProcessDetailsExtComponent', () => {
    let component: ProcessDetailsExtComponent;
    let fixture: ComponentFixture<ProcessDetailsExtComponent>;
    let store: Store<ProcessServiceExtensionState>;
    let appConfig: AppConfigService;
    let taskListService: TaskListService;
    let mockStore: MockStore<ProcessServiceExtensionState>;

    setupTestBed({
        imports: [ProcessServicesTestingModule, TranslateModule.forRoot(), MatMenuModule, ProcessModule, PipeModule, MatButtonModule, MatTooltipModule],
        declarations: [ProcessDetailsExtComponent, ProcessMetadataExtComponent],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({ appId: '321', processId: '123' }),
                },
            },
            MockStore,
            provideMockStore(),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeProcessTaskListDatatableSchema);

        fixture = TestBed.createComponent(ProcessDetailsExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        taskListService = TestBed.inject(TaskListService);
        mockStore = TestBed.inject(MockStore);
        mockStore.overrideSelector(getSelectedProcess, fakeRunningProcessInstance);

        spyOn(taskListService, 'findAllTasksWithoutState').and.returnValue(of(fakeTaskList));
    });

    it('Should be able to dispatch loadSelectedProcess action', async () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedValue = loadSelectedProcess({ processInstanceId: '123' });
        fixture.detectChanges();
        await fixture.whenStable();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedValue);
    });

    it('Should be able fetch selectedProcess from the store', async () => {
        const selectSpy = spyOn(store, 'select').and.callThrough();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(selectSpy).toHaveBeenCalled();
        expect(component.processInstanceDetails.id).toEqual(fakeRunningProcessInstance.id);
        expect(component.processInstanceDetails.name).toEqual(fakeRunningProcessInstance.name);
    });

    it('should dispatch the reset selected process action when the component gets destroyed', async () => {
        spyOn(store, 'select').and.returnValue(of(fakeRunningProcessInstance));
        const storeDispatchSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            type: 'RESET_SELECTED_PROCESS',
        };

        fixture.detectChanges();
        await fixture.whenStable();
        component.ngOnDestroy();

        expect(storeDispatchSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should processInstanceDetails get updated when the selectedProcess selector emits', async () => {
        expect(component.processInstanceDetails).toBe(undefined);
        spyOn(store, 'select').and.returnValue(of(fakeRunningProcessInstance));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.processInstanceDetails).toBe(fakeRunningProcessInstance);
    });

    it('Should dispatch a SnackbarErrorAction on audit error', async () => {
        const snackbarActionSpy = spyOn(store, 'dispatch');
        component.onAuditError('fakeError');

        const expectedPayload = new SnackbarErrorAction('PROCESS-EXTENSION.ERROR.AUDIT_ERROR', { error: 'fakeError' });
        expect(snackbarActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    describe('Context Action Menu', () => {
        it('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);
            expect(viewContextAction.textContent).toContain('open_in_newPROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        it('Should be able to dispatch navigateToTaskDetails action on view action click', async () => {
            fixture.detectChanges();
            const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
            const expectedPayload = {
                appId: 0,
                selectedTask: fakeTaskList.data[0],
                type: 'NAVIGATE_TO_TASK_DETAILS',
            };

            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();
            await fixture.whenStable();
            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);
            expect(viewContextAction.textContent).toContain('open_in_newPROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();
            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
        });
    });

    it('Should be able to dispatch navigateToTaskDetails action on row single click', () => {
        fixture.detectChanges();
        const rowEvent = new CustomEvent('Keyboard event', {
            detail: {
                keyboardEvent: { key: 'Enter' },
                value: { obj: fakeTaskList.data[0] },
            },
        });
        const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            appId: 0,
            selectedTask: fakeTaskList.data[0],
            type: 'NAVIGATE_TO_TASK_DETAILS',
        };
        component.onRowClick(rowEvent);
        fixture.detectChanges();
        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('should toggle info drawer when clicking the info icon', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        let adfInfoDrawer = fixture.debugElement.nativeElement.querySelector('adf-info-drawer');
        const toggleInfoDrawerIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="aps-toggle-info-drawer-icon"]');

        expect(adfInfoDrawer).toBe(null);

        toggleInfoDrawerIcon.click();
        fixture.detectChanges();
        await fixture.whenStable();
        adfInfoDrawer = fixture.debugElement.nativeElement.querySelector('adf-info-drawer');

        expect(component.showMetadata).toBe(true);
        expect(adfInfoDrawer).not.toBe(null);

        toggleInfoDrawerIcon.click();
        fixture.detectChanges();
        await fixture.whenStable();
        adfInfoDrawer = fixture.debugElement.nativeElement.querySelector('adf-info-drawer');

        expect(component.showMetadata).toBe(false);
        expect(adfInfoDrawer).toBe(null);
    });
});
