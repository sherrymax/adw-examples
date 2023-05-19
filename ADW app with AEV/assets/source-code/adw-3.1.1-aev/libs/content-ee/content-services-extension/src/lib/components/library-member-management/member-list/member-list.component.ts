/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { SiteMember, SiteMemberEntry, SiteMemberPaging } from '@alfresco/js-api';
import { EcmUserService, PaginatedComponent, PaginationModel, RequestPaginationModel, ShowHeaderMode } from '@alfresco/adf-core';
import { LibraryMemberService } from '../services/library-member.service';
import { ACS_ROLES, MemberRole } from '../../../models/member-role.model';
import { SiteMemberships, GroupsInfoDialogData } from '../../../models/types';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GroupsInfoDialogComponent } from '../groups-info-dialog/groups-info-dialog.component';

@Component({
    selector: 'adw-member-list',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MemberListComponent implements PaginatedComponent, OnDestroy {
    @Input()
    members: SiteMemberPaging;

    @Input()
    collapsedView = false;

    @Input()
    loading = false;

    @Input()
    selectionMode: 'multiple' | 'none' = 'multiple';

    @Input()
    siteId: string = null;

    @Input()
    showTotal = true;

    @Input()
    multiSelect = false;

    @Input()
    infinitePagination = false;

    @Input()
    showActions = false;

    @Output()
    memberRemoved: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    memberRoleChanged: EventEmitter<MemberRole> = new EventEmitter<MemberRole>();

    @Output()
    memberRejected: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    showRowContextMenu = new EventEmitter();

    @Output()
    bulkDelete = new EventEmitter();

    pagination: BehaviorSubject<PaginationModel>;
    selectedRows: SiteMemberEntry[] = [];
    updatedPagination: PaginationModel;
    showHeader: ShowHeaderMode = ShowHeaderMode.Never;

    constructor(private libraryMemberService: LibraryMemberService, private ecmUserService: EcmUserService, public dialog: MatDialog) {
        this.pagination = this.libraryMemberService.pagination;
    }

    onMemberRoleChanged(newRole: string, member: SiteMember) {
        this.memberRoleChanged.emit(<MemberRole> {
            memberId: member.id,
            role: newRole,
        });
    }

    removeMember(event: MouseEvent | KeyboardEvent, memberId: string) {
        event.stopPropagation();
        this.memberRemoved.emit(memberId);
    }

    rejectMember(event: MouseEvent | KeyboardEvent, memberId: string) {
        event.stopPropagation();
        this.memberRejected.emit(memberId);
    }

    isMemberRequest(member: SiteMemberships | undefined): boolean {
        return member && member.type === 'request';
    }

    setSelectedRows(event: Event) {
        if ((event as CustomEvent).detail) {
            this.selectedRows = (event as CustomEvent).detail.selection.map((row) => row['obj']).filter((member: SiteMemberEntry) => !member.entry?.isMemberOfGroup);
        }
    }

    getEcmAvatar(avatarId) {
        return this.ecmUserService.getUserProfileImage(avatarId);
    }

    updatePagination(requestPaginationModel: RequestPaginationModel): void {
        this.updatedPagination = requestPaginationModel;
        if (this.infinitePagination) {
            this.libraryMemberService.loadMembers(this.siteId, requestPaginationModel, false);
        } else {
            this.libraryMemberService.loadMembers(this.siteId, requestPaginationModel);
        }
    }

    reloadMembers() {
        this.libraryMemberService.loadMembers(this.siteId, this.updatedPagination);
    }

    openGroupsInfoDialog(member: SiteMember) {
        this.dialog.open(GroupsInfoDialogComponent, {
            width: '600px',
            data: { memberId: member.id, siteId: this.siteId } as GroupsInfoDialogData,
        });
    }

    ngOnDestroy(): void {
        this.pagination = null;
    }

    roleLabel(groupRole: string): string {
        return ACS_ROLES[groupRole] || groupRole;
    }
}
