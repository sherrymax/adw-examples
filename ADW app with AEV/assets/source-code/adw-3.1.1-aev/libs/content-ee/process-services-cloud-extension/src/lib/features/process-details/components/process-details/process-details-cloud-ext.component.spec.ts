/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
    setupTestBed, PipeModule, UserPreferencesService, TranslationService, TranslationMock, AppConfigService, PaginationModule, DataColumnModule
} from '@alfresco/adf-core';
import { ProcessDetailsCloudExtComponent } from './process-details-cloud-ext.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessServicesCloudTestingModule } from '../../../../../lib/testing/process-services-cloud-testing.module';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessCloudService, TaskListCloudService, TaskListCloudModule, ProcessCloudModule, IdentityUserService } from '@alfresco/adf-process-services-cloud';
import {
    processDetailsCloudMock,
    fakeProcessCloudFilter,
    fakeTaskCloudList,
    fakeProcessHeaderProperties,
    completedProcessDetailsCloudMock,
    processWithInitiator,
    fakeTaskCloudDatatableSchema
} from './../../mock/process-details.mock';
import { MatButtonModule } from '@angular/material/button';
import { openProcessCancelConfirmationDialog } from '../../../../store/actions/process-details.actions';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { ScrollContainerModule } from '../../../../components/scroll-container/scroll-container.module';

describe('ProcessDetailsCloudExtComponent', () => {
    let component: ProcessDetailsCloudExtComponent;
    let fixture: ComponentFixture<ProcessDetailsCloudExtComponent>;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;
    let processCloudService: ProcessCloudService;
    let taskCloudListService: TaskListCloudService;
    let appConfig: AppConfigService;
    let identityUserService: IdentityUserService;
    let store: Store<any>;

    setupTestBed({
        imports: [
            PipeModule,
            PageLayoutModule,
            PaginationModule,
            TranslateModule,
            ProcessServicesCloudTestingModule,
            TaskListCloudModule,
            ProcessCloudModule,
            MatTooltipModule,
            MatButtonModule,
            DataColumnModule,
            ExtensionsModule,
            ScrollContainerModule,
        ],
        declarations: [ProcessDetailsCloudExtComponent],
        providers: [
            UserPreferencesService,
            { provide: TranslationService, useClass: TranslationMock },
            {
                provide: ActivatedRoute,
                useValue: {
                    queryParams: of({ processInstanceId: '123' }),
                },
            },
            {
                provide: Store,
                useValue: {
                    select: (selector) => {
                        if (selector === selectApplicationName) {
                            return of('mock-appName');
                        } else if (selector === selectProcessManagementFilter) {
                            return of(fakeProcessCloudFilter);
                        }
                        return of({});
                    },
                    dispatch: () => {},
                },
            },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessDetailsCloudExtComponent);
        component = fixture.componentInstance;
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign({});
        store = TestBed.inject(Store);
        processCloudService = TestBed.inject(ProcessCloudService);
        taskCloudListService = TestBed.inject(TaskListCloudService);
        identityUserService = TestBed.inject(IdentityUserService);
        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);

        spyOn(processServicesCloudExtensionService, 'getTaskListPreset').and.returnValue(<any> fakeTaskCloudDatatableSchema);
        spyOn(identityUserService, 'getCurrentUserInfo').and.returnValue({ username: 'mockuser' });
        spyOn(processCloudService, 'getProcessInstanceById').and.returnValue(of(processDetailsCloudMock));
        spyOn(taskCloudListService, 'getTaskByRequest').and.returnValue(of(fakeTaskCloudList));
    });

    it('Should get params from routing', () => {
        fixture.detectChanges();
        expect(processCloudService.getProcessInstanceById).toHaveBeenCalledWith('mock-appName', '123');
    });

    it('should load task list of process instance', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const taskList = fixture.debugElement.nativeElement.querySelector('apa-process-task-list-ext');
        expect(taskList).toBeDefined();
    });

    it('should show only specific process header properties', async () => {
        appConfig.config = Object.assign(appConfig.config, fakeProcessHeaderProperties);

        fixture.detectChanges();
        await fixture.whenStable();

        const processHeaderProperties: HTMLElement = <HTMLElement> fixture.debugElement.nativeElement.querySelector('.adf-property-list');
        expect(processHeaderProperties.children.length).toEqual(6);
    });

    it('should load process details', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const processDetails = fixture.debugElement.nativeElement.querySelector('adf-cloud-task-list');
        expect(processDetails).toBeDefined();
        const id = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-id"]'));
        expect(id.nativeElement.value).toBe(processDetailsCloudMock.id);
        const initiator = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-initiator"]'));
        expect(initiator.nativeElement.value).toBe(processDetailsCloudMock.initiator);
        const status = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-status"]'));
        expect(status.nativeElement.value).toBe(processDetailsCloudMock.status);
    });

    describe('Cancel Process Button', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should be able to enable process cancel button if the process is in RUNNING state', () => {
            const cancelButton = fixture.nativeElement.querySelector('.apa-cancel-process-button');
            expect(cancelButton).not.toBeNull();
            expect(cancelButton.disabled).toBe(false);
        });

        it('should be able to disable process cancel button if the process is in COMPLETED state', async () => {
            component.processInstance = completedProcessDetailsCloudMock;
            fixture.detectChanges();
            await fixture.whenStable();

            const cancelButton = fixture.nativeElement.querySelector('.apa-cancel-process-button');

            expect(cancelButton).not.toBeNull();
            expect(cancelButton.disabled).toBe(true);
        });

        it('should be able to dispatch openConfirmationDialog action on click of cancel button', async () => {
            spyOn(store, 'dispatch');
            const cancelButton = fixture.nativeElement.querySelector('.apa-cancel-process-button');
            cancelButton.click();

            fixture.detectChanges();
            await fixture.whenStable();
            const mockAction = openProcessCancelConfirmationDialog({ appName: 'mock-appName', processInstanceId: '123' });

            expect(store.dispatch).toHaveBeenCalledWith(mockAction);
        });

        it('should be able to disable cancel button if the current logged-in user is not a process initiator', async () => {
            component.processInstance = processWithInitiator;
            fixture.detectChanges();
            await fixture.whenStable();

            const cancelButton = fixture.nativeElement.querySelector('.apa-cancel-process-button');
            expect(cancelButton).not.toBeNull();
            expect(cancelButton.disabled).toBe(true);
        });

        it('should be able to tooltip on hover of cancel button', fakeAsync(() => {
            const cancelButton = fixture.debugElement.query(By.css(`.apa-cancel-process-button`));
            const tooltipDirective = cancelButton.injector.get<MatTooltip>(MatTooltip);
            tooltipDirective.show();

            fixture.detectChanges();
            tick(0);

            expect(tooltipDirective._isTooltipVisible()).toBe(true);
            expect(tooltipDirective[`_message`]).toBe('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.CANCEL_TOOLTIP');
        }));
    });
});
