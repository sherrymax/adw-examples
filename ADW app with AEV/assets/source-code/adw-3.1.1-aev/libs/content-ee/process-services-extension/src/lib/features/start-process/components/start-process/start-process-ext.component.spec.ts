/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { StartProcessExtComponent } from './start-process-ext.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessServicesTestingModule } from '../../../../testing/process-services-testing.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessModule, ProcessService } from '@alfresco/adf-process-services';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { setupTestBed, TranslationService, TranslationMock, ActivitiContentService } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { MinimalNode } from '@alfresco/js-api';
import { of } from 'rxjs';
import { ProcessServiceExtensionState } from '../../../../store/reducers/process-services.reducer';
import { fakeProcessDefinition, singleContentUploadWidgets, selectedNodesMock, multipleContentUploadWidgets } from '../../../../mock/start-process.mock';
import { StartProcessExtService } from '../../services/start-process-ext.service';
import { SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { ActivatedRoute, Router } from '@angular/router';

describe('Start Process Component', () => {
    let component: StartProcessExtComponent;
    let fixture: ComponentFixture<StartProcessExtComponent>;
    let location: Location;
    let store: Store<ProcessServiceExtensionState>;
    let processService: ProcessService;
    let startProcessExtService: StartProcessExtService;
    let activitiContentService: ActivitiContentService;
    let router: Router;
    let activatedRoute: ActivatedRoute;

    setupTestBed({
        imports: [ProcessServicesTestingModule, ProcessModule, TranslateModule],
        declarations: [StartProcessExtComponent],
        providers: [{ provide: TranslationService, useClass: TranslationMock },
            {
                provide: ActivatedRoute,
                useValue: { queryParams: of({}), snapshot: { url: ''}},
            },
            {
                provide: Router,
                useValue: { navigate: () => {} }
            }
        ],

        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StartProcessExtComponent);
        component = fixture.componentInstance;
        location = TestBed.inject(Location);
        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        activatedRoute = TestBed.inject(ActivatedRoute);
        processService = TestBed.inject(ProcessService);
        startProcessExtService = TestBed.inject(StartProcessExtService);
        activitiContentService = TestBed.inject(ActivitiContentService);
        component.appId = 0;
        spyOn(processService, 'getProcessDefinitions').and.returnValue(of([]));
        spyOn(startProcessExtService, 'getDefaultProcessName').and.returnValue('');
        spyOn(activitiContentService, 'getAlfrescoRepositories').and.returnValue(of([{ id: '1', name: 'fake-repo-name' }]));
        spyOn(activitiContentService, 'applyAlfrescoNode').and.returnValue(of({ id: 1234 }));
        fixture.detectChanges();
    });

    it('Should navigate back when cancelling the start process', () => {
        const navigateBackSpy = spyOn(location, 'back');
        component.backFromProcessCreation();
        expect(navigateBackSpy).toHaveBeenCalled();
    });

    it('should route params when process definition changes', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.onProcessDefinitionSelection(fakeProcessDefinition);

        expect(navigateSpy).toHaveBeenCalledWith(
            ['.'],
            {
                queryParams: {
                    process: fakeProcessDefinition.name
                },
                relativeTo: activatedRoute,
                queryParamsHandling: 'merge',
                replaceUrl: true
            }
        );
    });

    it('Should call attachSelectedContentOnStartForm when there is content attached on process definition selection change', () => {
        const attachSelectedContentSpy = spyOn(component, 'attachSelectedContentOnStartForm');
        component.selectedNodes = [new MinimalNode()];

        component.onProcessDefinitionSelection(fakeProcessDefinition);
        expect(attachSelectedContentSpy).toHaveBeenCalledWith(fakeProcessDefinition.id);
    });

    it('Should NOT call attachSelectedContentOnStartForm if the process definition does not change', () => {
        const attachSelectedContentSpy = spyOn(component, 'attachSelectedContentOnStartForm');
        component.selectedNodes = [new MinimalNode()];
        component.selectedProcessDefinitionId = fakeProcessDefinition.id;
        component.onProcessDefinitionSelection(fakeProcessDefinition);
        expect(attachSelectedContentSpy).not.toHaveBeenCalled();
    });

    it('Should show warning notification when the form has no upload widgets', async () => {
        component.selectedNodes = selectedNodesMock;
        const showWarningSnackBarNotification = spyOn(store, 'dispatch');
        spyOn(component, 'prepareFormValues').and.returnValue({});
        spyOn(startProcessExtService, 'getContentUploadWidgets').and.returnValue(of(singleContentUploadWidgets));

        component.onProcessDefinitionSelection(fakeProcessDefinition);
        fixture.detectChanges();
        await fixture.whenStable();
        const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');

        expect(showWarningSnackBarNotification).toHaveBeenCalledWith(expectedActionResult);
    });

    it('Should not show warning notification when form has only single file upload widget with single file selected', async () => {
        component.selectedNodes = selectedNodesMock[0];
        const showWarningSnackBarNotification = spyOn(store, 'dispatch');
        spyOn(component, 'prepareFormValues').and.returnValue({});
        spyOn(startProcessExtService, 'getContentUploadWidgets').and.returnValue(of(singleContentUploadWidgets));

        component.onProcessDefinitionSelection(fakeProcessDefinition);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');

        expect(showWarningSnackBarNotification).not.toHaveBeenCalledWith(expectedActionResult);
    });

    it('Should not show warning notification when form has multiple file upload widgets with single file selected', async () => {
        component.selectedNodes = selectedNodesMock;
        const showWarningSnackBarNotification = spyOn(store, 'dispatch');
        spyOn(component, 'prepareFormValues').and.returnValue({});
        spyOn(startProcessExtService, 'getContentUploadWidgets').and.returnValue(of(multipleContentUploadWidgets));

        component.onProcessDefinitionSelection(fakeProcessDefinition);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');

        expect(showWarningSnackBarNotification).not.toHaveBeenCalledWith(expectedActionResult);
    });
});
