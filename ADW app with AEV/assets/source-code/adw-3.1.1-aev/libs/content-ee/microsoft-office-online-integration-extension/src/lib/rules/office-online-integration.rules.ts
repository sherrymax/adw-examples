/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RuleContext } from '@alfresco/adf-extensions';
import { SharedLink } from '@alfresco/js-api';

export function isWordFile(context: RuleContext): boolean {
    return context?.selection?.file?.entry?.content?.mimeTypeName === 'Microsoft Word 2007';
}

export function isPowerPointFile(context: RuleContext): boolean {
    return context?.selection?.file?.entry?.content?.mimeTypeName === 'Microsoft PowerPoint 2007';
}

export function isExcelFile(context: RuleContext): boolean {
    return context?.selection?.file?.entry?.content?.mimeTypeName === 'Microsoft Excel 2007';
}

export function isActiveMicrosoftSession(context: RuleContext): boolean {
    let nodeId = context?.selection?.file?.entry?.id;
    if (context?.selection?.file?.entry instanceof SharedLink) {
        const shared: SharedLink = context.selection.file.entry;
        nodeId = shared?.nodeId;
    }
    return (
        context?.selection?.file?.entry?.properties?.['ooi:sessionNodeId'] === nodeId &&
        context?.selection?.file?.entry?.properties?.['ooi:acsSessionOwner'] === context?.selection?.file?.entry?.properties?.['cm:lockOwner']?.id
    );
}

export function isOwnerOfMicrosoftSession(context: RuleContext): boolean {
    return context?.auth?.alfrescoApi?.alfrescoApi?.getEcmUsername() === context?.selection?.file?.entry?.properties?.['ooi:acsSessionOwner'];
}

export function isMicrosoftOnlinePluginEnabled(): boolean {
    return localStorage && localStorage.getItem('microsoftOnline') === 'true';
}
