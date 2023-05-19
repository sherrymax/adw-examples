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
import { ProcessServicesTestingModule } from '../testing/process-services-testing.module';
import { ProcessExtensionService } from './process-extension.service';
import { AppConfigService } from '@alfresco/adf-core';
import { ProcessServiceExtensionState } from '../store/reducers/process-services.reducer';

describe('ProcessExtensionService', () => {
    let store: Store<ProcessServiceExtensionState>;
    let service: ProcessExtensionService;
    let appConfig: AppConfigService;

    const mock = () => {
        let storage: { [key: string]: any } = {};
        return {
            getItem: (key: string) => (key in storage ? storage[key] : null),
            setItem: (key: string, value: any) => (storage[key] = value || ''),
            removeItem: (key: string) => delete storage[key],
            clear: () => (storage = {}),
        };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
        });
        service = TestBed.inject(ProcessExtensionService);

        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, {
            'adf-start-process.name': 'default-process-name',
            'adf-start-process.processDefinitionName': 'default-process-definition-name',
        });

        store = TestBed.inject(Store);
        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();

        Object.defineProperty(window, 'localStorage', { value: mock() });
    });

    it('Should initialize the localStorage with the item processService true if not present', () => {
        expect(localStorage.getItem('processServices')).toBeNull('The localstorage processServices is not null');
        service.enablePlugin();
        expect(localStorage.getItem('processServices')).toBe('true');
    });

    it('Should not change the item processService value if false', () => {
        localStorage.setItem('processServices', 'false');
        service.enablePlugin();
        expect(localStorage.getItem('processServices')).toBe('false');
    });

    it('Should not change the item processService value if true', () => {
        localStorage.setItem('processServices', 'true');
        service.enablePlugin();
        expect(localStorage.getItem('processServices')).toBe('true');
    });
});
