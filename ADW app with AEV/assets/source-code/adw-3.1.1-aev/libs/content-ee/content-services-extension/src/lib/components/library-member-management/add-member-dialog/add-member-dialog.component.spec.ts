/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMemberDialogComponent } from './add-member-dialog.component';
import { MemberListComponent } from '../member-list/member-list.component';
import { CoreModule, NotificationService, setupTestBed, SitesService, TranslateLoaderService, TranslationService } from '@alfresco/adf-core';
import { AddPermissionPanelComponent, PermissionManagerModule, SearchComponent } from '@alfresco/adf-content-services';
import { MaterialModule } from '../../../material.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import { SearchMembersComponent } from './search-members/search-members.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LibraryMemberService } from '../services/library-member.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiteMember, SiteMemberEntry } from '@alfresco/js-api';
import { of, throwError } from 'rxjs';
import { AppStore } from '@alfresco-dbp/content-ce/shared/store';
import { NotificationsReloadAction } from '../../../store/extension.actions';
import { DataTableExtensionComponent } from '../../shared/data-table-extension/data-table-extension.component';
import { SiteMemberships } from './site-member-collection';
import { mockEmptySiteGroups, mockEmptySiteMember, mockSiteMemberOne, mockSiteMemberThree, mockSiteMemberTwo } from '../../../mock/manage-member.mock';

