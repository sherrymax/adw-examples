/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MemberRoleType } from '../../../models/member-role.model';

@Component({
    selector: 'adw-role-selector',
    templateUrl: './role-selector.component.html',
})
export class RoleSelectorComponent implements OnInit {
    @Input()
    value: string;

    @Input()
    disabled = false;

    @Input()
    placeholder: string;

    /** Target type for role selector. Can be set to 'user' or 'group'*/
    @Input()
    targetType = 'user';

    @Output()
    memberRoleChanged: EventEmitter<string> = new EventEmitter<string>();

    roles = [
        {
            role: MemberRoleType.SiteManager,
            label: 'ROLES.SITE_MANAGER',
        },
        {
            role: MemberRoleType.SiteContributor,
            label: 'ROLES.SITE_CONTRIBUTOR',
        },
        {
            role: MemberRoleType.SiteConsumer,
            label: 'ROLES.SITE_CONSUMER',
        },
        {
            role: MemberRoleType.SiteCollaborator,
            label: 'ROLES.SITE_COLLABORATOR',
        },
    ];

    constructor() {}

    ngOnInit() {
        if (this.placeholder === undefined) {
            this.placeholder = this.targetType === 'group' ? 'ROLE_SELECTOR.GROUP_SELECTOR' : 'ROLE_SELECTOR.USER_SELECTOR';
        }
    }

    onMemberRoleChanged(newRole: string) {
        this.value = newRole;
        this.memberRoleChanged.emit(newRole);
    }
}
