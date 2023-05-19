/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subject, timer, merge } from 'rxjs';
import { SiteMembershipRequestWithPersonPaging, SiteMembershipRequestWithPersonEntry, SiteEntry } from '@alfresco/js-api';
import { map, takeUntil, switchMap, mergeMap } from 'rxjs/operators';
import { getUserProfile, AppStore } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';
import { ProfileState } from '@alfresco/adf-extensions';
import { SiteMembershipRequestGroup } from '../../models/types';
import { AppConfigService, SitesService } from '@alfresco/adf-core';
import { ContentExtensionNotificationService } from './content-extension-notification.service';

@Component({
    selector: 'acs-membership-requests-notifications',
    template: '<ng-content></ng-content>',
})
export class MembershipRequestsNotificationsComponent implements OnInit, OnDestroy {
    private restartPooling$ = new Subject<boolean>();
    private onDestroy$ = new Subject<boolean>();
    list: SiteMembershipRequestGroup[] = [];

    constructor(
        private sitesService: SitesService,
        private appConfig: AppConfigService,
        private store: Store<AppStore>,
        private contentExtensionNotificationService: ContentExtensionNotificationService,
        private ngZone: NgZone
    ) {}

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.pooling().subscribe((data: SiteMembershipRequestWithPersonPaging) => {
                this.updateNotificationsList(data);
            });
            this.restartPooling$.next(false);
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    private pooling(): Observable<SiteMembershipRequestWithPersonPaging> {
        return merge(this.restartPooling$).pipe(
            switchMap((restart) => timer(restart ? this.refreshTimeout : 0, this.refreshTimeout)),
            mergeMap(() => this.getRequests())
        );
    }

    private updateNotificationsList(data: SiteMembershipRequestWithPersonPaging) {
        const pendingRequests = this.processRawRequests(data);
        const newRequests = this.filterNewRequests(pendingRequests);
        this.notifyNewRequests(newRequests);
        this.list = pendingRequests;
    }

    private notifyNewRequests(newRequests: SiteMembershipRequestGroup[]) {
        newRequests.forEach((request) => {
            const notification = this.contentExtensionNotificationService.createRequestNotification(request);
            this.contentExtensionNotificationService.notify(notification);
        });
    }

    private filterNewRequests(pendingRequests: SiteMembershipRequestGroup[]) {
        return pendingRequests.filter((request) => this.isRequestNew(request));
    }

    private isRequestNew(pendingRequest: SiteMembershipRequestGroup): boolean {
        const request = this.list.find((previousRequest) =>
            pendingRequest.site.entry.guid === previousRequest.site.entry.guid && JSON.stringify(pendingRequest, null, 0) === JSON.stringify(previousRequest, null, 0)
        );

        return request === undefined;
    }

    private groupRequests(list: SiteMembershipRequestWithPersonEntry[]): SiteMembershipRequestGroup[] {
        return list.reduce((accumulator, element) => {
            const key = element.entry.id;
            const found = accumulator.find((group: SiteMembershipRequestGroup) => group.id === element.entry.id);

            if (!found) {
                accumulator.push({
                    id: key,
                    createdAt: element.entry.createdAt,
                    site: new SiteEntry({ entry: element.entry.site }),
                    requests: [element.entry.person],
                });
            } else {
                found.requests.push(element.entry.person);
                found.createdAt = element.entry.createdAt;
            }

            return accumulator;
        }, []);
    }

    private processRawRequests(data: SiteMembershipRequestWithPersonPaging): SiteMembershipRequestGroup[] {
        return Object.values(
            this.groupRequests(data.list.entries).reduce((accumulator, entry) => {
                accumulator[entry.id] = entry;
                return accumulator;
            }, [])
        ).sort((first, second) => second.createdAt.valueOf() - first.createdAt.valueOf());
    }

    private filterCurrentUser(data: SiteMembershipRequestWithPersonPaging): Observable<SiteMembershipRequestWithPersonPaging> {
        return this.store.select(getUserProfile).pipe(
            map((user: ProfileState) => ({
                list: {
                    entries: data.list.entries.filter((element: SiteMembershipRequestWithPersonEntry) => element.entry.person.id !== user.id),
                    pagination: data.list.pagination,
                },
            })),
            takeUntil(this.onDestroy$)
        );
    }

    private get refreshTimeout(): number {
        return this.appConfig.get<number>('notificationsPooling') || 30000;
    }

    private getRequests(): Observable<SiteMembershipRequestWithPersonPaging> {
        return this.sitesService.getSiteMembershipRequests().pipe(mergeMap((data: SiteMembershipRequestWithPersonPaging) => this.filterCurrentUser(data)));
    }
}
