/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ActionsApi,
    ActionBodyExec,
    ActionExecResultEntry,
    RecordsApi,
    MinimalNodeEntryEntity,
    Node,
    NodeEntry,
    RecordEntry,
    FilesApi,
    NodePaging,
    NodeChildAssociationPaging, NodesApi
} from '@alfresco/js-api';
import { AlfrescoApiService, LogService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { from, Observable, throwError, Subject } from 'rxjs';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import { ActionPollService } from './action-poll.service';
import { DeclareRecord } from '../models/declare-record.model';

@Injectable({
    providedIn: 'root'
})
export class RecordService {
    constructor(private alfrescoApiService: AlfrescoApiService, private actionPollingService: ActionPollService, private logService: LogService) {
    }

    declaredSingleRecord$: Subject<DeclareRecord> = new Subject<DeclareRecord>();

    _actionsApi: ActionsApi;
    get actionsApi(): ActionsApi {
        this._actionsApi = this._actionsApi ?? new ActionsApi(this.alfrescoApiService.getInstance());
        return this._actionsApi;
    }

    _recordsApi: RecordsApi;
    get recordsApi(): RecordsApi {
        this._recordsApi = this._recordsApi ?? new RecordsApi(this.alfrescoApiService.getInstance());
        return this._recordsApi;
    }

    _filesApi: FilesApi;
    get filesApi(): FilesApi {
        this._filesApi = this._filesApi ?? new FilesApi(this.alfrescoApiService.getInstance());
        return this._filesApi;
    }

    _nodesApi: NodesApi;
    get nodesApi(): NodesApi {
        this._nodesApi = this._nodesApi ?? new NodesApi(this.alfrescoApiService.getInstance());
        return this._nodesApi;
    }

    declareRejectedRecord(node: Node): Observable<RecordEntry> {
        return this.removeNodeRejectedWarning(node).pipe(
            switchMap(() => this.declareNodeRecord(node)),
            catchError((error) => this.handleError(error))
        );
    }

    declareNodeRecord(nodeAction: MinimalNodeEntryEntity): Observable<RecordEntry> {
        const opts = { hideRecord: false };
        return from(this.filesApi.declareRecord(nodeAction.id, opts)).pipe(catchError((error) => this.handleError(error)));
    }

    removeNodeRejectedWarning(node: Node): Observable<NodeEntry> {
        const aspectNames = node.aspectNames.filter((name) => name !== 'rma:recordRejectionDetails');
        const updatedRecord = { aspectNames: aspectNames };
        return from(this.nodesApi.updateNode(node.id, updatedRecord)).pipe(catchError((error) => this.handleError(error)));
    }

    deleteRecord(node: Node): Observable<boolean> {
        return from(this.recordsApi.deleteRecord(node.id)).pipe(catchError((error) => this.handleError(error)));
    }

    hideRecord(targetNode: Node): Observable<NodePaging> {
        const hideActionBody = {
            actionDefinitionId: 'hide-record',
            targetId: targetNode.id
        };

        return this.executeAction(hideActionBody).pipe(
            concatMap(() => this.actionPollingService.checkNodeDeletedFromFolder(targetNode.id, targetNode.properties['rma:recordOriginatingLocation'])),
            catchError((error) => this.handleError(error))
        );
    }

    moveRecord(targetNode: Node, destinationNode: Node): Observable<NodePaging> {
        const moveActionBody = {
            actionDefinitionId: 'move-dm-record',
            targetId: targetNode.id,
            params: {
                targetNodeRef: `workspace://SpacesStore/${destinationNode.id}`
            }
        };

        return this.executeAction(moveActionBody).pipe(
            switchMap(() => this.actionPollingService.checkNodeInFolder(targetNode.id, destinationNode.id)),
            catchError((error) => this.handleError(error))
        );
    }

    executeAction(actionBody: ActionBodyExec): Observable<ActionExecResultEntry> {
        return from(this.actionsApi.actionExec(actionBody));
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }

    public getNodeSecondaryChildren(nodeId: string, opts: any): Observable<NodeChildAssociationPaging> {
        return from(this.nodesApi.listSecondaryChildren(nodeId, opts));
    }
}
