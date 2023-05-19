/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartProcessComponent } from './start-process.component';
import { setupTestBed } from '@alfresco/adf-core';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessServicesCloudTestingModule } from '../../../../testing/process-services-cloud-testing.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    StartProcessCloudModule,
    StartProcessCloudService,
    ProcessNameCloudPipe,
    ProcessDefinitionCloud,
    FormCloudService
} from '@alfresco/adf-process-services-cloud';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { SnackbarErrorAction, SetFileUploadingDialogAction, SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { StartProcessService } from '../../services/start-process.service';
import { mockQueryParams, mockProcessDefinitions, selectedNodesMock } from '../../../../mock/start-process.mock';
import { delay, takeUntil } from 'rxjs/operators';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { processCreationSuccess } from '../../../../store/actions/process-instance-cloud.action';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';

describe('Start Process Cloud Extension', () => {
    let fixture: ComponentFixture<StartProcessComponent>;
    let component: StartProcessComponent;
    let store: Store<any>;
    let location: Location;
    let startProcessService: StartProcessService;
    let startProcessServiceCloud: StartProcessCloudService;
    let formCloudService: FormCloudService;
    let processDefinitions: ProcessDefinitionCloud[] = [
        new ProcessDefinitionCloud({
            appName: 'mockAppName',
            appVersion: 0,
            id: 'NewProcess:1',
            name: 'process1',
            key: 'process-12345-f992-4ee6-9742-3a04617469fe',
            formKey: 'mockFormKey',
            category: 'fakeCategory',
            description: 'fakeDesc',
        }),
    ];
    let processDefinitionName = 'defaultProcessName';
    let testEnded$: Subject<void>;
    let router: Router;
    let activatedRoute: ActivatedRoute;

    const mockProcessInstanceCloud = {
        appName: 'mockAppName',
        id: 'id',
        name: 'defaultProcessName',
        startDate: new Date(),
        initiator: '',
        status: '',
        businessKey: '',
        lastModified: new Date(),
        parentId: '',
        processDefinitionId: '',
        processDefinitionKey: 'key',
        processDefinitionName: '',
    };

    setupTestBed({
        declarations: [StartProcessComponent],
        imports: [
            StartProcessCloudModule,
            TranslateModule,
            ProcessServicesCloudTestingModule,
            PageLayoutModule,
        ],
        providers: [
            ProcessNameCloudPipe,
            {
                provide: ActivatedRoute,
                useValue: {
                    queryParams: of(mockQueryParams),
                },
            },
            {
                provide: Router,
                useValue: {
                    navigate: () => {}
                }
            },
            provideMockStore({
                initialState: {},
                selectors: [
                    { selector: selectApplicationName, value: 'mockAppName' },
                ],
            })
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(async () => {
        testEnded$ = new Subject<void>();
        startProcessService = TestBed.inject(StartProcessService);
        startProcessServiceCloud = TestBed.inject(StartProcessCloudService);
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        activatedRoute = TestBed.inject(ActivatedRoute);
        location = TestBed.inject(Location);
        startProcessService = TestBed.inject(StartProcessService);
        startProcessServiceCloud = TestBed.inject(StartProcessCloudService);
        formCloudService = TestBed.inject(FormCloudService);
        fixture = TestBed.createComponent(StartProcessComponent);
        component = fixture.componentInstance;

        spyOn(startProcessService, 'getDefaultProcessName').and.returnValue(processDefinitionName);
        spyOn(startProcessServiceCloud, 'getProcessDefinitions').and.returnValue(of(processDefinitions).pipe(delay(500)));
        spyOn(startProcessServiceCloud, 'getStartEventFormStaticValuesMapping').and.returnValue(of([]));
        spyOn(startProcessServiceCloud, 'createProcess').and.returnValue(of(mockProcessInstanceCloud));
        spyOn(startProcessService, 'getAppName').and.returnValue(of('mockAppName'));
        spyOn(formCloudService, 'getForm').and.returnValue(of({ formRepresentation: {} } as any));

        fixture.detectChanges();
        await fixture.whenStable();
    });

    afterEach(() => {
        testEnded$.next();
        testEnded$.complete();
        fixture.destroy();
    });

    it('should dispatch on process creation success', () => {
        spyOn(store, 'dispatch');
        component.onProcessCreation(mockProcessInstanceCloud);
        fixture.detectChanges();
        expect(store.dispatch).toHaveBeenCalledWith(processCreationSuccess({
            processName: mockProcessInstanceCloud.name,
            processDefinitionKey: mockProcessInstanceCloud.processDefinitionKey,
        }));
    });

    it('should show snack-bar error notification when an error is thrown while starting process', () => {
        spyOn(store, 'dispatch');
        const errorMessage = 'Something went wrong';
        component.onProcessCreationError({
            response: {
                body: {
                    entry: {
                        message: errorMessage,
                    },
                },
            },
        });
        fixture.detectChanges();
        const mockProcessSnackbarErrorAction = new SnackbarErrorAction(errorMessage);
        expect(store.dispatch).toHaveBeenCalledWith(mockProcessSnackbarErrorAction);
    });

    it('should go back after starting a process', () => {
        spyOn(location, 'back');
        component.onProcessCreation(mockProcessInstanceCloud);
        fixture.detectChanges();
        expect(location.back).toHaveBeenCalled();
    });

    describe('For attach file widgets in the form', () => {
        beforeEach(() => {
            processDefinitions = mockProcessDefinitions;
            processDefinitionName = 'mock-name';
        });

        describe('When 1 file is selected', () => {
            it('Should show warning notification in case start form does not have any upload widgets', (done) => {
                spyOn(store, 'dispatch');
                spyOn(startProcessService, 'getFormById').and.returnValue(of({}));

                startProcessService.getContentUploadWidgets('mock-process-def-id').subscribe(() => {
                    const expectedActionResult = new SnackbarWarningAction('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
                    expect(store.dispatch).toHaveBeenCalledWith(expectedActionResult);
                    done();
                });

                component.mapSelectedFilesFormKey('mock-formkey');
            });

            it('only the very first simple widget should be set', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('only the very first simple widget should be set (even if it was preceded by a multiple file widget)', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile2');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('should route params when process definition changes', () => {
                const navigateSpy = spyOn(router, 'navigate');
                component.onProcessDefinitionSelection(processDefinitions[0]);

                expect(navigateSpy).toHaveBeenCalledWith(
                    ['.'],
                    {
                        queryParams: {
                            process: processDefinitions[0].name
                        },
                        relativeTo: activatedRoute,
                        queryParamsHandling: 'merge',
                        replaceUrl: true
                    }
                );
            });

            it('only the very first multiple widget should be set if there is no simple widget', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });
        });

        describe('When multiple files are selected', () => {
            it('only the very first multiple widget should be set', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toBe(selectedNodesMock);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('only the very first multiple widget should be set (even if it was preceded by a single file widget)', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile2');
                    expect(formValues[0].value).toEqual(selectedNodesMock);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('no single file widget should be set if there is no multiple widget', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(0);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });
        });
    });

    it('Should be able to call getContentUploadWidgets if selected nodes are available', (done) => {
        const getContentUploadWidgetsSpy = spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
            of([
                {
                    id: 'AttachFile1',
                    type: 'multiple',
                },
            ])
        );
        startProcessService.setSelectedNodes(selectedNodesMock);

        component.formValues$.pipe(takeUntil(testEnded$)).subscribe(() => {
            expect(getContentUploadWidgetsSpy).toHaveBeenCalledWith(processDefinitions[0].formKey);
            done();
        });

        component.onProcessDefinitionSelection(processDefinitions[0]);
    });

    it('Should not be able to call getContentUploadWidgets if there are no selected nodes', () => {
        const getContentUploadWidgetsSpy = spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
            of([
                {
                    id: 'AttachFile1',
                    type: 'multiple',
                },
            ])
        );
        startProcessService.setSelectedNodes([]);
        component.onProcessDefinitionSelection(processDefinitions[0]);

        expect(getContentUploadWidgetsSpy).not.toHaveBeenCalled();
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
});
