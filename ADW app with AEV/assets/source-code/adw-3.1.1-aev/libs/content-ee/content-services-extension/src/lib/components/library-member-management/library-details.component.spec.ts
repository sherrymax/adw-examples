/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CoreModule, setupTestBed, SitesService } from '@alfresco/adf-core';
import { LibraryDetailsComponent } from './library-details.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppExtensionService, PageLayoutModule, SharedModule, SharedToolbarModule } from '@alfresco-dbp/content-ce/shared';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { ContentModule } from '@alfresco/adf-content-services';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { mockSite } from '../../mock/manage-member.mock';
import { ContentServicesTestingModule } from '../../testing/content-services-testing.module';
import { MaterialModule } from '../../material.module';
import { Location } from '@angular/common';
import { MockComponent } from 'ng-mocks';
import { UsersListComponent } from './users-list/users-list.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';

describe('LibraryDetailsComponent', () => {
    let fixture: ComponentFixture<LibraryDetailsComponent>;
    let location: Location;
    let sitesService: SitesService;

    const mockRouterParams = new Subject();

    setupTestBed({
        imports: [ContentModule, CoreModule, MaterialModule, ContentServicesTestingModule, SharedToolbarModule, PageLayoutModule, SharedModule, ExtensionsModule],
        declarations: [LibraryDetailsComponent, MockComponent(UsersListComponent), MockComponent(PendingRequestsComponent)],
        providers: [
            { provide: ActivatedRoute, useValue: { params: mockRouterParams } },
            { provide: Location, useValue: { back: () => null } },
            { provide: Store, useValue: { dispatch: () => null, select: () => of([]) } },
            AppExtensionService,
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LibraryDetailsComponent);
        sitesService = TestBed.inject(SitesService);
        location = TestBed.inject(Location);
        spyOn(location, 'back');
        fixture.detectChanges();
    });

    it('should show breadcrumb with current site', () => {
        spyOn(sitesService, 'getSite').and.returnValue(of(mockSite));
        mockRouterParams.next({ siteId: 'mock-site-id' });
        fixture.detectChanges();
        const breadcrumb = fixture.debugElement.nativeElement.querySelector('.adf-breadcrumb-container');
        const elements: any[] = Array.from(breadcrumb.children);
        expect(elements.length).toBe(2);
        expect(elements[0].innerText).toContain('LIBRARY_LIST.LIBRARIES.TITLE');
        expect(elements[1].innerText).toBe('MEMBER_MANAGER.BREADCRUMB.MANAGE_MEMBERS');
    });

    it('should show no content when site not found', () => {
        spyOn(sitesService, 'getSite').and.returnValue(throwError('Not found'));
        mockRouterParams.next({ siteId: 'mock-site-id' });
        fixture.detectChanges();
        const emptyContentTitle = fixture.debugElement.nativeElement.querySelector('.adf-empty-content__title');
        expect(emptyContentTitle.innerText).toBe('LIBRARY_LIST.EMPTY_TEMPLATE.TITLE');
        const emptyContentSubtitle = fixture.debugElement.nativeElement.querySelector('.adf-empty-content__subtitle');
        expect(emptyContentSubtitle.innerText).toBe('LIBRARY_LIST.EMPTY_TEMPLATE.SUBTITLE');
    });

    it('should redirect to all libs on close', () => {
        spyOn(sitesService, 'getSite').and.returnValue(of(mockSite));
        mockRouterParams.next({ siteId: 'mock-site-id' });
        fixture.detectChanges();
        const closeButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="close-library"]');
        closeButton.click();
        expect(location.back).toHaveBeenCalled();
    });
});
