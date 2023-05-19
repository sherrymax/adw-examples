/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of, throwError, Subject } from 'rxjs';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { FormService, AppConfigService, FormModel, FormEvent } from '@alfresco/adf-core';
import {
    startFormWithContentUploadWidgets,
    startFormWithNoUploadWidgets,
    startFormWithLocalAndContentUploadWidgets,
    startFormWithOnlyLocalUploadWidgets,
    startFormWithNoFields,
} from '../../../mock/process-services.mock';
import { SnackbarWarningAction, SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { StartProcessExtService } from './start-process-ext.service';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';

export class MockFormService {
    formLoaded = new Subject<FormEvent>();
    getStartFormDefinition() {
        return of();
    }
}

describe('StartProcessExtService', () => {
    let store: Store<ProcessServiceExtensionState>;
    let service: StartProcessExtService;
    let formService: FormService;
    let appConfig: AppConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [
                {
                    provide: FormService,
                    useClass: MockFormService,
                },
            ],
        });
        store = TestBed.inject(Store);
        service = TestBed.inject(StartProcessExtService);

        formService = TestBed.inject(FormService);

        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, {
            'adf-start-process.name': 'default-process-name',
            'adf-start-process.processDefinitionName': 'default-process-definition-name',
        });

        store = TestBed.inject(Store);
        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();
    });

    it('Should fetch default processName and processDefinition name', () => {
        expect(service.getDefaultProcessName()).toBe('default-process-name');
        expect(service.getDefaultProcessDefinitionName()).toBe('default-process-definition-name');
    });

    it('Should fetch content widgets from the start form', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(of(startFormWithContentUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(2);
            expect(contentWidgets[0].type).toBe('single');
            expect(contentWidgets[1].type).toBe('multiple');
            done();
        });

        formService.formLoaded.next(new FormEvent(new FormModel()));
    });

    it('Should skip upload widget if it is pointing to local file source', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(of(startFormWithLocalAndContentUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(1);
            done();
        });
        formService.formLoaded.next(new FormEvent(new FormModel()));
    });

    it('Should show warning notification in case start form has only local source upload widgets', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(of(startFormWithOnlyLocalUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(0);
            const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.NO_CONTENT');
            expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
            done();
        });
    });

    it('Should show warning notification in case start form does not have any upload widgets', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(of(startFormWithNoUploadWidgets));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(0);
            const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');
            expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
            done();
        });
    });

    it('Should dispatch SnackbarWarningAction if form does not have form fields', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(of(startFormWithNoFields));
        service.getContentUploadWidgets('mock-process-def-id').subscribe((contentWidgets) => {
            expect(contentWidgets.length).toBe(0);
            const expectedActionResult = new SnackbarWarningAction('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');
            expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
            done();
        });
        formService.formLoaded.next(new FormEvent(new FormModel()));
    });

    it('Should dispatch SnackbarWarningAction if there is no start form', (done) => {
        spyOn(formService, 'getStartFormDefinition').and.returnValue(throwError('fake-error'));
        const expectedActionResult = new SnackbarErrorAction('PROCESS-EXTENSION.ERROR.NO_FORM');
        service.getContentUploadWidgets('mock-process-def-id').subscribe(
            () => {},
            () => done()
        );
        expect(store.dispatch['calls'].mostRecent().args).toEqual([expectedActionResult]);
        formService.formLoaded.next(new FormEvent(new FormModel()));
    });
});
