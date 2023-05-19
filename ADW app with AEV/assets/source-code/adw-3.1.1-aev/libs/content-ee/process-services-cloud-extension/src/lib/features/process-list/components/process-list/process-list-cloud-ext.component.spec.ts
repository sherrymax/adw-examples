/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PipeModule, setupTestBed, PaginationModule, CoreModule, DataColumnModule, AppConfigService } from '@alfresco/adf-core';
import {
    ProcessCloudModule,
    ProcessInstanceCloud,
    ProcessListCloudComponent,
    ProcessListCloudService
} from '@alfresco/adf-process-services-cloud';
import { ProcessServicesCloudTestingModule } from '../../../../../lib/testing/process-services-cloud-testing.module';
import { ProcessListCloudExtComponent } from './process-list-cloud-ext.component';
import {
    fakeProcessCloudDatatableSchema,
    fakeProcessCloudList,
    processListCustomColumnsPresets,
    fakeCompletedProcessesMockList,
    allProcessesMockList,
    fakeDefaultPresetColumns
} from '../../mock/process-list.mock';
import { CommonModule } from '@angular/common';
import {
    fakeProcessCloudFilter,
    fakeProcessCloudFilters,
    allProcessesQueryRequestMock,
    runningProcessesQueryRequestMock,
    completedProcessesQueryRequestMock
} from '../../mock/process-filter.mock';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionService, ExtensionsModule } from '@alfresco/adf-extensions';
import { Component, Input, OnInit } from '@angular/core';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('ProcessListCloudExtComponent', () => {
    let component: ProcessListCloudExtComponent;
    let fixture: ComponentFixture<ProcessListCloudExtComponent>;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;
    let processCloudListService: ProcessListCloudService;
    let appConfig: AppConfigService;
    let getProcessByRequestSpy: jasmine.Spy;

    setupTestBed({
        imports: [
            PipeModule,
            PaginationModule,
            TranslateModule,
            CoreModule,
            CommonModule,
            ProcessCloudModule,
            ProcessServicesCloudTestingModule,
            ScrollContainerModule
        ],
        declarations: [ProcessListCloudExtComponent]
    });

    beforeEach(() => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeProcessCloudDatatableSchema);
        processCloudListService = TestBed.inject(ProcessListCloudService);
        getProcessByRequestSpy = spyOn(processCloudListService, 'getProcessByRequest').and.returnValue(of(fakeProcessCloudList));

        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getProcessColumns').and.returnValue(of(fakeDefaultPresetColumns as ExtensionColumnPreset[]));

        fixture = TestBed.createComponent(ProcessListCloudExtComponent);
        component = fixture.componentInstance;
        component.currentFilter = fakeProcessCloudFilter;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('Should load process list', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-cloud-process-list');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');
        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();
        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_mockProcess"]`));

        expect(value1).not.toBeNull();
        expect(value1.nativeElement.innerText.trim()).toBe('mockProcess');
    });

    it('Should load default columns', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const nameColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_name"]`));
        expect(nameColumn).not.toBeNull();

        const processKeyColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_processDefinitionName"]`));
        expect(processKeyColumn).not.toBeNull();

        const statusColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_status"]`));
        expect(statusColumn).not.toBeNull();

        const startDateColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_startDate"]`));
        expect(startDateColumn).not.toBeNull();

        const initiatorColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_initiator"]`));
        expect(initiatorColumn).not.toBeNull();

        const appVersionColumn = fixture.debugElement.query(By.css(`[data-automation-id="auto_id_appVersion"]`));
        expect(appVersionColumn).not.toBeNull();
    });

    it('should enable column selector feature', async () => {
        await fixture.whenStable();

        const processListCloudComponent = fixture.debugElement.query(By.css('adf-cloud-process-list'));
        const processListCloudComponentInstance = processListCloudComponent.componentInstance as ProcessListCloudComponent;
        expect(processListCloudComponentInstance.showMainDatatableActions).toBe(true);
    });

    it('should show View Details in context menu', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        spyOn(component, 'onShowRowContextMenu');
        const tableField = fixture.debugElement.nativeElement.querySelector('[data-automation-id="mockProcess"]');
        tableField.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        const viewContextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS"]`);
        expect(viewContextAction.textContent).toContain('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS');
        viewContextAction.dispatchEvent(new MouseEvent('click'));
    });

    it('should navigate to task list on View Details option is selected from context menu', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        spyOn(component, 'navigateToProcessDetails');
        const element = fixture.debugElement.nativeElement.querySelector('[data-automation-id="mockProcess2"]');
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        const contextAction = document.querySelector(`.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS"]`);
        contextAction.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.navigateToProcessDetails).toHaveBeenCalledWith('process-id-2');
    });

    describe('Display Process Instances based the filter params', () => {

        const allProcessesFilter = fakeProcessCloudFilters[0];
        const runningProcessesFilter = fakeProcessCloudFilters[1];
        const completedProcessesFilter = fakeProcessCloudFilters[2];

        function getProcessesRowsByStatus(status: string) {
            return fixture.debugElement.queryAll(By.css(`[data-automation-id="text_${status}"]`));
        }

        it('Should be able to fetch only running process instances when currentFilter set to running processes filter', async () => {
            component.currentFilter = runningProcessesFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const runningProcesses = getProcessesRowsByStatus('RUNNING');

            expect(getProcessByRequestSpy).toHaveBeenCalledWith(runningProcessesQueryRequestMock);
            expect(runningProcesses.length).toBe(2);
            expect(runningProcesses[0].nativeElement.innerText.trim()).toBe('RUNNING');
            expect(runningProcesses[1].nativeElement.innerText.trim()).toBe('RUNNING');
        });

        it('Should be able to fetch only completed process instances when currentFilter set to completed processes filter', async () => {
            getProcessByRequestSpy.calls.reset();
            getProcessByRequestSpy.and.returnValue(of(fakeCompletedProcessesMockList));
            component.currentFilter = completedProcessesFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const completedProcesses = getProcessesRowsByStatus('COMPLETED');

            expect(getProcessByRequestSpy).toHaveBeenCalledWith(completedProcessesQueryRequestMock);
            expect(completedProcesses.length).toBe(2);
            expect(completedProcesses[0].nativeElement.innerText.trim()).toBe('COMPLETED');
            expect(completedProcesses[1].nativeElement.innerText.trim()).toBe('COMPLETED');
        });

        it('Should be able to fetch all process instances when currentFilter set to all processes filter', async () => {
            getProcessByRequestSpy.calls.reset();
            getProcessByRequestSpy.and.returnValue(of(allProcessesMockList));
            component.currentFilter = allProcessesFilter;
            fixture.detectChanges();
            await fixture.whenStable();

            const completedProcesses = getProcessesRowsByStatus('COMPLETED');
            const runningProcesses = getProcessesRowsByStatus('RUNNING');
            const cancelledProcesses = getProcessesRowsByStatus('CANCELLED');
            const suspendedProcesses = getProcessesRowsByStatus('SUSPENDED');

            expect(completedProcesses.length).toBe(1);
            expect(runningProcesses.length).toBe(1);
            expect(cancelledProcesses.length).toBe(1);
            expect(suspendedProcesses.length).toBe(1);

            expect(getProcessByRequestSpy).toHaveBeenCalledWith(allProcessesQueryRequestMock);
            expect(completedProcesses[0].nativeElement.innerText.trim()).toBe('COMPLETED');
            expect(runningProcesses[0].nativeElement.innerText.trim()).toBe('RUNNING');
            expect(cancelledProcesses[0].nativeElement.innerText.trim()).toBe('CANCELLED');
            expect(suspendedProcesses[0].nativeElement.innerText.trim()).toBe('SUSPENDED');
        });
    });
});

