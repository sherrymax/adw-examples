/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Group, SiteGroup, SiteGroupPaging, SiteMembershipBodyUpdate } from '@alfresco/js-api';
import { NotificationService, PaginationModel, ShowHeaderMode, SitesService } from '@alfresco/adf-core';
import { catchError, filter, finalize, switchMap } from 'rxjs/operators';
import { forkJoin, of, Subject } from 'rxjs';
import { LibraryDialogService } from '../services';

@Component({
    selector: 'adw-groups-list',
    templateUrl: './groups-list.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class GroupsListComponent implements OnChanges, OnDestroy {
    @Input()
    siteId: string;

    loading: boolean;
    groups: SiteGroupPaging;
    selectedRows: SiteGroup[] = [];
    performAction$ = new Subject();
    showHeader: ShowHeaderMode = ShowHeaderMode.Never;

    private pagination: PaginationModel = new PaginationModel();

    constructor(private sitesService: SitesService, private notificationService: NotificationService, private dialogService: LibraryDialogService) {
        this.performAction$.subscribe((action: any) => {
            this.bulkDeleteGroup([action['data'].entry.id]);
        });
    }

    ngOnChanges(): void {
        if (this.siteId) {
            this.loadSiteGroups();
        }
    }

    ngOnDestroy(): void {
        this.performAction$.complete();
    }

    onRoleChanged(role, group: Group) {
        const body = new SiteMembershipBodyUpdate({ role });
        this.sitesService.updateSiteGroupMembership(this.siteId, group.id, body).subscribe(() => {
            this.notificationService.showInfo('NOTIFICATIONS.GROUP_ROLE_UPDATED');
            this.loadSiteGroups();
        });
    }

    onGroupRemoved(event: MouseEvent, groupId: string) {
        event.stopPropagation();
        this.bulkDeleteGroup([groupId]);
    }

    setSelectedRows(event: Event) {
        if ((<CustomEvent> event).detail) {
            this.selectedRows = (<CustomEvent> event).detail.selection.map((row) => row['obj']['entry']);
        }
    }

    bulkDelete() {
        const ids = this.selectedRows.map((group) => group.id);
        this.bulkDeleteGroup(ids);
    }

    onShowRowContextMenu(event) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: {
                    title: 'Delete',
                    icon: 'delete',
                    visible: true,
                },
                subject: this.performAction$,
            },
        ];
    }

    loadSiteGroups({ skipCount = 0, maxItems = 25 } = this.pagination) {
        this.pagination = { skipCount, maxItems };
        this.loading = true;
        this.sitesService
            .listSiteGroups(this.siteId, { skipCount, maxItems })
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((groups: SiteGroupPaging) => {
                this.groups = groups;
            });
    }

    private bulkDeleteGroup(groupsIds: string[]) {
        this.dialogService
            .openConfirmDialog()
            .pipe(
                filter(Boolean),
                switchMap(() => {
                    const requests = groupsIds.map((groupId) => this.sitesService.deleteSiteGroupMembership(this.siteId, groupId).pipe(catchError(() => of(false))));
                    return forkJoin([...requests]);
                })
            )
            .subscribe((results) => {
                const total = results.length;
                const skipped = results.filter((result) => result === false).length;
                const success = total - skipped;
                if (total === skipped) {
                    this.notificationService.showError('NOTIFICATIONS.GROUP_REMOVE_FAILED');
                } else if (total === success) {
                    this.notificationService.showInfo('NOTIFICATIONS.GROUP_REMOVE_SUCCESS');
                    this.loadSiteGroups();
                } else {
                    this.notificationService.showInfo('NOTIFICATIONS.GROUP_REMOVE_PARTIAL_SUCCESS', null, { count: success, skipped });
                    this.loadSiteGroups();
                }
            });
    }

    refresh() {
        this.loadSiteGroups();
    }
}
