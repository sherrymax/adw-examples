/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Person, SiteEntry, SiteGroupEntry, SiteMemberEntry } from '@alfresco/js-api';
import { Subject } from 'rxjs';

export interface SiteMembershipRequestGroup {
    id: string;
    createdAt: Date;
    site: SiteEntry;
    requests: Person[];
}

export interface ActionModel {
    data: any;
    model: {
        title: string;
        icon: string;
        visible: boolean;
    };
    subject: Subject<any>;
}

export const ACS_VERSIONS = {
    7: '7.0.0',
};

export declare type SiteMemberships = SiteMemberEntry & SiteGroupEntry & {
    type: 'request' | 'user' | 'group';
    readonly: boolean;
};

export interface Members {
    users: SiteMemberships[];
    groups: SiteMemberships[];
}

export interface AddMemberDialogData {
    site: SiteEntry;
    members: Person[];
}

export interface GroupsInfoDialogData {
    memberId: string;
    siteId: string;
}
