/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDefinitionsExtComponent } from './process-definitions-ext.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { ProcessService, ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ProcessServicesTestingModule } from '../../../../testing/process-services-testing.module';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessServiceExtensionState } from '../../../../store/reducers/process-services.reducer';
import { START_PROCESS } from '../../actions/start-process.actions';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatListItemHarness } from '@angular/material/list/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('ProcessDefinitionsExtComponent', () => {
    let component: ProcessDefinitionsExtComponent;
    let fixture: ComponentFixture<ProcessDefinitionsExtComponent>;
    let processService: ProcessService;
    let getProcessDefinitionsSpy: jasmine.Spy;
    let store: Store<ProcessServiceExtensionState>;
    let selectSpy: jasmine.Spy;
    let loader: HarnessLoader;

    const mockProcessDefinitions = <ProcessDefinitionRepresentation[]> [
        { id: 'processDefId-1', name: 'processDefName-1' },
        { id: 'processDefId-2', name: 'processDefName-2' },
        { id: 'processDefId-3', name: 'processDefName-3' },
    ];

    const mockSelectedNodes = {
        nodes: [{ entry: { id: 'node-id', name: 'file_name' } }],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule, MatRippleModule, MatListModule, MatIconModule, TranslateModule.forRoot()],
            declarations: [ProcessDefinitionsExtComponent],
        });
    });

    describe('With Content', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ProcessDefinitionsExtComponent);
            component = fixture.componentInstance;
            store = TestBed.inject(Store);
            selectSpy = spyOn(store, 'select').and.returnValue(of(mockSelectedNodes));
            processService = TestBed.inject(ProcessService);
            getProcessDefinitionsSpy = spyOn(processService, 'getProcessDefinitions').and.returnValue(of(mockProcessDefinitions));
            fixture.detectChanges();

            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('Should display process definitions', async () => {
            const listItems = await loader.getAllHarnesses(MatListItemHarness);

            const itemTextOne = await listItems[0].getLinesText();
            const itemTextTwo = await listItems[1].getLinesText();
            const itemTextThree = await listItems[2].getLinesText();

            expect(itemTextOne[0]).toEqual('processDefName-1');
            expect(itemTextTwo[0]).toEqual('processDefName-2');
            expect(itemTextThree[0]).toEqual('processDefName-3');
        });

        it('Should be able to get selected nodes from the store', () => {
            expect(selectSpy).toHaveBeenCalled();
            expect(component.selectedNodes.length).toEqual(1);
            expect(component.selectedNodes[0].entry.id).toEqual('node-id');
            expect(component.selectedNodes[0].entry.name).toEqual('file_name');
        });

        it('Should dispatch startProcessAction with the content attached', () => {
            const startProcessesActionSpy = spyOn(store, 'dispatch');

            const expectedPayload = {
                payload: {
                    processDefinition: mockProcessDefinitions[0],
                    selectedNodes: mockSelectedNodes.nodes,
                },
                type: START_PROCESS,
            };

            const processDef = fixture.debugElement.nativeElement.querySelector('mat-list-item');
            processDef.click();
            fixture.detectChanges();
            expect(startProcessesActionSpy).toHaveBeenCalledWith(expectedPayload);
        });
    });

    describe('Without Content', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ProcessDefinitionsExtComponent);
            component = fixture.componentInstance;
            store = TestBed.inject(Store);
            selectSpy = spyOn(store, 'select').and.returnValue(of([]));
            spyOn(store, 'dispatch').and.callThrough();
            processService = TestBed.inject(ProcessService);
            getProcessDefinitionsSpy = spyOn(processService, 'getProcessDefinitions').and.returnValue(of(mockProcessDefinitions));
            fixture.detectChanges();

            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('Should show-more-option be present when totalQuickStartProcessDefinitions is smaller than the actualProcessDefinitions', async () => {
            component.totalQuickStartProcessDefinitions = 2;
            fixture.detectChanges();

            const listItems = await loader.getAllHarnesses(MatListItemHarness);
            expect(listItems.length).toEqual(3);

            const showMoreItem = await loader.getHarness(MatListItemHarness.with({ selector: '[data-automation-id="quick-start-more-item"]'}));
            expect(showMoreItem).not.toBeNull();

            const showMoreText = await showMoreItem.getLinesText();
            expect(showMoreText[0]).toEqual('PROCESS-EXTENSION.PROCESS_SUBMENU.MORE');
        });

        it('Should show-more-option not be present when totalQuickStartProcessDefinitions is larger than the actualProcessDefinitions', () => {
            component.totalQuickStartProcessDefinitions = 4;
            fixture.detectChanges();
            const processDefinitionItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
            const showMoreItem = fixture.debugElement.query(By.css('[data-automation-id="quick-start-more-item"]'));

            expect(showMoreItem).toBeNull();
            expect(processDefinitionItems.length).toEqual(3);
        });

        it('Should show no process definitions available', () => {
            getProcessDefinitionsSpy.and.returnValues(of([]));
            component.ngOnInit();
            fixture.detectChanges();
            const noProcessDefinitions = fixture.debugElement.query(By.css('[data-automation-id="no-process-definitions"]'));
            expect(noProcessDefinitions).not.toBeNull();
            expect(noProcessDefinitions.nativeElement.innerText).toEqual('PROCESS-EXTENSION.NO_PROCESS_DEFINITIONS');
        });
    });
});
