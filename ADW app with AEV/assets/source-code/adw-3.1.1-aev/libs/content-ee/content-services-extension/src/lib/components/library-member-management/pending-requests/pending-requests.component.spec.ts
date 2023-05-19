/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreModule, NotificationService, setupTestBed, SitesService } from '@alfresco/adf-core';
import { MaterialModule } from '../../../material.module';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { PendingRequestsComponent } from './pending-requests.component';
import { DataTableExtensionComponent } from '../../shared/data-table-extension/data-table-extension.component';
import { ContentModule } from '@alfresco/adf-content-services';
import { of, Subject } from 'rxjs';
import { mockEmptyPendingRequest, mockPendingRequest } from '../../../mock/pending-request.mock';
import { ContentServicesTestingModule } from '../../../testing/content-services-testing.module';
import { MatSelectHelper } from '../../../testing/mat-select.helper';
import { MatDialog } from '@angular/material/dialog';
import { LibraryMemberService } from '../services/library-member.service';

describe('PendingRequestsComponent', () => {
    let fixture: ComponentFixture<PendingRequestsComponent>;
    let component: PendingRequestsComponent;
    let sitesService: SitesService;
    let notificationService: NotificationService;
    let libraryMemberService: LibraryMemberService;
    let getSiteMembershipRequestSpy: jasmine.Spy;
    let mockDialogStream: Subject<any>;

    const mockDialog = {
        open: () => ({
            afterClosed: () => (mockDialogStream = new Subject()),
        }),
    };

    setupTestBed({
        imports: [ContentModule, CoreModule, MaterialModule, ContentServicesTestingModule],
        declarations: [RoleSelectorComponent, PendingRequestsComponent, DataTableExtensionComponent],
        providers: [
            {
                provide: MatDialog,
                useValue: mockDialog,
            },
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PendingRequestsComponent);
        component = fixture.componentInstance;
        sitesService = TestBed.inject(SitesService);
        notificationService = TestBed.inject(NotificationService);
        libraryMemberService = TestBed.inject(LibraryMemberService);
        getSiteMembershipRequestSpy = spyOn(sitesService, 'getSiteMembershipRequests');
        spyOn(notificationService, 'showInfo');
        spyOn(libraryMemberService, 'loadMembers');
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should list the pending request', () => {
        getSiteMembershipRequestSpy.and.returnValue(of(mockPendingRequest));
        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();

        const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
        expect(title.innerText).toBe('MEMBERSHIP_REQUESTS.PENDING_REQUESTS (3)');
        const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
        expect(list.length).toBe(3);
    });

    it('should list empty page if no request found', () => {
        getSiteMembershipRequestSpy.and.returnValue(of(mockEmptyPendingRequest));
        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();

        const title = fixture.debugElement.nativeElement.querySelector('adf-toolbar-title');
        expect(title.innerText).toBe('MEMBERSHIP_REQUESTS.PENDING_REQUESTS (0)');
        const emptyContent = fixture.debugElement.nativeElement.querySelector('.adf-empty-content__title');
        expect(emptyContent.innerText).toBe('MEMBERSHIP_REQUESTS.NO_MEMBERSHIPS');
    });

    it('should approve the request', () => {
        spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(of({}));
        getSiteMembershipRequestSpy.and.returnValues(of(mockPendingRequest));

        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();
        let approve: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="approve-request-one@alfresco.com"]');
        expect(approve.disabled).toBe(true);

        const roles = new MatSelectHelper(fixture);
        roles.triggerMenu();
        roles.selectOption(roles.getOptions()[0]);

        approve = fixture.debugElement.nativeElement.querySelector('[data-automation-id="approve-request-one@alfresco.com"]');
        expect(approve.disabled).toBe(false);

        approve.click();
        expect(sitesService.approveSiteMembershipRequest).toHaveBeenCalledWith('mock-lib-2', mockPendingRequest.list.entries[0].entry.person.id, {
            siteMembershipApprovalBody: { role: 'SiteManager' },
        } as any);
        expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.MEMBERSHIP_ACCEPTED');
        expect(getSiteMembershipRequestSpy).toHaveBeenCalledTimes(2);
    });

    it('should cancel the request', () => {
        spyOn(component, 'rejectMembershipRequest').and.callThrough();
        spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValue(of({}));

        getSiteMembershipRequestSpy.and.returnValue(of(mockPendingRequest));
        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();

        const rejectButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="reject-request-one@alfresco.com"]');
        expect(rejectButton.disabled).toBe(false);

        rejectButton.click();
        mockDialogStream.next({ comment: '' });
        mockDialogStream.complete();
        expect(component.rejectMembershipRequest).toHaveBeenCalledTimes(1);
        expect(sitesService.rejectSiteMembershipRequest).toHaveBeenCalledWith('mock-lib-2', mockPendingRequest.list.entries[0].entry.person.id, {
            siteMembershipRejectionBody: { comment: '' },
        } as any);
        expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.MEMBERSHIP_REJECTED');
        expect(getSiteMembershipRequestSpy).toHaveBeenCalledTimes(2);
    });

    it('should not cancel the request if pressed no', () => {
        spyOn(component, 'rejectMembershipRequest').and.callThrough();
        spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValues(of(null));

        getSiteMembershipRequestSpy.and.returnValue(of(mockPendingRequest));
        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();

        const rejectButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="reject-request-one@alfresco.com"]');
        expect(rejectButton.disabled).toBe(false);

        rejectButton.click();
        mockDialogStream.next(false);
        mockDialogStream.complete();
        expect(component.rejectMembershipRequest).toHaveBeenCalledTimes(1);
        expect(sitesService.rejectSiteMembershipRequest).not.toHaveBeenCalled();
        expect(notificationService.showInfo).not.toHaveBeenCalled();
    });

    it('should emit pending request count when retrieving pending requests', (done) => {
        spyOn(component, 'rejectMembershipRequest').and.callThrough();
        spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValues(of(null));

        component.pendingRequestsCounter.subscribe((pendingRequestsCounter) => {
            expect(pendingRequestsCounter).toBe(3);
            done();
        });

        getSiteMembershipRequestSpy.and.returnValue(of(mockPendingRequest));
        component.siteId = 'mock-lib-2';
        component.ngOnChanges();
        fixture.detectChanges();
    });
});
