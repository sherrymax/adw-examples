/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { SiteEntry } from '@alfresco/js-api';
import { SitesService } from '@alfresco/adf-core';
import { ActivatedRoute } from '@angular/router';
import { ToolbarComponent } from '../shared';
import { AppExtensionService } from '@alfresco-dbp/content-ce/shared';
import { Store } from '@ngrx/store';
import { SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { ACS_VERSIONS } from '../../models/types';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UsersListComponent } from './users-list/users-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';

@Component({
    selector: 'adw-library-details',
    templateUrl: './library-details.component.html',
    styleUrls: ['./library-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LibraryDetailsComponent extends ToolbarComponent implements OnInit, OnDestroy {
    site: SiteEntry = null;
    notFound = false;
    loading = true;
    ACS_VERSIONS = ACS_VERSIONS;
    pendingRequests = 0;
    @ViewChild(UsersListComponent) usersList: UsersListComponent;
    @ViewChild(GroupsListComponent) groupsList: GroupsListComponent;
    @ViewChild(PendingRequestsComponent) pendingRequest: PendingRequestsComponent;

    constructor(
        public sitesService: SitesService,
        private route: ActivatedRoute,
        private location: Location,
        protected store: Store<any>,
        protected appExtensionService: AppExtensionService
    ) {
        super(store, appExtensionService);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.route.params.subscribe(({ siteId }) => {
            this.sitesService.getSite(siteId).subscribe(
                (site: SiteEntry) => {
                    site['isLibrary'] = true;
                    this.store.dispatch(new SetSelectedNodesAction([site] as any));
                    this.site = site;
                    this.loading = false;
                },
                () => {
                    this.notFound = true;
                    this.loading = false;
                }
            );
        });
    }

    onClick() {
        this.location.back();
    }

    redirectToLibrary(event: Event) {
        if (event && event.type === 'click') {
            event.preventDefault();
        }
        this.location.back();
    }

    onPendingRequestCounterChange(pendingRequests: number) {
        this.pendingRequests = pendingRequests;
    }

    onTabChange(event: MatTabChangeEvent) {
        switch (event.index) {
        case 1:
            this.usersList.refresh();
            break;
        case 2:
            this.groupsList.refresh();
            break;
        case 3:
            this.pendingRequest.refresh();
            break;
        }
    }
}
