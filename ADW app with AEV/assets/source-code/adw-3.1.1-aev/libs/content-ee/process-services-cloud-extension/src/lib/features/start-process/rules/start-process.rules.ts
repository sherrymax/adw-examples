/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AcaRuleContext, isSharedFiles, isTrashcan } from '@alfresco-dbp/content-ce/shared/rules';
import { isProcessServiceCloudPluginEnabled } from '../../../rules/process-services-cloud.rules';
import { NodeEntry } from '@alfresco/js-api';

export function canShow(context: AcaRuleContext): boolean {
    return (
        isProcessServiceCloudPluginEnabled() &&
        (hasSelectedFile(context.selection.nodes) || isSharedFiles(context)) &&
        !isTrashcan(context) &&
        !hasSelectedFolder(context.selection.nodes) &&
        !hasSelectedLink(context.selection.nodes)
    );
}

export function hasSelectedFile(nodes: NodeEntry[]): boolean {
    const files = nodes.filter((node) => node.entry.isFile);
    return files.length > 0;
}

export function hasSelectedFolder(nodes: NodeEntry[]): boolean {
    const folder = nodes.filter((node) => node.entry.isFolder);
    return folder.length > 0;
}

export function hasSelectedLink(nodes: NodeEntry[]): boolean {
    const links = nodes.filter((node) => node.entry.nodeType === 'app:filelink');
    return links.length > 0;
}
