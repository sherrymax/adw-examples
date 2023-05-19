/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { InfoDrawerMemberListComponent } from './info-drawer-member-list/info-drawer-member-list.component';
import { LibraryDetailsComponent } from './library-details.component';
import { MemberListComponent } from './member-list/member-list.component';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { SearchMembersComponent } from './add-member-dialog/search-members/search-members.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';
import { UsersListComponent } from './users-list/users-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { RoleSelectorComponent } from './role-selector/role-selector.component';
import { RejectMemberDialogComponent } from './pending-requests/reject-member-dialog/reject-member-dialog.component';
import { GroupsInfoDialogComponent } from './groups-info-dialog/groups-info-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { PageLayoutModule, SharedModule, SharedToolbarModule } from '@alfresco/aca-shared';
import { CoreModule } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { ExtensionSharedModule } from '../shared';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        ExtensionsModule,
        SharedModule.forRoot(),
        CoreModule,
        ContentModule,
        PageLayoutModule,
        FlexLayoutModule,
        TranslateModule,
        ExtensionSharedModule,
        SharedToolbarModule,
    ],
    declarations: [
        InfoDrawerMemberListComponent,
        LibraryDetailsComponent,
        MemberListComponent,
        AddMemberDialogComponent,
        SearchMembersComponent,
        PendingRequestsComponent,
        UsersListComponent,
        GroupsListComponent,
        RoleSelectorComponent,
        RejectMemberDialogComponent,
        GroupsInfoDialogComponent,
    ],
})
export class LibraryMemberManagementModule {}
