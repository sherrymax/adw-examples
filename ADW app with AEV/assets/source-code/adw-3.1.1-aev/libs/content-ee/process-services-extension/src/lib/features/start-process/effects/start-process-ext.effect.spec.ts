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
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { StartProcessExtEffect } from './start-process-ext.effect';
import { ProcessServicesTestingModule } from '../../../testing/process-services-testing.module';
import { START_PROCESS } from '../actions/start-process.actions';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StartProcessDialogOnCloseData } from '../components/start-process-dialog/start-process-dialog.component';
import { ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';

const DIALOG_SELECTED_PROCESS = {
    application: { id: 1 },
    process: { name: 'process-name' } as ProcessDefinitionRepresentation,
};

describe('Start Process Effect', () => {
    let router: Router;
    let effects: StartProcessExtEffect;
    let actions$: Observable<Action>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesTestingModule, MatSnackBarModule],
            providers: [
                StartProcessExtEffect,
                MatSnackBar,
                provideMockActions(() => actions$),
                {
                    provide: MatDialog,
                    useValue: {
                        open() {
                            return {
                                afterClosed(): Observable<StartProcessDialogOnCloseData> {
                                    return of(DIALOG_SELECTED_PROCESS);
                                }
                            };
                        }
                    }
                }
            ],
        });
        router = TestBed.inject(Router);
        effects = TestBed.inject(StartProcessExtEffect);
    });

    it('should open start process dialog and navigate to start process page on selecting process', (done) => {
        actions$ = of({
            type: START_PROCESS,
            payload: {},
        });

        spyOn(router, 'navigate');

        const expectedQueryParams = {
            queryParams: {
                appId: DIALOG_SELECTED_PROCESS.application.id,
                process: DIALOG_SELECTED_PROCESS.process.name,
            },
        };

        effects.startProcessEffect.subscribe(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/start-process'], expectedQueryParams);
            done();
        });
    });

    it('should navigate to start-process on dispatching Start Process Action with selected nodes', () => {
        const selectedNodes: any = [{ entry: { id: 'id', name: 'fake-name' } }];
        const processDefinition = { id: 'id', name: 'fake-name' };

        actions$ = of({
            type: START_PROCESS,
            payload: {
                processDefinition: processDefinition,
                selectedNodes: selectedNodes,
            },
        });

        spyOn(router, 'navigate');

        const params = {
            queryParams: {
                appId: 0,
                processDefinitionName: 'fake-name',
                processDefinitionId: 'id',
            },
        };

        effects.startProcessEffect.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/start-process'], params);
    });

    it('should navigate to start-process on Start Process Action including the quick start process definition selection as parameter', () => {
        actions$ = of({
            type: START_PROCESS,
            payload: {
                processDefinition: { name: 'fakeName', id: 'fakeId' },
            },
        });

        spyOn(router, 'navigate');

        const params = {
            queryParams: {
                appId: 0,
                processDefinitionName: 'fakeName',
                processDefinitionId: 'fakeId',
            },
        };
        effects.startProcessEffect.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/start-process'], params);
    });
});
