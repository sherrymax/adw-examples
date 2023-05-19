/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { RecordService } from '../../record/services/record.service';
import { ActionExecResultEntry, Node, NodeEntry } from '@alfresco/js-api';
import { Observable, of, throwError } from 'rxjs';
import { ContentService, LogService, StorageService } from '@alfresco/adf-core';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { ActionPollService } from '../../record/services/action-poll.service';
import { isPendingRestore } from '../rules/glacier-evaluator';

@Injectable({
    providedIn: 'root',
})
export class GlacierService {
    constructor(
        private recordService: RecordService,
        private logService: LogService,
        private contentService: ContentService,
        private actionPollService: ActionPollService,
        private storageService: StorageService
    ) {}

    storeRecord(targetNode: Node): Observable<any> {
        const storeActionBody = {
            actionDefinitionId: 'archive',
            targetId: targetNode.id,
        };
        return this.recordService.executeAction(storeActionBody).pipe(catchError((error) => this.handleError(error)));
    }

    restoreRecord(node: Node, type: string, days: string | number): Observable<boolean> {
        return this.recordService.executeAction(this.getRestoreActionsBody(node.id, days, type)).pipe(
            tap(() => this.updateCache(node.id, days, type)),
            switchMap(() => this.contentService.getNodeContent(node.id)),
            switchMap(() => this.contentService.getNode(node.id)),
            concatMap((nodeEntry: NodeEntry) =>
                isPendingRestore(nodeEntry) ? of(nodeEntry) : this.actionPollService.checkNodeWithProperty(nodeEntry.entry.id, 'gl:contentState', 'PENDING_RESTORE')
            ),
            map(isPendingRestore),
            catchError((error) => this.handleError(error))
        );
    }

    extendRestore(node: Node, type: string, days: string | number): Observable<ActionExecResultEntry> {
        return this.recordService.executeAction(this.getRestoreActionsBody(node.id, days, type)).pipe(
            tap(() => this.updateCache(node.id, days, type)),
            catchError((error) => this.handleError(error))
        );
    }

    public getRestoreCache(id: string): any {
        return JSON.parse(this.storageService.getItem(`${id}__restore_info`));
    }

    public updateCache(id: string, days: string | number, type: string) {
        const existingCache = this.getRestoreCache(id);
        const newCache = {
            type,
            days: (existingCache ? existingCache.days : 0) + days,
            initiated: existingCache ? existingCache.initiated : Date.now(),
        };
        this.storageService.setItem(`${id}__restore_info`, JSON.stringify(newCache));
    }

    private getRestoreActionsBody(id, days, type) {
        return {
            actionDefinitionId: 'restore',
            targetId: id,
            params: {
                'expiration-days': days,
                tier: type,
            },
        };
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }
}
