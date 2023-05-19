/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { NodeEntry, SiteGroupEntry, SiteMemberEntry } from '@alfresco/js-api';
import { SEARCH_QUERY_TOKEN } from '@alfresco/adf-content-services';
import { SearchQueryFactory } from './search-query.factory';

@Component({
    selector: 'adw-search-members',
    templateUrl: './search-members.component.html',
    providers: [SearchQueryFactory, { provide: SEARCH_QUERY_TOKEN, useClass: SearchQueryFactory }],
})
export class SearchMembersComponent {
    @Output()
    selectMembers: EventEmitter<any> = new EventEmitter();

    currentSelection: NodeEntry[] = [];

    constructor() {}

    onSelect(items: NodeEntry[]) {
        if (Array.isArray(items)) {
            this.currentSelection = items;
        }
    }

    onAddClicked() {
        const users = this.currentSelection
            .filter((item) => item.entry.nodeType === 'cm:person')
            .map((user) => ({
                type: 'user',
                entry: {
                    ...user.entry,
                    id: user.entry.properties['cm:userName'],
                    person: {
                        firstName: user.entry.properties['cm:firstName'],
                        lastName: user.entry.properties['cm:lastName'],
                        email: user.entry.properties['cm:email'],
                        id: user.entry.properties['cm:userName'],
                    },
                },
            }))
            .map((user) => new SiteMemberEntry(user));

        const groups = this.currentSelection
            .filter((item) => item.entry.nodeType === 'cm:authorityContainer')
            .map((user) => ({
                type: 'group',
                entry: {
                    ...user.entry,
                    id: user.entry.properties['cm:authorityName'],
                    group: {
                        displayName: user.entry.properties['cm:authorityDisplayName'],
                        id: user.entry.properties['cm:authorityName'],
                    },
                },
            }))
            .map((group) => new SiteGroupEntry(group));
        this.selectMembers.emit({ users, groups });
    }
}
