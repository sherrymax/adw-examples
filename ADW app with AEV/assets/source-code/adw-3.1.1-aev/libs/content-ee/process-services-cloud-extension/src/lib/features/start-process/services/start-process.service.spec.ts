/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AppConfigService, setupTestBed } from '@alfresco/adf-core';
import { SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { FormCloudService } from '@alfresco/adf-process-services-cloud';
import { StartProcessService } from './start-process.service';
import { ProcessServicesCloudTestingModule } from '../../../testing/process-services-cloud-testing.module';
import { formWithNoWidgets, formWithUploadWidgets, formWithoutUploadWidgets } from '../mock/start-process.mock';

describe('StartProcessService', () => {
    let store: Store<any>;
    let service: StartProcessService;
    let formService: FormCloudService;
    let appConfig: AppConfigService;

    setupTestBed({
        imports: [TranslateModule.forRoot(), ProcessServicesCloudTestingModule],
    });

    beforeEach(() => {
        store = TestBed.inject(Store);
        service = TestBed.inject(StartProcessService);
        formService = TestBed.inject(FormCloudService);
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, {
            'adf-cloud-start-process.name': 'default-process-name',
            'adf-cloud-start-process.processDefinitionName': 'default-process-definition-name',
            'alfresco-deployed-apps': [{ name: 'mock-app-name' }],
        });

        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();
    });

    it('Should fetch default processName and processDefinition name', () => {
        expect(service.getDefaultProcessName()).toBe('default-process-name');
        expect(service.getDefaultProcessDefinitionName()).toBe('default-process-definition-name');
    });

    it('Should fetch defined appName from app.config json', () => {
        expect(service.getAppName()).toBe('mock-app-name');
    });

    it('Should dispatch SnackbarWarningAction if start form does not have form fields', (done) => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithNoWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe(() => {
            const expectedActionResult = new SnackbarWarningAction('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
            expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
            done();
        });
    });

    it('Should be able to fetch only upload widgets from the start form', (done) => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(2);
            done();
        });
    });

    it('Should dispatch SnackbarWarningAction if start form does not have upload widgets', (done) => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithoutUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(0);
            const expectedActionResult = new SnackbarWarningAction('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
            expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
            done();
        });
    });

    it('Should dispatch SnackbarWarningAction if there is no start form', (done) => {
        spyOn(formService, 'getForm').and.returnValue(throwError('fake-error'));
        const expectedActionResult = new SnackbarWarningAction('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
        service.getContentUploadWidgets('mock-process-def-id').subscribe(() => done());
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
    });
});
