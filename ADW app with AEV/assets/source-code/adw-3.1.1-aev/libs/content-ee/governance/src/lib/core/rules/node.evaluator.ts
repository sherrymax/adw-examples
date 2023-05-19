/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NodeEntry } from '@alfresco/js-api';

export function isNodeHavingProp(node: NodeEntry, prop: string | number, value: string, propType: 'string' | 'number' | 'array'): boolean {
    // eslint-disable-next-line no-prototype-builtins
    if (node && node.entry && node.entry.hasOwnProperty(prop) && node.entry[prop]) {
        switch (propType) {
        case 'array':
            if (node.entry[prop].includes(value)) {
                return true;
            }
            break;
        case 'number':
        case 'string':
            if (node.entry[prop] === value) {
                return true;
            }
            break;
        default:
            break;
        }
        return false;
    }
    return false;
}

export function isLocked(nodeEntry: NodeEntry): boolean {
    const { entry: node } = nodeEntry;
    return (node && node.isLocked) || (node.properties && (node.properties['cm:lockType'] === 'READ_ONLY_LOCK' || node.properties['cm:lockType'] === 'WRITE_LOCK'));
}

export function hasProperty(node: NodeEntry, property: string, value: any) {
    return node && node.entry && node.entry.properties && node.entry.properties[property] && node.entry.properties[property] === value;
}

export function isFile(node: NodeEntry): boolean {
    return node.entry && node.entry.isFile;
}

export function isFolder(node: NodeEntry): boolean {
    return node.entry && node.entry.isFolder;
}