describe('AddMemberDialogComponent', () => {
    let component: AddMemberDialogComponent;
    let fixture: ComponentFixture<AddMemberDialogComponent>;
    let libraryMemberService: LibraryMemberService;
    let sitesService: SitesService;
    let notificationService: NotificationService;
    let store: Store<AppStore>;
    let dialogRef: MatDialogRef<any>;
    const matDialogData = {
        site: {
            entry: {
                id: 'siteId',
            },
        },
        members: [
            {
                id: 'userId',
            },
        ],
    };
    const storeMock = {
        dispatch: jasmine.createSpy('dispatch'),
    };
    const memberExistsError = { message: '{ "error": { "statusCode": 409 } }' };
    const genericError = { message: '{ "error": { "statusCode": 400 } }' };
    const permissionDeniedResponse = { message: '{ "error": { "statusCode": 403 } }' };

    setupTestBed({
        imports: [
            NoopAnimationsModule,
            HttpClientModule,
            MaterialModule,
            ReactiveFormsModule,
            MatSnackBarModule,
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateLoaderService,
                },
            }),
            CoreModule.forChild(),
            PermissionManagerModule,
        ],
        declarations: [
            AddMemberDialogComponent,
            MemberListComponent,
            RoleSelectorComponent,
            SearchMembersComponent,
            AddPermissionPanelComponent,
            SearchComponent,
            DataTableExtensionComponent,
        ],
        providers: [
            { provide: Store, useValue: storeMock },
            {
                provide: MatDialogRef,
                useValue: {
                    close: jasmine.createSpy('close'),
                },
            },
            TranslationService,
            { provide: TranslateLoader, useClass: TranslateLoaderService },
            { provide: MAT_DIALOG_DATA, useValue: matDialogData },
        ],
    });

    beforeEach(() => {
        libraryMemberService = TestBed.inject(LibraryMemberService);
        sitesService = TestBed.inject(SitesService);
        notificationService = TestBed.inject(NotificationService);
        store = TestBed.inject(Store);
        dialogRef = TestBed.inject(MatDialogRef);
        fixture = TestBed.createComponent(AddMemberDialogComponent);
        component = fixture.componentInstance;

        spyOn(notificationService, 'showInfo');
        spyOn(notificationService, 'showError');
        spyOn(notificationService, 'showWarning');
        spyOn(libraryMemberService, 'loadMembers');
        spyOn(sitesService, 'getSiteMembers').and.returnValue(of(mockEmptySiteMember));
        spyOn(sitesService, 'listSiteGroups').and.returnValue(of(mockEmptySiteGroups));
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('add users', () => {
        it('should populate members list with provide data on init', () => {
            const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(1);
        });

        it('should add selected member to members list', () => {
            component.onMembersSelected({
                users: [mockSiteMemberOne],
                groups: [],
            });

            fixture.detectChanges();

            const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(2);
        });

        it('should remove user from list', () => {
            const members = {
                users: [mockSiteMemberOne],
                groups: [],
            };

            let list;

            component.onMembersSelected(members);
            fixture.detectChanges();

            list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(2);

            component.onMemberRemoved(members.users[0].entry.id);
            fixture.detectChanges();

            list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(1);
        });
    });

    describe('adding duplicated users', () => {
        it('should only add once selected member to members list', () => {
            let list = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adw-new-library-members"] .adw-member-column');
            expect(list.length).toBe(1);

            component.onMembersSelected({
                users: [mockSiteMemberOne],
                groups: [],
            });
            fixture.detectChanges();

            list = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adw-new-library-members"] .adw-member-column');
            expect(list.length).toBe(2);

            component.onMembersSelected({
                users: [mockSiteMemberOne, mockSiteMemberTwo],
                groups: [],
            });
            fixture.detectChanges();

            list = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adw-new-library-members"] .adw-member-column');
            expect(list.length).toBe(3);
        });

        it('should not add selected member if member already part of library', () => {
            component.libraryMembers.addMember(mockSiteMemberThree);
            expect(component.membersToBeAdded.getAll().length).toEqual(1);

            component.onMembersSelected({
                users: [
                    {
                        entry: {
                            id: 'hrUser',
                        },
                    } as SiteMemberships,
                ],
                groups: [],
            });
            fixture.detectChanges();

            const membersList = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adw-new-library-members"] .adw-member-column');
            expect(membersList.length).toBe(2);
            expect(component.membersToBeAdded.getAll().length).toBe(2);
            const existingMember = component.membersToBeAdded.getAll().filter((member) => member.readonly)[0];
            expect(existingMember.entry.id).toEqual('hrUser');
        });
    });

    describe('onMemberRejected()', () => {
        const genericErrorResponse = { message: '{ "error": { "statusCode": 400 } }' };

        it('should reject member request', async () => {
            spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValue(of({}));
            component.onMemberRejected(matDialogData.members[0].id);
            fixture.detectChanges();
            await fixture.whenStable();

            const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(0);
            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.MEMBERSHIP_REJECTED');
        });

        it('should raise generic message on error', () => {
            spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValue(throwError(genericErrorResponse));
            component.onMemberRejected(matDialogData.members[0].id);
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('ERRORS.GENERIC');
        });

        it('should raise permission message on error', () => {
            spyOn(sitesService, 'rejectSiteMembershipRequest').and.returnValue(throwError(permissionDeniedResponse));
            component.onMemberRejected(matDialogData.members[0].id);
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('ERRORS.PERMISSION_DENIED');
        });
    });

    describe('onAdd()', () => {
        const member = { type: 'user', entry: { id: 'addedMemberId', person: { id: '123' } } } as SiteMemberships;
        const request = { type: 'request', entry: { id: 'requestUserId', person: { id: 'requestUserId' } } } as SiteMemberships;

        beforeEach(() => {
            component.membersToBeAdded['members'] = [];
        });

        it('should add selected users as members of the site', async () => {
            spyOn(sitesService, 'createSiteMembership').and.returnValue(of({ entry: { id: 'id' } } as SiteMemberEntry));
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(of({ entry: { id: 'id' } } as any));
            component.membersToBeAdded.addMember([member]);

            component.onAdd();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(libraryMemberService.loadMembers).toHaveBeenCalled();
            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.ADD_USERS_SUCCESS', 'NOTIFICATIONS.ACTIONS.CLOSE', <any> { userCount: 1 });
        });

        it('should emit event for notifications when request is approved', async () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(of({ entry: { id: 'id' } } as any));
            component.membersToBeAdded.addMember([request]);

            component.onAdd();

            fixture.detectChanges();
            await fixture.whenStable();

            expect(store.dispatch).toHaveBeenCalledWith(new NotificationsReloadAction());
        });

        it('should close dialog if all requests are successful', async () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(of({ entry: { id: 'id' } } as any));
            component.membersToBeAdded.addMember([request]);

            component.onAdd();

            fixture.detectChanges();
            await fixture.whenStable();

            expect(dialogRef.close).toHaveBeenCalled();
        });

        it('should display only entries that failed', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValues(of({ entry: { id: 'requestUserId' } } as any), throwError(memberExistsError));
            component.membersToBeAdded.addMember([request, request]);
            fixture.detectChanges();

            let list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(2);

            component.onAdd();
            fixture.detectChanges();

            list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body .adw-member-column');
            expect(list.length).toBe(1);
        });
    });

    describe('onAdd() notifications', () => {
        const siteRequest = { type: 'request', entry: { id: 'requestUserId', person: { id: 'requestUserId' } } as SiteMember } as SiteMemberships;
        beforeEach(() => {
            component.membersToBeAdded['members'] = [];
        });

        it('should raise generic error when adding a single user fails', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(throwError(genericError));
            component.membersToBeAdded.addMember([siteRequest]);
            component.onAdd();
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('NOTIFICATIONS.ADD_MEMBER_FAILED');
        });

        it('should raise error when there are no permissions to add user', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(throwError(permissionDeniedResponse));
            component.membersToBeAdded.addMember([siteRequest]);
            component.onAdd();
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('ERRORS.PERMISSION_DENIED');
        });

        it('should raise error when user is already a member', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValue(throwError(memberExistsError));
            component.membersToBeAdded.addMember([siteRequest]);
            component.onAdd();
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('NOTIFICATIONS.MEMBER_EXISTS');
        });

        it('should raise error when multiple users fail to be added', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValues(throwError(memberExistsError), throwError(memberExistsError));
            component.membersToBeAdded.addMember([siteRequest, siteRequest]);
            component.onAdd();
            fixture.detectChanges();

            expect(notificationService.showError).toHaveBeenCalledWith('NOTIFICATIONS.ADD_MEMBERS_FAILED', null, <any> { count: 2 });
        });

        it('should notify success when multiple users are added', () => {
            spyOn(sitesService, 'approveSiteMembershipRequest').and.returnValues(of({ entry: { id: 'id1' } } as any), of({ entry: { id: 'id2' } } as any));
            component.membersToBeAdded.addMember([siteRequest, siteRequest]);
            component.onAdd();
            fixture.detectChanges();

            expect(notificationService.showInfo).toHaveBeenCalledWith('NOTIFICATIONS.ADD_USERS_SUCCESS', 'NOTIFICATIONS.ACTIONS.CLOSE', <any> { userCount: 2 });
        });
    });
});
