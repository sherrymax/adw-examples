/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContentServicesTestingModule } from '../../testing/content-services-testing.module';
import { ContentModule } from '@alfresco/adf-content-services';
import { AppConfigService, CoreModule, setupTestBed, SitesService, NotificationService } from '@alfresco/adf-core';
import { MaterialModule } from '../../material.module';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { SiteMembershipRequestWithPersonPaging, SiteEntry } from '@alfresco/js-api';
import { fakeLibraryJoinRequest } from '../../mock/library-mock';
import { SiteMembershipRequestGroup } from '../../models/types';
import { Actions } from '@ngrx/effects';
import { AppStore } from '@alfresco/aca-shared/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MembershipRequestsNotificationsComponent } from './membership-requests-notifications.component';
import { NgZone } from '@angular/core';

describe('MembershipRequestsNotificationsComponent', () => {
    let component: MembershipRequestsNotificationsComponent;
    let sitesService: SitesService;
    let fixture: ComponentFixture<MembershipRequestsNotificationsComponent>;
    let appConfig: AppConfigService;
    let notificationService: NotificationService;
    let pushToNotificationHistorySpy: jasmine.Spy;
    let getSiteMembershipRequestsSpy: jasmine.Spy;
    let store: Store<AppStore>;
    let ngZone: NgZone;
    const currentUser = { id: 'currentUser' };
    const no_requests = {
        list: {
            pagination: {},
            entries: [],
        },
    } as SiteMembershipRequestWithPersonPaging;
    const poolingConfig = { notificationsPooling: 1000 };

    setupTestBed({
        imports: [ContentServicesTestingModule, ContentModule, CoreModule, MaterialModule, TranslateModule.forRoot(), NoopAnimationsModule],
        providers: [Actions, Store],
        declarations: [MembershipRequestsNotificationsComponent],
    });

    beforeEach(() => {
        appConfig = TestBed.inject(AppConfigService);
        fixture = TestBed.createComponent(MembershipRequestsNotificationsComponent);
        component = fixture.componentInstance;
        sitesService = TestBed.inject(SitesService);
        store = TestBed.inject(Store);
        notificationService = TestBed.inject(NotificationService);
        ngZone = TestBed.inject(NgZone);
        pushToNotificationHistorySpy = spyOn(notificationService, 'pushToNotificationHistory');
        getSiteMembershipRequestsSpy = spyOn(sitesService, 'getSiteMembershipRequests');
        spyOn(ngZone, 'runOutsideAngular').and.callFake((fn) => fn());
    });

    beforeEach(() => {
        getSiteMembershipRequestsSpy.calls.reset();
        spyOn(store, 'select').and.returnValue(of(currentUser));
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('With notifications', () => {
        beforeEach(() => {
            appConfig.config = Object.assign(appConfig.config, poolingConfig);
        });

        it('should group request', fakeAsync(() => {
            const requests = { ...fakeLibraryJoinRequest };

            getSiteMembershipRequestsSpy.and.returnValue(of(requests));
            component.ngOnInit();
            tick(0);

            expect(component.list).toEqual([
                {
                    id: 'library-2',
                    createdAt: new Date(3),
                    site: new SiteEntry({
                        entry: {
                            id: 'library-2',
                            title: 'library-2',
                        },
                    }),
                    requests: [
                        {
                            id: 'user3',
                        },
                    ],
                },
                {
                    id: 'library-1',
                    createdAt: new Date(2),
                    site: new SiteEntry({
                        entry: {
                            id: 'library-1',
                            title: 'library-1',
                        },
                    }),
                    requests: [
                        {
                            id: 'user1',
                        },
                        {
                            id: 'user2',
                        },
                    ],
                },
            ] as SiteMembershipRequestGroup[]);

            discardPeriodicTasks();
        }));

        it('should push requests notifications', fakeAsync(() => {
            const requests = { ...fakeLibraryJoinRequest };
            getSiteMembershipRequestsSpy.and.returnValue(of(requests));
            component.ngOnInit();
            tick(0);
            expect(pushToNotificationHistorySpy).toHaveBeenCalledTimes(2);
            discardPeriodicTasks();
        }));

        it('should not push requests notifications if they have been pushed before', fakeAsync(() => {
            const requests = { ...fakeLibraryJoinRequest };
            getSiteMembershipRequestsSpy.and.returnValue(of(requests));
            component.ngOnInit();
            tick(poolingConfig.notificationsPooling);
            getSiteMembershipRequestsSpy.and.returnValue(of(requests));
            tick(poolingConfig.notificationsPooling);
            expect(pushToNotificationHistorySpy).toHaveBeenCalledTimes(2);
            discardPeriodicTasks();
        }));

        it('should filter out current user requests', fakeAsync(() => {
            const requests = <SiteMembershipRequestWithPersonPaging> {
                list: {
                    pagination: {},
                    entries: [
                        {
                            entry: {
                                person: {
                                    id: currentUser.id,
                                },
                            },
                        },
                    ],
                },
            };
            getSiteMembershipRequestsSpy.and.returnValue(of(requests));
            component.ngOnInit();
            tick(0);
            expect(component.list.length).toBe(0);
            discardPeriodicTasks();
        }));
    });

    describe('Pooling', () => {
        beforeEach(() => {
            appConfig.config = Object.assign(appConfig.config, poolingConfig);
        });

        it('should pool based on app configuration', fakeAsync(() => {
            getSiteMembershipRequestsSpy.and.returnValue(of(no_requests));

            component.ngOnInit();
            tick(0);
            expect(getSiteMembershipRequestsSpy).toHaveBeenCalledTimes(1);

            tick(poolingConfig.notificationsPooling);
            expect(getSiteMembershipRequestsSpy).toHaveBeenCalledTimes(2);

            discardPeriodicTasks();
        }));

        it('should update notification list with subsequence data', fakeAsync(() => {
            const requests = { ...fakeLibraryJoinRequest };
            getSiteMembershipRequestsSpy.and.returnValues(of(no_requests), of(requests));
            component.ngOnInit();

            tick(0);
            expect(component.list.length).toBe(0);

            tick(poolingConfig.notificationsPooling);
            expect(component.list.length).toBe(2);

            discardPeriodicTasks();
        }));
    });
});
