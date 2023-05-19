/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { ProcessDefinitionEffects } from './process-definition.effects';
import { cold, hot } from 'jasmine-marbles';
import { loadProcessDefinitions, loadProcessDefinitionsFailure } from '../actions/process-definition.actions';
import { PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';
import { Store } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { selectApplicationName } from '../selectors/extension.selectors';
import { selectProcessDefinitionEntities } from '../selectors/process-definitions.selector';

describe('ProcessDefinitionEffects', () => {
    let actions$: Observable<any>;
    let effects: ProcessDefinitionEffects;
    let startProcessCloudService: StartProcessCloudService;

    /* cspell:disable */
    const processDefinitionMock = {
        appName: 'mock-appName',
        appVersion: 1,
        formKey: 'form-bf715c98-a607-4d63-b52d-700e939429aa',
        id: 'Process_66AFnDFHM:1:58b02889-9422-11ea-9f59-52b2b97fcb55',
        key: 'Process_66AFnDFHM',
        name: 'process1',
        category: 'fakeCategory',
        description: 'fakeDescription',
        serviceFullName: 'service',
        serviceName: 'sn',
        serviceType: 'bundle',
        serviceVersion: '',
        version: 1,
    };
    /* cspell:enable */

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ProcessDefinitionEffects,
                provideMockActions(() => actions$),
                {
                    provide: PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN,
                    useValue: {}
                },
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectProcessDefinitionEntities) {
                                return of([processDefinitionMock]);
                            } else if (selector === selectApplicationName) {
                                return of('mock-appName');
                            } else {
                                return of();
                            }
                        },
                        dispatch: () => {},
                    },
                },
            ],
        });

        effects = TestBed.inject(ProcessDefinitionEffects);
        startProcessCloudService = TestBed.inject(StartProcessCloudService);
    });

    it('should dispatch ProcessDefinitions success action on loadProcessDefinitions action', () => {
        spyOn(startProcessCloudService, 'getProcessDefinitions').and.returnValue(of([processDefinitionMock]));
        actions$ = hot('-a-', { a: loadProcessDefinitions() });

        const expected$ = hot('-b-', {
            b: {
                type: '[ProcessDefinition] Load ProcessDefinitions Success',
                definitions: [processDefinitionMock],
            },
        });
        expect(effects.loadProcessDefinitions$).toBeObservable(expected$);
    });

    it('should call the load definition service with the right appName', () => {
        spyOn(startProcessCloudService, 'getProcessDefinitions').and.returnValue(of([processDefinitionMock]));
        actions$ = of({
            type: '[ProcessDefinition] Load ProcessDefinitions',
            name: 'Load Definition',
        });

        effects.loadProcessDefinitions$.subscribe(() => {});
        expect(startProcessCloudService.getProcessDefinitions).toHaveBeenCalledWith('mock-appName', { include: 'variables' });
    });

    it('should dispatch ProcessDefinitions error action on loadProcessDefinitions action', () => {
        actions$ = hot('-a|', { a: loadProcessDefinitions()});

        const response = cold('-#|)', {}, new Error('error') );
        startProcessCloudService.getProcessDefinitions = () => response;

        const expected = cold('--(b|)', { b: loadProcessDefinitionsFailure({ error: 'error' })});

        expect(effects.loadProcessDefinitions$).toBeObservable(expected);
    });
});
