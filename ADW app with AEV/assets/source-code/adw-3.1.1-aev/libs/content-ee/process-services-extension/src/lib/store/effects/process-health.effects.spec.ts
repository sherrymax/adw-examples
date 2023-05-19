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
import { ProcessHealthEffects } from './process-health.effects';
import { ProcessServicesTestingModule } from '../../testing/process-services-testing.module';
import { updateProcessServiceHealth } from '../actions/process-services-health.actions';
import { SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';

describe('ProcessHealthEffects', () => {
    let effects: ProcessHealthEffects;
    let actions$: Observable<Action>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule],
            providers: [ProcessHealthEffects, provideMockActions(() => actions$)],
        });
        effects = TestBed.inject(ProcessHealthEffects);
    });

    it('Should dispatch a warning log action if the health is false', (done) => {
        actions$ = of(updateProcessServiceHealth({ health: false }));

        effects.updateHealth$.subscribe((action) => {
            expect(action).toEqual(new SnackbarErrorAction('PROCESS-EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'));
            done();
        });
    });

    it('Should dispatch nothing if the health is true', () => {
        actions$ = hot('-a-', {
            a: updateProcessServiceHealth({ health: true }),
        });

        const expected$ = hot('---');

        expect(effects.updateHealth$).toBeObservable(expected$);
    });
});
