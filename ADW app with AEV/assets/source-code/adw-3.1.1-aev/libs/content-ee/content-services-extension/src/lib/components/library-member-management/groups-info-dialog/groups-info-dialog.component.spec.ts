/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreModule, setupTestBed, SitesService } from '@alfresco/adf-core';
import { ContentModule, GroupService } from '@alfresco/adf-content-services';
import { ContentServicesTestingModule } from '../../../testing/content-services-testing.module';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { GroupsInfoDialogComponent } from './groups-info-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { of } from 'rxjs';
import { groupEntriesMock, longGroupEntriesMock, siteGroupsMock } from './../../../mock/group-dialog.mock';

describe('GroupsInfoDialogComponent', () => {
    let fixture: ComponentFixture<GroupsInfoDialogComponent>;
    let sitesService: SitesService;
    let groupService: GroupService;
    let groupMembershipSpy: jasmine.Spy;
    let listSiteGroupsSpy: jasmine.Spy;

    setupTestBed({
        imports: [ContentModule, CoreModule, ContentServicesTestingModule, MaterialModule],
        declarations: [GroupsInfoDialogComponent, RoleSelectorComponent],
        providers: [
            {
                provide: MatDialogRef,
                useValue: {
                    close: jasmine.createSpy('close'),
                    open: jasmine.createSpy('open'),
                },
            },
            {
                provide: MAT_DIALOG_DATA,
                useValue: {
                    siteId: 'siteId',
                    memberId: 'memberId',
                },
            },
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupsInfoDialogComponent);
        sitesService = TestBed.inject(SitesService);
        groupService = TestBed.inject(GroupService);
        groupMembershipSpy = spyOn(groupService, 'listAllGroupMembershipsForPerson');
        listSiteGroupsSpy = spyOn(sitesService, 'listSiteGroups');
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should render the groups with roles after filtering them', async () => {
        groupMembershipSpy.and.returnValue(longGroupEntriesMock);
        listSiteGroupsSpy.and.returnValue(of(siteGroupsMock));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const groupList = fixture.debugElement.nativeElement.querySelectorAll('.adw-group-info-table-row .adw-group-info-table-group-cell');
        expect(groupList[0]).toBeDefined();
        expect(groupList.length).toBe(2);
        expect(groupList[0].innerText).toBe('Group 1');

        expect(groupMembershipSpy).toHaveBeenCalled();
        expect(listSiteGroupsSpy).toHaveBeenCalled();
    });

    it('should render loading spinner when it is loading', async () => {
        groupMembershipSpy.and.returnValue(groupEntriesMock);
        fixture.detectChanges();
        await fixture.whenStable();

        const loadingSpinner = fixture.debugElement.nativeElement.querySelector('.mat-progress-spinner');
        expect(loadingSpinner).toBeDefined();
    });
});
