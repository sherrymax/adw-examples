/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface MemberRole {
    memberId: string;
    role: string;
}

export enum MemberRoleType {
    SiteCollaborator = 'SiteCollaborator',
    SiteConsumer = 'SiteConsumer',
    SiteContributor = 'SiteContributor',
    SiteManager = 'SiteManager',
}

export const ACS_ROLES = {
    [MemberRoleType.SiteManager]: 'Manager',
    [MemberRoleType.SiteContributor]: 'Contributor',
    [MemberRoleType.SiteConsumer]: 'Consumer',
    [MemberRoleType.SiteCollaborator]: 'Collaborator',
};