@Component({
    selector: 'apa-custom-process-name-column',
    template: `
        <span data-automation-id="process-name-custom-column">{{ displayValue.name }}</span><br>
        <div>
            <span>Started By : </span>
            <span data-automation-id="process-initiator-custom-column">{{ displayValue.initiator }}</span>
        </div>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomProcessNameComponent implements OnInit {
    @Input()
    context: any;

    displayValue: ProcessInstanceCloud;

    constructor() { }

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

@Component({
    selector: 'apa-custom-process-status-column',
    template: `
        <div>
            <i data-automation-id="process-status-icon-custom-column" class="far fa-check-circle"></i>
            <span data-automation-id="process-status-custom-column">{{ displayValue.status }}</span>
        </div>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomProcessStatusComponent implements OnInit {
    @Input()
    context: any;

    displayValue: ProcessInstanceCloud;

    constructor() { }

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

describe('ProcessListCloudExtComponent With Custom Columns', () => {
    let component: ProcessListCloudExtComponent;
    let fixture: ComponentFixture<ProcessListCloudExtComponent>;
    let processCloudListService: ProcessListCloudService;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;

    setupTestBed({
        imports: [
            PipeModule,
            PaginationModule,
            TranslateModule,
            DataColumnModule,
            ExtensionsModule,
            CommonModule,
            ProcessCloudModule,
            ProcessServicesCloudTestingModule,
            ScrollContainerModule
        ],
        declarations: [ProcessListCloudExtComponent, MockCustomProcessStatusComponent, MockCustomProcessNameComponent],
    });

    beforeEach(() => {
        processCloudListService = TestBed.inject(ProcessListCloudService);
        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getProcessColumns').and.returnValue(<any> of(processListCustomColumnsPresets));
        spyOn(processCloudListService, 'getProcessByRequest').and.returnValue(of(fakeProcessCloudList));

        fixture = TestBed.createComponent(ProcessListCloudExtComponent);
        const extensions = TestBed.inject(ExtensionService);

        extensions.setComponents({
            'process-services-cloud.process-name': MockCustomProcessNameComponent,
            'process-services-cloud.process-status': MockCustomProcessStatusComponent,
        });
        component = fixture.componentInstance;
        component.currentFilter = fakeProcessCloudFilter;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('Should fetch process list custom columns preset from extension', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const adfProcessListColumns = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-cell-header .adf-datatable-cell-value');
        expect(adfProcessListColumns).toBeDefined();
        expect(adfProcessListColumns[0].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.NAME');
        expect(adfProcessListColumns[1].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.PROCESS_DEFINITION_NAME');
        expect(adfProcessListColumns[2].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.STATUS');
        expect(adfProcessListColumns[3].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.START_DATE');
        expect(adfProcessListColumns[4].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.INITIATOR');
        expect(adfProcessListColumns[5].textContent.trim()).toEqual('ADF_CLOUD_PROCESS_LIST.PROPERTIES.APP_VERSION');
    });

    it('Should process list display custom template extension columns', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const customProcessNameTemplateSelector = fixture.debugElement.query(By.css('apa-custom-process-name-column'));
        const customProcessNameColumn = fixture.debugElement.query(By.css(`[data-automation-id="process-name-custom-column"]`));
        const customProcessInitiatorElement = fixture.debugElement.query(By.css(`[data-automation-id="process-initiator-custom-column"]`));

        expect(customProcessNameTemplateSelector).not.toBeNull();
        expect(customProcessNameColumn).not.toBeNull();
        expect(customProcessInitiatorElement).not.toBeNull();

        expect(customProcessNameColumn.nativeElement.innerText.trim()).toBe('mockProcess');
        expect(customProcessInitiatorElement.nativeElement.innerText.trim()).toBe('devops');

        const customProcessStatusTemplateSelector = fixture.debugElement.query(By.css('apa-custom-process-status-column'));
        const customProcessStatusColumn = fixture.debugElement.query(By.css(`[data-automation-id="process-status-custom-column"]`));
        const customProcessStatusIconElement = fixture.debugElement.query(By.css(`[data-automation-id="process-status-icon-custom-column"]`));

        expect(customProcessStatusTemplateSelector).not.toBeNull();
        expect(customProcessStatusColumn).not.toBeNull();
        expect(customProcessStatusIconElement).not.toBeNull();

        expect(customProcessStatusColumn.nativeElement.innerText.trim()).toBe('RUNNING');
    });
});
