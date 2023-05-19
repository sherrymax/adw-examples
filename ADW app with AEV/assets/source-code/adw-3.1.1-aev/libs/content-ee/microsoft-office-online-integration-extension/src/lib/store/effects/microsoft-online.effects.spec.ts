/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { RefreshPreviewAction, ReloadDocumentListAction, SetSelectedNodesAction, SnackbarInfoAction } from '@alfresco-dbp/content-ce/shared/store';
import { StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
import { MicrosoftOnlineEffects, MicrosoftSessionDetails } from './microsoft-online.effects';
import { MicrosoftOnlineService, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalService } from '../../components/msal';
import { MSALInstanceFactory, MSALInterceptorConfigFactory } from '../../microsoft-office-online-integration-extension.module';
import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { MinimalNodeEntity, NodeChildAssociationEntry } from '@alfresco/js-api';
import { CancelSessionOfficeAction, EndSessionOfficeAction, ResumeSessionOfficeAction, StartSessionOfficeAction } from '../extension.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WindowRef } from '../../components/resume-active-session/window-ref';
import { Observable, of } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { ContentApiService } from '@alfresco/aca-shared';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { MicrosoftOfficeOnlineIntegrationTestingModule } from '../../testing/microsoft-office-online-integration-testing.module';

describe('MicrosoftOnlineEffects', () => {
    let microsoftOnlineService: MicrosoftOnlineService;
    let authService: AuthenticationService;
    let appConfigService: AppConfigService;
    let contentApi: ContentApiService;
    let msalService: MsalService;
    let effects: MicrosoftOnlineEffects;
    let actions$: Observable<any> = of();
    const fakeToken = 'token';

    const fakeConfig = {
        plugins: {
            microsoftOnline: true,
        },
        msOnline: {
            msHost: 'host',
            msClientId: 'clientId',
            msAuthority: 'authority',
            msRedirectUri: 'http://localhost:4200',
        },
    };

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
            properties: {
                'ooi:acsSessionOwner': 'admin',
                'ooi:sessionNodeId': 'fake-id',
                'ooi:msDriveId': null,
                'ooi:msDriveItemId': null,
                'ooi:msSessionOwner': null,
                'ooi:msWebUrl': 'http://localhost:4200',
                'cm:lockOwner': {
                    id: 'admin',
                    displayName: 'Administrator',
                },
            },
        },
    };

    const microsoftSession: MicrosoftSessionDetails = {
        'ooi:acsSessionOwner': 'admin',
        'ooi:sessionNodeId': 'fake-id',
        'ooi:msDriveId': null,
        'ooi:msDriveItemId': null,
        'ooi:msSessionOwner': null,
        'ooi:msWebUrl': 'http://localhost:4200',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                EffectsModule.forRoot([MicrosoftOnlineEffects]),
                StoreModule.forRoot(
                    {
                        app: () => {},
                    },
                    { initialState: {} }
                ),
                MaterialModule,
                MicrosoftOfficeOnlineIntegrationTestingModule,
            ],
            providers: [
                provideMockActions(() => actions$),
                {
                    provide: MSAL_INSTANCE,
                    useFactory: MSALInstanceFactory,
                    deps: [AppConfigService],
                },
                {
                    provide: MSAL_INTERCEPTOR_CONFIG,
                    useFactory: MSALInterceptorConfigFactory,
                },
                MsalService,
                MicrosoftOnlineService,
                WindowRef,
            ],
        });

        effects = TestBed.inject(MicrosoftOnlineEffects);
        appConfigService = TestBed.inject(AppConfigService);
        authService = TestBed.inject(AuthenticationService);
        contentApi = TestBed.inject(ContentApiService);
        msalService = TestBed.inject(MsalService);
        actions$ = TestBed.inject(Actions);
        microsoftOnlineService = TestBed.inject(MicrosoftOnlineService);
        spyOn(authService, 'getTicketEcmBase64').and.returnValue('EcmTicketMocked');
        spyOn(appConfigService, 'load').and.returnValue(Promise.resolve(fakeConfig));
        spyOn(contentApi, 'getNode').and.returnValue(of(fakeNode as MinimalNodeEntity));
        spyOn(effects, 'toNodeId').and.returnValue(fakeNode.entry.id);
        spyOn(msalService, 'getToken').and.returnValue(of(fakeToken));
    });

    describe('resumeSessionEffect', () => {
        it('should dispatch snackbar action if session has resumed', () => {
            actions$ = hot('a', {
                a: new ResumeSessionOfficeAction(fakeNode),
            });

            const expected = cold('b', {
                b: new SnackbarInfoAction('MICROSOFT-ONLINE.START_SESSION_SUCCESS'),
            });

            expect(effects.resumeSession$).toBeObservable(expected);
        });
    });

    describe('startSessionEffect', () => {
        it('should dispatch different actions if session has started', () => {
            spyOn(microsoftOnlineService, 'startSession').and.returnValue(of(microsoftSession));

            actions$ = hot('a', {
                a: new StartSessionOfficeAction(fakeNode),
            });

            const expected = cold('(bcd)', {
                b: new SnackbarInfoAction('MICROSOFT-ONLINE.START_SESSION_SUCCESS'),
                c: new ReloadDocumentListAction(),
                d: new SetSelectedNodesAction([fakeNode]),
            });

            expect(effects.startSession$).toBeObservable(expected);
        });
    });

    describe('cancelSessionEffect', () => {
        it('should dispatch different actions if session has been cancelled', () => {
            spyOn(microsoftOnlineService, 'cancelSession').and.returnValue(of(microsoftSession));

            actions$ = hot('a', {
                a: new CancelSessionOfficeAction(fakeNode),
            });

            const expected = cold('(bcd)', {
                b: new SnackbarInfoAction('MICROSOFT-ONLINE.CANCEL_SESSION_SUCCESS'),
                c: new ReloadDocumentListAction(),
                d: new SetSelectedNodesAction([fakeNode]),
            });

            expect(effects.cancelSession$).toBeObservable(expected);
        });
    });

    describe('endSessionEffect', () => {
        it('should dispatch different actions if session has ended', () => {
            spyOn(microsoftOnlineService, 'endSession').and.returnValue(of(microsoftSession));

            actions$ = hot('a', {
                a: new EndSessionOfficeAction({
                    node: fakeNode,
                    isMajor: true,
                    comment: 'test',
                }),
            });
            /* cspell: disable-next-line */
            const expected = cold('(bcde)', {
                b: new SnackbarInfoAction('MICROSOFT-ONLINE.END_SESSION_SUCCESS'),
                c: new ReloadDocumentListAction(),
                d: new SetSelectedNodesAction([fakeNode]),
                e: new RefreshPreviewAction(fakeNode),
            });

            expect(effects.endSession$).toBeObservable(expected);
        });
    });
});
