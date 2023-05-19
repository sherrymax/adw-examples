/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { CoreModule, NotificationService, SitesService, VersionCompatibilityService } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { MemberListComponent } from '../member-list/member-list.component';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { LibraryMemberService } from '../services/library-member.service';
import { MemberRoleType } from '../../../models/member-role.model';
import { of, Subject, throwError } from 'rxjs';
import { DataTableExtensionComponent } from '../../shared/data-table-extension/data-table-extension.component';
import { mockListSiteMemberships } from '../../../mock/manage-member.mock';
import { ContentServicesTestingModule } from '../../../testing/content-services-testing.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectHelper } from '../../../testing/mat-select.helper';
import { SiteMemberEntry } from '@alfresco/js-api';

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;
    let libraryMemberService: LibraryMemberService;
    let sitesService: SitesService;
    let notificationService: NotificationService;
    let versionCompatibilityService: VersionCompatibilityService;
    let mockDialogStream: Subject<any>;
    const errorGeneric = { message: '{ "error": { "statusCode": 401 } }' };
    const error422 = { message: '{ "error": { "statusCode": 422 } }' };
    const mockDialog = {
        open: () => ({
            afterClosed: () => (mockDialogStream = new Subject()),
        }),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CoreModule, ContentServicesTestingModule, ContentModule],
            declarations: [UsersListComponent, MemberListComponent, RoleSelectorComponent, DataTableExtensionComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: mockDialog,
                },
            ],
        });
        fixture = TestBed.createComponent(UsersListComponent);
        component = fixture.componentInstance;
        libraryMemberService = TestBed.inject(LibraryMemberService);
        sitesService = TestBed.inject(SitesService);
        notificationService = TestBed.inject(NotificationService);
        versionCompatibilityService = TestBed.inject(VersionCompatibilityService);

        spyOn(notificationService, 'showInfo');
        spyOn(notificationService, 'showError');
        spyOn(versionCompatibilityService, 'isVersionSupported').and.returnValue(true);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should update site members on siteId change', () => {
        spyOn(libraryMemberService, 'loadMembers');
        component.siteId = 'site-id';
        component.ngOnChanges();
        fixture.detectChanges();

        expect(libraryMemberService.loadMembers).toHaveBeenCalledWith('site-id');
    });

    it('should update site members after member role change', () => {
        spyOn(libraryMemberService, 'loadMembers');
        spyOn(sitesService, 'updateSiteMembership').and.returnValue(of({ entry: {} } as SiteMemberEntry));
        component.onMemberRoleChanged({ memberId: 'userId', role: MemberRoleType.SiteConsumer });
        fixture.detectChanges();
        expect(libraryMemberService.loadMembers).toHaveBeenCalled();
    });

    it('should notify member role change', () => {
        spyOn(libraryMemberService, 'loadMembers');
        spyOn(sitesService, 'updateSiteMembership').and.returnValue(of({ entry: {} } as SiteMemberEntry));
        component.onMemberRoleChanged({ memberId: 'userId', role: MemberRoleType.SiteConsumer });
        fixture.detectChanges();
        expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.USER_ROLE_UPDATED');
    });

    it('should notify error on member role change', () => {
        spyOn(libraryMemberService, 'loadMembers');
        spyOn(sitesService, 'updateSiteMembership').and.returnValue(throwError(errorGeneric));
        component.onMemberRoleChanged({ memberId: 'userId', role: MemberRoleType.SiteConsumer });
        fixture.detectChanges();
        expect(notificationService.showError).toHaveBeenCalledWith('ERRORS.GENERIC');
    });

    it('should notify error if member is the only SiteManager on role change', () => {
        spyOn(libraryMemberService, 'loadMembers');
        spyOn(sitesService, 'updateSiteMembership').and.returnValue(throwError(error422));
        component.onMemberRoleChanged({ memberId: 'userId', role: MemberRoleType.SiteConsumer });
        fixture.detectChanges();
        expect(notificationService.showError).toHaveBeenCalledWith('NOTIFICATIONS.MANAGER_REQUIRED');
    });

    it('should show empty page if api failed', () => {
        spyOn(sitesService, 'listSiteMemberships').and.returnValue(throwError('Not found'));

        component.siteId = 'mock-lib-1';
        component.ngOnChanges();
        fixture.detectChanges();

        const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
        expect(title.innerText).toBe('MEMBER_LIST.MEMBER_COUNT ( )');
        const emptyContent = fixture.debugElement.nativeElement.querySelector('.adf-empty-content__title');
        expect(emptyContent.innerText).toBe('MEMBER_LIST.NO_MEMBERS');
    });

    it('should show the users in the table', () => {
        spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));

        component.siteId = 'mock-lib-1';
        component.ngOnChanges();
        fixture.detectChanges();

        const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
        expect(title.innerText).toBe('MEMBER_LIST.MEMBER_COUNT ( 3 )');
        const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
        expect(list.length).toBe(3);
    });

    it('should show mat-chip if user part of group', () => {
        spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));
        component.siteId = 'mock-lib-1';
        component.ngOnChanges();
        fixture.detectChanges();
        const expected = ['one user one@alfresco.com', 'two user two@alfresco.com', 'three user three@alfresco.com Group'];

        const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body adf-user-name-column');
        Array.from(list).every((element: HTMLElement, index) => expect(element.innerText.replace(/\s/g, '')).toEqual(expected[index].replace(/\s/g, '')));
    });

    it('should update the member on role change', () => {
        spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));
        spyOn(sitesService, 'updateSiteMembership').and.returnValue(of({ entry: { id: 'id' } } as SiteMemberEntry));
        spyOn(component, 'onMemberRoleChanged').and.callThrough();

        component.siteId = 'mock-lib-1';
        component.ngOnChanges();
        fixture.detectChanges();

        const roles = new MatSelectHelper(fixture);
        roles.triggerMenu();
        roles.selectOption(roles.getOptions()[0]);
        expect(component.onMemberRoleChanged).toHaveBeenCalled();
        expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.USER_ROLE_UPDATED');
    });

    describe('delete user', () => {
        it('should delete the user if agreed', () => {
            spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));
            spyOn(component, 'bulkDeleteMember').and.callThrough();
            spyOn(sitesService, 'deleteSiteMembership').and.returnValue(of(null));

            component.siteId = 'mock-lib-1';
            component.ngOnChanges();
            fixture.detectChanges();

            const deleteButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="remove-member-one"]');
            deleteButton.click();
            expect(component.bulkDeleteMember).toHaveBeenCalled();
            mockDialogStream.next(true);
            mockDialogStream.complete();

            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.USER_REMOVE_SUCCESS');
            expect(sitesService.deleteSiteMembership).toHaveBeenCalledWith('mock-lib-1', 'one');
        });

        it('should not delete the user if not agreed', () => {
            spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));
            spyOn(component, 'bulkDeleteMember').and.callThrough();
            spyOn(sitesService, 'deleteSiteMembership').and.returnValue(of(null));

            component.siteId = 'mock-lib-1';
            component.ngOnChanges();
            fixture.detectChanges();

            const deleteButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="remove-member-one"]');
            deleteButton.click();
            expect(component.bulkDeleteMember).toHaveBeenCalled();
            mockDialogStream.next(false);
            mockDialogStream.complete();

            expect(notificationService.showInfo).not.toHaveBeenCalled();
            expect(sitesService.deleteSiteMembership).not.toHaveBeenCalledWith('mock-lib-1', 'one');
        });

        it('delete button disabled for groups user', () => {
            spyOn(sitesService, 'listSiteMemberships').and.returnValue(of(mockListSiteMemberships));
            component.siteId = 'mock-lib-1';
            component.ngOnChanges();
            fixture.detectChanges();

            const deleteButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="remove-member-three"]');
            expect(deleteButton.disabled).toBe(true);
        });
    });
});
