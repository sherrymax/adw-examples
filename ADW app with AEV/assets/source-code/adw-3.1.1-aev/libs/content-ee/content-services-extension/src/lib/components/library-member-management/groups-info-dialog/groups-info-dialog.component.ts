/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { GroupService } from '@alfresco/adf-content-services';
import { InfinitePaginationComponent, SitesService } from '@alfresco/adf-core';
import { GroupEntry, Pagination, SiteGroupEntry, SiteGroupPaging } from '@alfresco/js-api';
import { Component, Inject, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { GroupsInfoDialogData } from '../../../models/types';

@Component({
    templateUrl: './groups-info-dialog.component.html',
    styleUrls: ['./groups-info-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class GroupsInfoDialogComponent implements OnInit, OnDestroy {
    static GROUP_RELATION_PAGINATION = 5;

    @ViewChild('infinitePagination', { static: true })
    infinitePagination: InfinitePaginationComponent;

    loading: boolean;
    groups: SiteGroupEntry[] = [];
    groupMemberships: SiteGroupEntry[];
    userGroups: GroupEntry[];

    pagination: Pagination = {
        skipCount: 0,
        maxItems: 0,
        hasMoreItems: true,
    };

    protected onDestroy$ = new Subject<boolean>();

    constructor(
        public dialogRef: MatDialogRef<GroupsInfoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GroupsInfoDialogData,
        private sitesService: SitesService,
        private groupService: GroupService
    ) {}

    ngOnInit(): void {
        void this.initMemberGroups();
    }

    private async initMemberGroups() {
        this.loading = true;
        this.userGroups = await this.groupService.listAllGroupMembershipsForPerson(this.data.memberId, { where: `(zones in ('APP.DEFAULT'))` });

        this.sitesService.listSiteGroups(this.data.siteId).subscribe((groups: SiteGroupPaging) => {
            this.groupMemberships = this.filterGroups(groups.list.entries);
            this.loading = false;
        });
    }

    private filterGroups(libraryGroups: SiteGroupEntry[]): SiteGroupEntry[] {
        return libraryGroups.filter((libraryGroup: SiteGroupEntry) => this.isGroupInLibrary(libraryGroup.entry.id));
    }

    private isGroupInLibrary(siteId: string): boolean {
        return !!this.userGroups.find((userGroup: GroupEntry) => userGroup.entry.id === siteId);
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }
}
