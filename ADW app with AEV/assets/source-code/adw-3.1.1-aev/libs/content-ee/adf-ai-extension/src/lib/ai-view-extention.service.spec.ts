/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppConfigService, setupTestBed, StorageService } from '@alfresco/adf-core';
import { AiViewModuleTestingModule } from './testing/ai-view-testing.module';
import { AiViewExtensionService } from './ai-view-extension.service';

describe('AiViewExtensionService', () => {
    let service: AiViewExtensionService;
    let appConfig: AppConfigService;
    let storage: StorageService;

    setupTestBed({
        imports: [AiViewModuleTestingModule],
    });

    beforeEach(() => {
        storage = TestBed.inject(StorageService);
    });

    it('Should return disabled when app-config has no plugin section', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = {};
        appConfig.onLoad = of(appConfig.config);
        service = TestBed.inject(AiViewExtensionService);
        expect(service.isExtensionEnabled()).toBeFalse();
    });

    it('Should return disabled when app-config has no plugin.ai section', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: {} };
        appConfig.onLoad = of(appConfig.config);
        service = TestBed.inject(AiViewExtensionService);
        expect(service.isExtensionEnabled()).toBeFalse();
    });

    it('Should return disabled when app-config plugin.ai is false', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: { aiService: false } };
        appConfig.onLoad = of(appConfig.config);
        service = TestBed.inject(AiViewExtensionService);
        expect(service.isExtensionEnabled()).toBeFalse();
    });

    it('Should return enabled when plugin.ai is true in app-config', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: { aiService: true } };
        appConfig.onLoad = of(appConfig.config);
        service = TestBed.inject(AiViewExtensionService);
        expect(service.isExtensionEnabled()).toBeTrue();
    });

    it('Should return enabled when plugin.ai is "true" in app-config', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: { aiService: 'true' } };
        appConfig.onLoad = of(appConfig.config);
        service = TestBed.inject(AiViewExtensionService);
        expect(service.isExtensionEnabled()).toBeTrue();
    });

    it('Should get smart viewer enabling status from local storage when the plugin is enabled', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: { aiService: true } };
        appConfig.onLoad = of(appConfig.config);

        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.setItem('ai', 'true');
        expect(service.isSmartViewerEnabled()).toBeTrue();
        storage.setItem('ai', 'anyValue');
        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.setItem('ai', '');
        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.removeItem('ai');
        expect(service.isSmartViewerEnabled()).toBeFalse();
    });

    it('Should return always false for the enabling status of the viewer when the plugin is disabled', () => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = { plugins: { aiService: false } };
        appConfig.onLoad = of(appConfig.config);

        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.setItem('ai', 'true');
        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.setItem('ai', 'anyValue');
        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.setItem('ai', '');
        expect(service.isSmartViewerEnabled()).toBeFalse();
        storage.removeItem('ai');
        expect(service.isSmartViewerEnabled()).toBeFalse();
    });
});
