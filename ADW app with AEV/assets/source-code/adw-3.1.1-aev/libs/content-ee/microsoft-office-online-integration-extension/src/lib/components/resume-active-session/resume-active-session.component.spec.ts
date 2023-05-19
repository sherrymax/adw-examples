/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumeActiveSessionComponent } from './resume-active-session.component';
import { AppConfigService, CoreModule, setupTestBed, TranslateLoaderService } from '@alfresco/adf-core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Actions } from '@ngrx/effects';
import { MSALInstanceFactory, MSALInterceptorConfigFactory } from '../../microsoft-office-online-integration-extension.module';
import { ContentModule } from '@alfresco/adf-content-services';
import { MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalService } from '../msal';
import { StoreModule } from '@ngrx/store';
import { NodeEntry } from '@alfresco/js-api';
import { WindowRef } from './window-ref';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ResumeActiveSessionComponent', () => {
    let component: ResumeActiveSessionComponent;
    let fixture: ComponentFixture<ResumeActiveSessionComponent>;
    const fakeNode: NodeEntry = <NodeEntry> {
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            aspectNames: [],
            allowableOperations: [],
            properties: {},
        },
    };

    setupTestBed({
        imports: [
            ContentModule,
            CoreModule,
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateLoaderService,
                },
            }),
            MatIconModule,
            MatTooltipModule,
            StoreModule.forRoot({ app: () => {} }, { initialState: {} }),
        ],
        providers: [
            Actions,
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
            WindowRef,
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResumeActiveSessionComponent);
        component = fixture.componentInstance;
    });

    it('should return true if node is being edited in microsoft online', () => {
        spyOn(window.localStorage, 'getItem').and.callFake(function () {
            return JSON.stringify({ microsoftOnline: 'true' });
        });
        const node = JSON.parse(JSON.stringify(fakeNode));
        node.entry.properties['ooi:sessionNodeId'] = 'fake-id';
        node.entry.properties['ooi:acsSessionOwner'] = 'admin';
        node.entry.properties['cm:lockOwner'] = {
            id: 'admin',
            displayName: 'Administrator',
        };
        node.entry.aspectNames = ['ooi:editingInMSOffice'];
        component.context = {
            row: {
                node: node,
                getValue(key: string) {
                    return node[key];
                },
            },
        };

        fixture.detectChanges();

        expect(component.isBeingEditedInMicrosoft()).toEqual(true);
    });

    it('should display resume editing button if session is active', () => {
        spyOn(component, 'isBeingEditedInMicrosoft').and.returnValue(true);
        const node = JSON.parse(JSON.stringify(fakeNode));
        component.context = {
            row: {
                node: node,
                getValue(key: string) {
                    return node.entry[key];
                },
            },
        };
        fixture.detectChanges();
        const resumeSessionButtons = document.querySelectorAll('.adw-microsoft-online-resume-session-icon')?.length;

        expect(resumeSessionButtons).toBeGreaterThan(0);
    });
});
