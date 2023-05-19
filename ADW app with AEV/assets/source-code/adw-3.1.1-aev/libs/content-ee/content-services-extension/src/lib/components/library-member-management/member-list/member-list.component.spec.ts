/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberListComponent } from './member-list.component';
import { CoreModule, setupTestBed, TranslateLoaderService } from '@alfresco/adf-core';
import { MaterialModule } from '../../../material.module';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MemberRoleType } from '../../../models/member-role.model';
import { SiteMember, SiteMemberPaging } from '@alfresco/js-api';
import { MatCardModule } from '@angular/material/card';
import { DataTableExtensionComponent } from '../../shared';
import { SiteMemberships } from '../../../models/types';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PermissionManagerModule } from '@alfresco/adf-content-services';
import { LibraryMemberService } from '../services/library-member.service';

describe('MemberListComponent', () => {
    let component: MemberListComponent;
    let fixture: ComponentFixture<MemberListComponent>;
    let libraryMemberService: LibraryMemberService;
    const member = { id: 'memberId' } as SiteMember;
    const mouseEvent = new MouseEvent('click');
    let dialog: MatDialog;

    setupTestBed({
        imports: [
            MaterialModule,
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateLoaderService,
                },
            }),
            CoreModule.forChild(),
            MatCardModule,
            MatDialogModule,
            PermissionManagerModule,
        ],
        declarations: [MemberListComponent, RoleSelectorComponent, DataTableExtensionComponent],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MemberListComponent);
        dialog = TestBed.inject(MatDialog);
        component = fixture.componentInstance;
        libraryMemberService = TestBed.inject(LibraryMemberService);
    });

    it('should emit event on onMemberRoleChanged()', () => {
        spyOn(component.memberRoleChanged, 'emit');

        component.onMemberRoleChanged(MemberRoleType.SiteContributor, member);
        expect(component.memberRoleChanged.emit).toHaveBeenCalledWith({
            memberId: member.id,
            role: MemberRoleType.SiteContributor,
        });
    });

    it('should emit event on removeMember()', () => {
        spyOn(component.memberRemoved, 'emit');

        component.removeMember(mouseEvent, member.id);
        expect(component.memberRemoved.emit).toHaveBeenCalledWith(member.id);
    });

    it('should emit event on rejectMember()', () => {
        spyOn(component.memberRejected, 'emit');

        component.rejectMember(mouseEvent, member.id);
        expect(component.memberRejected.emit).toHaveBeenCalledWith(member.id);
    });

    it('should return false if not a member request', () => {
        const membership = {
            entry: {
                id: 'userId',
            },
        } as SiteMemberships;

        expect(component.isMemberRequest(membership)).toBe(false);
    });

    it('should return true if it is a member request', () => {
        const membership = {
            type: 'request',
            entry: {
                id: 'userId',
            },
        } as SiteMemberships;

        expect(component.isMemberRequest(membership)).toBe(true);
    });

    it('should dispatch open group dialog event when clicking on group chip', async () => {
        spyOn(dialog, 'open');
        component.members = {
            list: {
                entries: [
                    {
                        entry: {
                            id: 'group1',
                            person: {},
                            role: 'SiteConsumer',
                            isMemberOfGroup: true,
                        },
                    },
                ],
                pagination: {},
            },
        } as SiteMemberPaging;
        fixture.detectChanges();
        await fixture.whenStable();

        const groupChip = fixture.debugElement.nativeElement.querySelector('mat-chip');
        groupChip.click();
        fixture.detectChanges();
        expect(groupChip).toBeDefined();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should display group role inside group chip', async () => {
        component.members = {
            list: {
                entries: [
                    {
                        entry: {
                            id: 'group1',
                            person: {},
                            role: 'SiteConsumer',
                            isMemberOfGroup: true,
                        },
                    },
                ],
                pagination: {},
            },
        } as SiteMemberPaging;
        fixture.detectChanges();
        await fixture.whenStable();

        const groupChip = fixture.debugElement.nativeElement.querySelector('mat-chip span[data-automation-id="group-role"]');
        fixture.detectChanges();
        expect(groupChip).toBeDefined();
        expect(groupChip.innerText).toBe('Consumer');
    });

    it('should reload members with current pagination details on refresh button clicked', () => {
        const loadMembersSpy = spyOn(libraryMemberService, 'loadMembers');
        const currentPaginationDetails =  { maxItems: 35, skipCount: 25 };

        component.siteId = 'mock-site-id';
        component.showActions = true;
        component.updatePagination(currentPaginationDetails);
        fixture.detectChanges();
        const refreshButton = fixture.nativeElement.querySelector('#refresh-members');
        refreshButton.click();

        expect(loadMembersSpy).toHaveBeenCalledWith('mock-site-id', currentPaginationDetails);
    });
});
