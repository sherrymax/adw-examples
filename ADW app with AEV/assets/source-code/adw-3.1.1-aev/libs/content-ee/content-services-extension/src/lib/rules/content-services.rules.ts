/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RuleContext } from '@alfresco/adf-extensions';

export function isContentServicePluginEnabled(): boolean {
    return localStorage && localStorage.getItem('contentServices') === 'true';
}

export function isMemberManagement(context: RuleContext): boolean {
    const { url } = context.navigation;
    return url && url.endsWith('/members/libraries');
}
