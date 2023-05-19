/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchMembersComponent } from './search-members.component';
import { setupTestBed, TranslateLoaderService, TranslationService } from '@alfresco/adf-core';
import { AddPermissionPanelComponent, PermissionManagerModule, SearchComponent } from '@alfresco/adf-content-services';
import { MaterialModule } from '../../../../material.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiteGroupEntry, SiteMemberEntry } from '@alfresco/js-api';
import { mockSearchGroup, mockSearchUser } from '../../../../mock/manage-member.mock';

describe('SearchMembersComponent', () => {
    let component: SearchMembersComponent;
    let fixture: ComponentFixture<SearchMembersComponent>;
    setupTestBed({
        imports: [NoopAnimationsModule, HttpClientModule, ReactiveFormsModule, MaterialModule, TranslateModule.forRoot(), PermissionManagerModule],
        declarations: [SearchMembersComponent, AddPermissionPanelComponent, SearchComponent],
        providers: [TranslationService, { provide: TranslateLoader, useClass: TranslateLoaderService }],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchMembersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should emit event with current selection onCloseClicked()', () => {
        spyOn(component.selectMembers, 'emit');
        component.currentSelection = [mockSearchUser, mockSearchGroup];
        component.onAddClicked();
        const mockUser = {
            id: 'id',
            firstName: 'mock first name',
            lastName: 'mock last name',
            email: 'mock@email.com',
        };
        const mockGroup = {
            id: 'mock id',
            displayName: 'mock authority',
        };
        expect(component.selectMembers.emit).toHaveBeenCalledWith({
            users: [
                new SiteMemberEntry({
                    type: 'user',
                    entry: {
                        ...mockSearchUser.entry,
                        person: mockUser,
                    },
                }),
            ],
            groups: [
                new SiteGroupEntry({
                    type: 'group',
                    entry: {
                        ...mockSearchGroup.entry,
                        group: mockGroup,
                    },
                }),
            ],
        });
    });

    it('should set current selection', () => {
        const selection = [mockSearchUser];
        component.onSelect(selection);
        expect(component.currentSelection).toEqual(selection);
    });
});
