/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, map, concatMap } from 'rxjs/operators';
import { RefreshPreviewAction, ReloadDocumentListAction, SetSelectedNodesAction, SnackbarErrorAction, SnackbarInfoAction } from '@alfresco/aca-shared/store';
import { NodeChildAssociation, SharedLink, NodeEntry } from '@alfresco/js-api';
import { MsalService, MicrosoftOnlineService } from '../../components/msal';
import {
    CANCEL_SESSION,
    CancelSessionOfficeAction,
    END_EDITING,
    END_SESSION,
    EndEditingOfficeAction,
    EndSessionOfficeAction,
    START_SESSION,
    StartSessionOfficeAction,
    RESUME_SESSION,
    ResumeSessionOfficeAction,
} from '../extension.actions';
import { EMPTY, of, zip } from 'rxjs';
import { WindowRef } from '../../components/resume-active-session/window-ref';
import { MatDialog } from '@angular/material/dialog';
import { EndSessionDialogComponent } from '../../components/end-session-dialog/end-session-dialog.component';
import { ContentApiService } from '@alfresco/aca-shared';

export class MicrosoftSessionDetails {
    'ooi:acsSessionOwner': string;
    'ooi:sessionNodeId': string;
    'ooi:msDriveId': string;
    'ooi:msDriveItemId': string;
    'ooi:msSessionOwner': string;
    'ooi:msWebUrl': string;
}

@Injectable()
export class MicrosoftOnlineEffects {
    constructor(
        private actions$: Actions,
        private msal: MsalService,
        private microsoftService: MicrosoftOnlineService,
        private winRef: WindowRef,
        private matDialog: MatDialog,
        private contentApi: ContentApiService
    ) {}


    startSession$ = createEffect(() => this.actions$.pipe(
        ofType<StartSessionOfficeAction>(START_SESSION),
        mergeMap((action) => zip(of(action), this.msal.getToken())),
        mergeMap(([action, token]) => {
            const nodeId = this.toNodeId(action?.payload?.entry);
            if (nodeId !== undefined) {
                return this.microsoftService.startSession(token, nodeId);
            }
            return EMPTY;
        }),
        mergeMap((response) => {
            if (response?.['ooi:msWebUrl']) {
                this.winRef.nativeWindow.open(response['ooi:msWebUrl']);
            }
            if (response?.['ooi:sessionNodeId']) {
                return this.contentApi.getNode(response?.['ooi:sessionNodeId']);
            }
            return EMPTY;
        }),
        concatMap((response: NodeEntry) => [
            new SnackbarInfoAction('MICROSOFT-ONLINE.START_SESSION_SUCCESS'),
            new ReloadDocumentListAction(),
            new SetSelectedNodesAction([response])
        ])
    ));


    resumeSession$ = createEffect(() => this.actions$.pipe(
        ofType<ResumeSessionOfficeAction>(RESUME_SESSION),
        map((action) => {
            if (action?.payload?.entry?.properties?.['ooi:msWebUrl']) {
                this.winRef.nativeWindow.open(action.payload.entry.properties['ooi:msWebUrl']);
            }
        }),
        switchMap(() => [new SnackbarInfoAction('MICROSOFT-ONLINE.START_SESSION_SUCCESS')])
    ));


    cancelSession$ = createEffect(() => this.actions$.pipe(
        ofType<CancelSessionOfficeAction>(CANCEL_SESSION),
        mergeMap((action) => zip(of(action), this.msal.getToken())),
        switchMap(([action, token]) => {
            const nodeId = this.toNodeId(action?.payload?.entry);
            if (nodeId !== undefined && action?.payload?.entry?.properties?.['ooi:msWebUrl']) {
                return this.microsoftService.cancelSession(token, nodeId).pipe(
                    mergeMap(() => this.contentApi.getNode(nodeId)),
                    concatMap((response: NodeEntry) => [
                        new SnackbarInfoAction('MICROSOFT-ONLINE.CANCEL_SESSION_SUCCESS'),
                        new ReloadDocumentListAction(),
                        new SetSelectedNodesAction([response]),
                    ]),
                    catchError(() => of(new SnackbarErrorAction('MICROSOFT-ONLINE.CANCEL_SESSION_DENIED')))
                );
            }
            return EMPTY;
        })
    ));


    endEditing$ = createEffect(() => this.actions$.pipe(
        ofType<EndEditingOfficeAction>(END_EDITING),
        mergeMap((action) => {
            const node = action?.payload;
            return this.matDialog
                .open(EndSessionDialogComponent, {
                    data: { node },
                    width: '570px',
                    restoreFocus: true,
                })
                .afterClosed();
        })
    ), { dispatch: false });


    endSession$ = createEffect(() => this.actions$.pipe(
        ofType<EndSessionOfficeAction>(END_SESSION),
        mergeMap((action) => zip(of(action), this.msal.getToken())),
        switchMap(([action, token]) => {
            const nodeId = this.toNodeId(action?.payload?.node?.entry);
            const sessionNodeId = action?.payload?.node?.entry?.properties?.['ooi:sessionNodeId'];
            const sessionOwner = action?.payload?.node?.entry?.properties?.['ooi:acsSessionOwner'];
            const lockOwner = action?.payload?.node?.entry?.properties?.['cm:lockOwner']?.id;

            if (nodeId !== undefined && sessionNodeId === nodeId && sessionOwner === lockOwner) {
                return this.microsoftService.endSession(token, nodeId, action?.payload?.isMajor, action?.payload?.comment).pipe(
                    mergeMap(() => this.contentApi.getNode(nodeId)),
                    concatMap((response: NodeEntry) => [
                        new SnackbarInfoAction('MICROSOFT-ONLINE.END_SESSION_SUCCESS'),
                        new ReloadDocumentListAction(),
                        new SetSelectedNodesAction([response]),
                        new RefreshPreviewAction(response),
                    ]),
                    catchError(() => of(new SnackbarErrorAction('MICROSOFT-ONLINE.END_SESSION_DENIED')))
                );
            }
            return EMPTY;
        })
    ));

    toNodeId(entry: NodeChildAssociation): string {
        if (entry instanceof SharedLink) {
            const sharedLink: SharedLink = entry;
            return sharedLink.nodeId;
        } else if (entry?.isFile) {
            return entry.id;
        }
        return undefined;
    }
}
