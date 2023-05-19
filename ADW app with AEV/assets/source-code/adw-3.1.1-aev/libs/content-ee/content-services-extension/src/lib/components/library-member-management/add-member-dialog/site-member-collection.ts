/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SiteGroupEntry, SiteMemberEntry } from '@alfresco/js-api';

export declare type SiteMemberships = SiteMemberEntry & SiteGroupEntry & {
    type: 'request' | 'user' | 'group';
    readonly: boolean;
};

export interface Members {
    users: SiteMemberships[];
    groups: SiteMemberships[];
}

export class SiteMemberCollection {
    private members: SiteMemberships[] = [];

    constructor() {}

    addMember(newMember: SiteMemberships | SiteMemberships[]) {
        this.members = this.members.concat(newMember);
    }

    getAll(): Array<SiteMemberships> {
        return this.members;
    }

    isDuplicateMember(newMember: SiteMemberships): SiteMemberships | undefined {
        return this.members.find((member) => member.entry.id === newMember.entry.id);
    }

    removeMember(memberId: string) {
        const member = this.members.findIndex((user) => user.entry.id === memberId);

        if (member !== -1) {
            this.members.splice(member, 1);
            this.members = [...this.members];
        }
    }

    updateAllRole(role: string) {
        this.members.filter((member) => !member.readonly).forEach((member) => (member.entry.role = role));
    }

    updateRole(id, role: string) {
        const user = this.members.find((member) => member.entry.id === id);
        if (user) {
            user.entry.role = role;
        }
    }

    isValid() {
        return this.members.filter((member) => !member.readonly).length && this.members.every((group) => group.entry.role);
    }
}
