/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pagination, Person, Site, SiteMembershipRequestWithPersonEntry, SiteMembershipRequestWithPersonPaging, SitePaging } from '@alfresco/js-api';

export const fakeLibrary = <SitePaging> {
    list: {
        pagination: {
            count: 1,
            hasMoreItems: false,
            totalItems: 1,
            skipCount: 0,
            maxItems: 20,
        },
        entries: [
            { entry: { guid: 'exampleName', id: 'exampleName', title: 'exampleName', description: 'fake-desc', visibility: 'PUBLIC', role: 'SiteCollaborator' } },
            { entry: { guid: 'blog', id: 'blog', title: 'blog', description: 'blog-desc', visibility: 'PUBLIC', role: 'SiteCollaborator' } },
        ],
    },
};

export const fakeLibraryListDatatableSchema = {
    'all-libs': {
        presets: {
            default: [
                {
                    key: 'id',
                    type: 'text',
                    title: 'ADF_TASK_LIST.PROPERTIES.NAME',
                },
            ],
        },
    },
} as any;

export const fakeLibraryJoinRequest = <SiteMembershipRequestWithPersonPaging> {
    list: {
        pagination: <Pagination> {
            count: 3,
            hasMoreItems: false,
            totalItems: 3,
            skipCount: 0,
            maxItems: 100,
        },
        entries: [
            <SiteMembershipRequestWithPersonEntry> {
                entry: {
                    createdAt: new Date(1),
                    id: 'library-1',
                    site: <Site> {
                        id: 'library-1',
                        title: 'library-1',
                    },
                    person: <Person> {
                        id: 'user1',
                    },
                },
            },
            <SiteMembershipRequestWithPersonEntry> {
                entry: {
                    createdAt: new Date(2),
                    id: 'library-1',
                    site: <Site> {
                        id: 'library-1',
                        title: 'library-1',
                    },
                    person: <Person> {
                        id: 'user2',
                    },
                },
            },
            <SiteMembershipRequestWithPersonEntry> {
                entry: {
                    createdAt: new Date(3),
                    id: 'library-2',
                    site: <Site> {
                        id: 'library-2',
                        title: 'library-2',
                    },
                    person: <Person> {
                        id: 'user3',
                    },
                },
            },
        ],
    },
};
