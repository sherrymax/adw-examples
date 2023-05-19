/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ProcessServicesCloudTestingModule } from '../testing/process-services-cloud-testing.module';
import { ProcessExtensionServiceCloud } from './process-extension-cloud.service';
import { AlfrescoApiService, AlfrescoApiServiceMock, AppConfigService, setupTestBed } from '@alfresco/adf-core';
import { ProcessServiceCloudMainState } from '../store/states/state';
import { AppSubscriptionService } from './app-subscription.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ProcessExtensionServiceCloud', () => {
    let store: Store<ProcessServiceCloudMainState>;
    let service: ProcessExtensionServiceCloud;
    let appConfig: AppConfigService;
    let alfrescoApiService: AlfrescoApiService = null;
    let appSubscriptionService: AppSubscriptionService;

    setupTestBed({
        imports: [ProcessServicesCloudTestingModule, MatSnackBarModule],
        providers: [{ provide: AlfrescoApiService, useClass: AlfrescoApiServiceMock }],
    });

    const mockGoodHealthResponse = <any> {
        oauth2Auth: {
            callCustomApi: () => Promise.resolve({ status: 'UP' }),
        },
    };

    const mockBadHealthResponse = <any> {
        oauth2Auth: {
            callCustomApi: () => Promise.resolve({ status: 'DOWN' }),
        },
    };

    beforeEach(() => {
        service = TestBed.inject(ProcessExtensionServiceCloud);
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        appConfig = TestBed.inject(AppConfigService);
        appSubscriptionService = TestBed.inject(AppSubscriptionService);
        appConfig.config = Object.assign(appConfig.config, {
            'alfresco-deployed-apps.name': 'simple-app',
            totalQuickStartProcessDefinitions: 5,
            'alfresco-deployed-apps': [
                {
                    name: 'mock-app-name',
                },
            ],
        });
        store = TestBed.inject(Store);
        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(appSubscriptionService, 'initAppNotifications');
        appConfig.load();
        appConfig.onLoad = of(appConfig.config);
    });

    it('Should fetch totalQuickStartProcessDefinitions', () => {
        expect(service.getTotalQuickStartProcessDefinitions()).toBe(5);
    });

    it('Should be able to call health check api if alfrescoApi is Initialized', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        const getInstanceSpy = spyOn(alfrescoApiService, 'getInstance').and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => done());
        expect(getInstanceSpy).toHaveBeenCalled();
    });

    it('Should not be able to call health check api if alfrescoApi is not Initialized', () => {
        alfrescoApiService.alfrescoApiInitialized.next(false);
        const getInstanceSpy = spyOn(alfrescoApiService, 'getInstance').and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => {});
        expect(getInstanceSpy).not.toHaveBeenCalled();
    });

    it('Should check processServicesCloudRunning is true if backend health status is UP', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        spyOn(alfrescoApiService, 'getInstance').and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(true);
            expect(service.processServicesCloudRunning).toEqual(true);
            done();
        });
    });

    it('Should check processServicesCloudRunning is false if backend health status is DOWN', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        spyOn(alfrescoApiService, 'getInstance').and.returnValue(mockBadHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(false);
            expect(service.processServicesCloudRunning).toEqual(false);
            done();
        });
    });
});
