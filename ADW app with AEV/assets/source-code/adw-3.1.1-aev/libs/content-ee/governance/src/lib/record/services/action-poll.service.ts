/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { filter, take, concatMap, single, takeWhile, tap } from 'rxjs/operators';
import { ContentService, NodesApiService } from '@alfresco/adf-core';
import { NodePaging, NodeMinimalEntry } from '@alfresco/adf-content-services';
import { hasProperty } from '../../core/rules/node.evaluator';
import { NodeEntry } from '@alfresco/js-api';

@Injectable({
    providedIn: 'root',
})
export class ActionPollService {
    constructor(private nodeApiService: NodesApiService, private contentService: ContentService) {}

    checkNodeDeletedFromFolder(nodeId: string, folderId: string): Observable<NodePaging> {
        return interval(1000).pipe(
            concatMap(() => this.nodeApiService.getNodeChildren(folderId)),
            filter((nodePage: NodePaging) => nodePage.list.entries.find((node: NodeMinimalEntry) => node.entry.id === nodeId) === undefined),
            take(1)
        );
    }

    checkNodeInFolder(nodeId: string, folderId: string): Observable<NodePaging> {
        return interval(1000).pipe(
            concatMap(() => this.nodeApiService.getNodeChildren(folderId)),
            filter((nodePage: NodePaging) => !!nodePage.list.entries.find((node: NodeMinimalEntry) => node.entry.id === nodeId)),
            take(1)
        );
    }

    checkNodeWithProperty(nodeId: string, property: string, value: string, retry: number = 5): Observable<NodeEntry> {
        let isValidRetry = true;
        return interval(1000).pipe(
            concatMap(() => (isValidRetry ? this.contentService.getNode(nodeId) : of(null))),
            take(retry),
            takeWhile(() => isValidRetry),
            tap((node: NodeEntry) => (isValidRetry = !hasProperty(node, property, value))),
            single((node: NodeEntry) => hasProperty(node, property, value))
        );
    }
}
