/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { hot } from 'jasmine-marbles';
import { ProcessCloudHealthEffects } from './process-cloud-health.effects';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import { initialiseExtension } from '../actions/extension.actions';
import { SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';

describe('ProcessCloudHealthEffects', () => {
    let effects: ProcessCloudHealthEffects;
    let actions$: Observable<Action>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesCloudTestingModule],
            providers: [ProcessCloudHealthEffects, provideMockActions(() => actions$)],
        });
        effects = TestBed.inject(ProcessCloudHealthEffects);
    });

    it('Should dispatch a warning log action if the health is false', (done) => {
        actions$ = of(initialiseExtension({ health: false, application: '' }));

        effects.updateHealth$.subscribe((action) => {
            expect(action).toEqual(new SnackbarErrorAction('PROCESS_CLOUD_EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'));
            done();
        });
    });

    it('Should dispatch nothing if the health is true', () => {
        actions$ = hot('-a-', {
            a: initialiseExtension({ health: true, application: '' }),
        });

        const expected$ = hot('---');

        expect(effects.updateHealth$).toBeObservable(expected$);
    });
});
