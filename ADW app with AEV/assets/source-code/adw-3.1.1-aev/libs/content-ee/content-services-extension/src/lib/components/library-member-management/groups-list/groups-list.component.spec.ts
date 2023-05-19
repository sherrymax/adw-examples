/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsListComponent } from './groups-list.component';
import { CoreModule, NotificationService, setupTestBed, SitesService } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { ContentServicesTestingModule } from '../../../testing/content-services-testing.module';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { PendingRequestsComponent } from '../pending-requests/pending-requests.component';
import { DataTableExtensionComponent } from '../../shared/data-table-extension/data-table-extension.component';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { mockEmptyGroups, mockGroups, mockGroupsNext } from '../../../mock/manage-member.mock';
import { MatSelectHelper } from '../../../testing/mat-select.helper';
import { SiteGroupEntry } from '@alfresco/js-api';

describe('GroupsListComponent', () => {
    let fixture: ComponentFixture<GroupsListComponent>;
    let component: GroupsListComponent;
    let mockDialogStream: Subject<any>;
    let sitesService: SitesService;
    let listSiteGroupSpy: jasmine.Spy;
    let notificationService: NotificationService;

    const mockDialog = {
        open: () => ({
            afterClosed: () => (mockDialogStream = new Subject()),
        }),
    };

    setupTestBed({
        imports: [ContentModule, CoreModule, ContentServicesTestingModule],
        declarations: [GroupsListComponent, RoleSelectorComponent, PendingRequestsComponent, DataTableExtensionComponent],
        providers: [
            {
                provide: MatDialog,
                useValue: mockDialog,
            },
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupsListComponent);
        component = fixture.componentInstance;
        sitesService = TestBed.inject(SitesService);
        notificationService = TestBed.inject(NotificationService);
        listSiteGroupSpy = spyOn(sitesService, 'listSiteGroups');
        spyOn(notificationService, 'showInfo');
    });

    afterEach(() => {
        listSiteGroupSpy.calls.reset();
        fixture.destroy();
    });

    describe('show groups', () => {
        it('should show the groups', () => {
            listSiteGroupSpy.and.returnValue(of(mockGroups));
            component.siteId = 'mock-id';
            component.ngOnChanges();
            fixture.detectChanges();

            const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
            expect(title.innerText).toBe('GROUP_LIST.GROUP_COUNT ( 4 )');
            const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(4);
        });

        it('should show empty message if no groups found', () => {
            listSiteGroupSpy.and.returnValue(of(mockEmptyGroups));
            component.siteId = 'mock-id';
            component.ngOnChanges();
            fixture.detectChanges();

            const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
            expect(title.innerText).toBe('GROUP_LIST.GROUP_COUNT');
            const emptyContent = fixture.debugElement.nativeElement.querySelector('.adf-empty-content__title');
            expect(emptyContent.innerText).toBe('GROUP_LIST.NO_GROUPS');
        });

        it('should refresh the groups', () => {
            listSiteGroupSpy.and.returnValues(of(mockGroups), of(mockGroupsNext));
            component.siteId = 'mock-id';
            component.ngOnChanges();
            fixture.detectChanges();

            let title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
            expect(title.innerText).toBe('GROUP_LIST.GROUP_COUNT ( 4 )');
            let list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(4);

            const refreshButton = fixture.debugElement.nativeElement.querySelector('[id="refresh-groups"]');
            refreshButton.click();
            fixture.detectChanges();

            title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
            expect(title.innerText).toBe('GROUP_LIST.GROUP_COUNT ( 3 )');
            list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(3);
        });
    });

    describe('operation', () => {
        beforeEach(() => {
            listSiteGroupSpy.and.returnValue(of(mockGroups));
        });

        it('should update the role of a group', () => {
            spyOn(sitesService, 'updateSiteGroupMembership').and.returnValues(of({} as SiteGroupEntry));
            spyOn(component, 'onRoleChanged').and.callThrough();

            component.siteId = 'mock-lib';
            component.ngOnChanges();
            fixture.detectChanges();

            const roles = new MatSelectHelper(fixture);
            roles.triggerMenu();
            roles.selectOption(roles.getOptions()[0]);
            expect(component.onRoleChanged).toHaveBeenCalled();
            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.GROUP_ROLE_UPDATED');
        });

        it('should be able to delete group if agreed', () => {
            spyOn(component, 'onGroupRemoved').and.callThrough();
            spyOn(sitesService, 'deleteSiteGroupMembership').and.returnValue(of(null));

            component.siteId = 'mock-lib';
            component.ngOnChanges();
            fixture.detectChanges();

            const rejectButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="remove-group-GROUP_0E0V6C"]');
            expect(rejectButton.disabled).toBe(false);

            rejectButton.click();
            mockDialogStream.next(true);
            mockDialogStream.complete();
            expect(sitesService.deleteSiteGroupMembership).toHaveBeenCalledWith('mock-lib', mockGroups.list.entries[0].entry.id);
            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.GROUP_REMOVE_SUCCESS');
            expect(listSiteGroupSpy).toHaveBeenCalledTimes(2);
        });

        it('should not delete group if not agreed', () => {
            spyOn(component, 'onGroupRemoved').and.callThrough();
            spyOn(sitesService, 'deleteSiteGroupMembership').and.returnValue(of(null));

            component.siteId = 'mock-lib';
            component.ngOnChanges();
            fixture.detectChanges();

            const rejectButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="remove-group-GROUP_0E0V6C"]');
            expect(rejectButton.disabled).toBe(false);

            rejectButton.click();
            mockDialogStream.next(false);
            mockDialogStream.complete();
            expect(sitesService.deleteSiteGroupMembership).not.toHaveBeenCalled();
            expect(listSiteGroupSpy).toHaveBeenCalledTimes(1);
        });
    });
});
