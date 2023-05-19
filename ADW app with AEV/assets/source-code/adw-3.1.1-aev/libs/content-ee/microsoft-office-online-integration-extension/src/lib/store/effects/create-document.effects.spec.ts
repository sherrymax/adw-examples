/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
import { NodeChildAssociationEntry, NodeEntry } from '@alfresco/js-api';
import { CreateOfficeDocumentAndOpenViewerAction, CreateOfficeDocumentAndStartSessionAction, StartSessionOfficeAction } from '../extension.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { cold, hot } from 'jasmine-marbles';
import { ViewNodeAction } from '@alfresco/aca-shared/store';
import { CreateDocumentExtensionEffects } from './create-document.effects';
import { MicrosoftOfficeOnlineIntegrationTestingModule } from '../../testing/microsoft-office-online-integration-testing.module';
import { provideMockActions } from '@ngrx/effects/testing';
import { Router } from '@angular/router';

describe('CreateDocumentExtensionEffects', () => {
    let effects: CreateDocumentExtensionEffects;
    let actions$: Observable<any> = of();
    let router: Router;

    const fakeNode: NodeChildAssociationEntry = {
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            isFolder: false,
            modifiedAt: new Date(),
            nodeType: undefined,
            modifiedByUser: undefined,
            createdAt: new Date(),
            createdByUser: undefined,
            aspectNames: [],
            allowableOperations: [],
            properties: {},
        },
    };

    const fakeFilePath = 'fakeFilePath';
    const fakeFileName = 'fakeFileName';
    const fakeProperties = {};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                EffectsModule.forRoot([CreateDocumentExtensionEffects]),
                MicrosoftOfficeOnlineIntegrationTestingModule,
                StoreModule.forRoot(
                    {
                        app: () => {},
                    },
                    { initialState: {} }
                ),
                MaterialModule,
            ],
            providers: [provideMockActions(() => actions$)],
        });

        router = TestBed.inject(Router);
        effects = TestBed.inject(CreateDocumentExtensionEffects);
        actions$ = TestBed.inject(Actions);
        spyOn(effects, 'uploadFile').and.returnValue(of(fakeNode as NodeEntry));
    });

    describe('createAndOpenViewerEffect', () => {
        it('should dispatch snackbar action if session has resumed', () => {
            actions$ = hot('a', {
                a: new CreateOfficeDocumentAndOpenViewerAction(fakeFilePath, fakeFileName, fakeProperties),
            });

            const expected = cold('b', {
                b: new ViewNodeAction(fakeNode.entry.id, { location: router.url }),
            });

            expect(effects.createAndOpenViewer$).toBeObservable(expected);
        });
    });

    describe('createAndStartSessionEffect', () => {
        it('should dispatch snackbar action if session has resumed', () => {
            actions$ = hot('a', {
                a: new CreateOfficeDocumentAndStartSessionAction(fakeFilePath, fakeFileName, fakeProperties),
            });

            const expected = cold('b', {
                b: new StartSessionOfficeAction(fakeNode),
            });

            expect(effects.createAndStartSession$).toBeObservable(expected);
        });
    });
});
