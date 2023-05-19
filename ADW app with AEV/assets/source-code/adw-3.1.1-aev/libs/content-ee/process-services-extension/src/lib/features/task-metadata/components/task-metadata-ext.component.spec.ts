/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMetadataExtComponent } from './task-metadata-ext.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { setupTestBed, BpmUserService, BpmUserModel } from '@alfresco/adf-core';
import { ProcessModule } from '@alfresco/adf-process-services';
import { taskDetailsMock } from '../../../mock/task-details.mock';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('TaskMetadataExtComponent', () => {
    let component: TaskMetadataExtComponent;
    let fixture: ComponentFixture<TaskMetadataExtComponent>;
    let userBpmService: BpmUserService;

    const mockUser = new BpmUserModel({
        lastName: 'fake-last-name',
        firstName: 'fake-full-name',
        groups: [],
        id: 1,
    });

    setupTestBed({
        imports: [TranslateModule.forRoot(), ProcessServicesTestingModule, ProcessModule],
        declarations: [TaskMetadataExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskMetadataExtComponent);
        component = fixture.componentInstance;
        component.taskDetails = taskDetailsMock;
        userBpmService = TestBed.inject(BpmUserService);
        spyOn(userBpmService, 'getCurrentUserInfo').and.returnValue(of(mockUser));
    });

    it('should define adf-info-drawer with tab', () => {
        fixture.detectChanges();
        const adfInfoDrawer = fixture.debugElement.nativeElement.querySelector('adf-info-drawer');
        const adfInfoDrawerTab = fixture.debugElement.nativeElement.querySelector('adf-info-drawer-tab');

        expect(adfInfoDrawer).not.toBe(null);
        expect(adfInfoDrawerTab).not.toBe(null);
    });

    it('should adf-task-header contain the tasks details', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskHeader = fixture.debugElement.nativeElement.querySelector('adf-task-header');
        const statusHeaderItem = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-status"]'));
        const descriptionHeaderItem = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-description"]'));
        const idHeaderItem = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-id"]'));
        const assigneeHeaderItem = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));

        expect(adfTaskHeader).not.toBe(null);
        expect(statusHeaderItem.nativeElement.value.trim()).toEqual('Running');
        expect(idHeaderItem.nativeElement.value.trim()).toEqual(taskDetailsMock.id);
        expect(descriptionHeaderItem.nativeElement.value.trim()).toEqual(taskDetailsMock.description);
        expect(assigneeHeaderItem.nativeElement.value.trim()).toEqual(`${taskDetailsMock.assignee.firstName} ${taskDetailsMock.assignee.lastName}`);
    });

    it('should hide release button in the info drawer', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskHeader = fixture.debugElement.nativeElement.querySelector('adf-task-header');
        const unclaimButton = fixture.debugElement.query(By.css('[data-automation-id="header-unclaim-button"]'));

        expect(adfTaskHeader).toBeDefined();
        expect(unclaimButton).toBe(null);
    });
});
