/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListExtComponent } from './task-list-ext.component';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { setupTestBed, PipeModule, TranslationService, TranslationMock, AppConfigService } from '@alfresco/adf-core';
import { ProcessModule, TaskListService, TaskListComponent } from '@alfresco/adf-process-services';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { fakeTaskList, fakeTaskListDatatableSchema } from '../../../mock/task-list.mock';
import { TaskListExtService } from '../services/task-list-ext.service';
import { mockTaskFilter } from '../../../mock/task-filters.mock';

describe('TaskListExtComponent', () => {
    let component: TaskListExtComponent;
    let fixture: ComponentFixture<TaskListExtComponent>;
    let taskListService: TaskListService;
    let taskListExtService: TaskListExtService;
    let appConfig: AppConfigService;
    let navigateToTaskDetailsSpy: jasmine.Spy;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, PipeModule, TranslateModule],
        declarations: [TaskListExtComponent, TaskListComponent],
        providers: [
            { provide: TranslationService, useClass: TranslationMock },
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({ appId: '321', filterId: '123' }),
                },
            },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskListExtComponent);
        component = fixture.componentInstance;

        taskListService = TestBed.inject(TaskListService);
        taskListExtService = TestBed.inject(TaskListExtService);

        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskListDatatableSchema);

        spyOn(taskListService, 'findTasksByState').and.returnValue(of(fakeTaskList));
        spyOn(taskListExtService, 'getTaskFilterById').and.returnValue(of(mockTaskFilter));
        navigateToTaskDetailsSpy = spyOn(taskListExtService, 'navigateToTaskDetails');
    });

    it('Should get params from routing', () => {
        const expectedAppId = 321;
        const expectedFilterId = 123;
        fixture.detectChanges();

        expect(component.filterId).toBe(expectedFilterId);
        expect(component.appId).toBe(expectedAppId);
    });

    it('Should load task list', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-tasklist');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');

        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();

        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_nameFake1"`));
        const value2 = fixture.debugElement.query(By.css(`[data-automation-id="text_nameFake2"]`));

        expect(value1).not.toBeNull();
        expect(value2).not.toBeNull();
        expect(value1.nativeElement.innerText.trim()).toBe('nameFake1');
        expect(value2.nativeElement.innerText.trim()).toBe('nameFake2');
    });

    it('Should be able to call navigateToTaskDetails on row single click', async () => {
        fixture.detectChanges();
        const expectedAppId = 321;
        const expectedValue = fakeTaskList.data[0];
        const taskRow = fixture.nativeElement.querySelector('[data-automation-id="nameFake1"]');
        taskRow.dispatchEvent(new Event('click'));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedAppId, expectedValue);
    });

    it('Should call select filter and toggle process management actions when loading task list by URL', async () => {
        const selectFilterSpy = spyOn(taskListExtService, 'selectFilter').and.callThrough();
        const expandProcessManagementSectionSpy = spyOn(taskListExtService, 'expandProcessManagementSection').and.callThrough();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(selectFilterSpy).toHaveBeenCalledWith(mockTaskFilter);
        expect(expandProcessManagementSectionSpy).toHaveBeenCalled();
    });

    describe('Context Action Menu', () => {
        it('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            fixture.detectChanges();
            await fixture.whenStable();

            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        it('Should be able to call navigateToTaskDetails on context View action click', async () => {
            fixture.detectChanges();
            const expectedAppId = 321;
            const expectedValue = fakeTaskList.data[0];
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            fixture.detectChanges();
            await fixture.whenStable();

            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`);
            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedAppId, expectedValue);
        });
    });
});
