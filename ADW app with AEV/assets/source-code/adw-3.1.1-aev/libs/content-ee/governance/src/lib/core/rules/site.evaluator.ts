/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RuleContext } from '@alfresco/adf-extensions';

const RM_ENTERPRISE_REPO = 'alfresco-rm-enterprise-repo';

export function isRMSite(context: RuleContext): boolean {
    return (
        context.repository &&
        context.repository.modules &&
        !!context.repository.modules.find((repo) => repo.id === 'org_alfresco_module_rm' || repo.id === RM_ENTERPRISE_REPO)
    );
}

export function isLibraryAction(context: RuleContext): boolean {
    const { url } = context.navigation;
    if (!url) {
        return false;
    }

    return url.includes('/libraries');
}

export function isAGSInstalled(context: RuleContext): boolean {
    return !!context?.repository?.modules?.filter(module => module.id === RM_ENTERPRISE_REPO)
                                            .find((repo) => repo.installState === 'INSTALLED');
}
