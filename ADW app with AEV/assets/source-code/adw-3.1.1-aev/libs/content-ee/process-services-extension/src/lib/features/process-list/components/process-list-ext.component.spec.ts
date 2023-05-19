/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessListExtComponent } from './process-list-ext.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipeModule, TranslationMock, TranslationService, AppConfigService, setupTestBed } from '@alfresco/adf-core';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { ProcessModule, ProcessService, ProcessInstanceListComponent } from '@alfresco/adf-process-services';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeProcessListDatatableSchema } from '../../../mock/process-list.mock';
import { By } from '@angular/platform-browser';
import { fakeProcessInstances } from '../../../mock/process-instances.mock';
import { fakeEditProcessFilter, mockProcessFilter } from '../../../mock/process-filters.mock';
import { ProcessListExtService } from '../services/process-list-ext.service';

describe('ProcessListExtComponent', () => {
    let component: ProcessListExtComponent;
    let fixture: ComponentFixture<ProcessListExtComponent>;
    let processService: ProcessService;
    let processListExtService: ProcessListExtService;
    let appConfig: AppConfigService;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, PipeModule, TranslateModule],
        declarations: [ProcessInstanceListComponent, ProcessListExtComponent],
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
        fixture = TestBed.createComponent(ProcessListExtComponent);
        component = fixture.componentInstance;

        processService = TestBed.inject(ProcessService);
        processListExtService = TestBed.inject(ProcessListExtService);
        appConfig = TestBed.inject(AppConfigService);

        appConfig.config = Object.assign(appConfig.config, fakeProcessListDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditProcessFilter);

        spyOn(processService, 'getProcesses').and.returnValue(of(<any> fakeProcessInstances));
        spyOn(processListExtService, 'getProcessFilterById').and.returnValue(of(mockProcessFilter));
    });

    it('Should get params from routing', () => {
        const expectedAppId = 321;
        const expectedFilterId = 123;
        fixture.detectChanges();

        expect(component.filterId).toBe(expectedFilterId);
        expect(component.appId).toBe(expectedAppId);
    });

    it('Should load process list', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessList = fixture.debugElement.nativeElement.querySelector('#aps-process-list-id');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');

        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();

        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_Process 382927392"`));
        const value2 = fixture.debugElement.query(By.css(`[data-automation-id="text_Process 773443333"]`));

        expect(value1).not.toBeNull();
        expect(value2).not.toBeNull();
        expect(value1.nativeElement.innerText.trim()).toBe('Process 382927392');
        expect(value2.nativeElement.innerText.trim()).toBe('Process 773443333');
    });

    it('Should call select filter and toggle process management actions when loading process list by URL', async () => {
        const selectFilterSpy = spyOn(processListExtService, 'selectFilter').and.callThrough();
        const expandProcessManagementSectionSpy = spyOn(processListExtService, 'expandProcessManagementSection').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(selectFilterSpy).toHaveBeenCalledWith(mockProcessFilter);
        expect(expandProcessManagementSectionSpy).toHaveBeenCalled();
    });

    it('Should call navigateToProcessDetails on row single click', async () => {
        const navigateToProcessDetailsSpy = spyOn(processListExtService, 'navigateToProcessDetails');
        const expectedResult = fakeProcessInstances.data[0];
        const expectedAppId = 321;
        fixture.detectChanges();
        const processInstanceRow = fixture.debugElement.nativeElement.querySelector('[data-automation-id="Process 773443333"]');

        processInstanceRow.dispatchEvent(new Event('click'));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(navigateToProcessDetailsSpy).toHaveBeenCalledWith(expectedAppId, expectedResult);
    });

    describe('Context Action Menu', () => {
        it('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="Process 773443333"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            fixture.detectChanges();
            await fixture.whenStable();

            const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS"]`);

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS-EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS');
        });

        it('Should call navigateToProcessDetails on context action clicked', async () => {
            const navigateToProcessDetailsSpy = spyOn(processListExtService, 'navigateToProcessDetails');
            const expectedResult = fakeProcessInstances.data[0];
            const expectedAppId = 321;
            fixture.detectChanges();
            const processInstance = fixture.debugElement.nativeElement.querySelector('[data-automation-id="Process 773443333"]');
            processInstance.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            fixture.detectChanges();
            await fixture.whenStable();

            const contextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS-EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS"]`);
            contextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(navigateToProcessDetailsSpy).toHaveBeenCalledWith(expectedAppId, expectedResult);
        });
    });
});
