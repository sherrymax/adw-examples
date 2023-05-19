/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppStore, getCurrentFolder, ViewNodeAction } from '@alfresco/aca-shared/store';
import { UploadService, FileModel } from '@alfresco/adf-core';
import { NodeEntry } from '@alfresco/js-api';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, from, Observable, of, zip } from 'rxjs';
import { map, take, mergeMap } from 'rxjs/operators';
import { CreateDocumentDialogComponent } from '../../components/create-document-dialog/create-document-dialog.component';
import {
    CreateOfficeDocumentAction,
    CreateOfficeDocumentAndOpenViewerAction,
    CreateOfficeDocumentAndStartSessionAction,
    CREATE_DOCUMENT,
    CREATE_DOCUMENT_AND_OPEN_VIEWER,
    CREATE_DOCUMENT_AND_START_SESSION,
    StartSessionOfficeAction,
} from '../extension.actions';

@Injectable()
export class CreateDocumentExtensionEffects {
    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private matDialog: MatDialog,
        private store: Store<AppStore>,
        private router: Router,
        private uploadService: UploadService
    ) {}


    createDocument$ = createEffect(() => this.actions$.pipe(
        ofType<CreateOfficeDocumentAction>(CREATE_DOCUMENT),
        mergeMap((action) => {
            const fileType = action?.payload;
            return this.matDialog
                .open(CreateDocumentDialogComponent, {
                    data: { fileType },
                    width: '570px',
                    restoreFocus: true,
                })
                .afterClosed();
        })
    ), { dispatch: false });


    createAndOpenViewer$ = createEffect(() => this.actions$.pipe(
        ofType<CreateOfficeDocumentAndOpenViewerAction>(CREATE_DOCUMENT_AND_OPEN_VIEWER),
        mergeMap((action) => this.uploadFile(action.filePath, action.fileName, action.properties)),
        map((nodeEntry: NodeEntry) => new ViewNodeAction(nodeEntry.entry.id, { location: this.router.url }))
    ));


    createAndStartSession$ = createEffect(() => this.actions$.pipe(
        ofType<CreateOfficeDocumentAndStartSessionAction>(CREATE_DOCUMENT_AND_START_SESSION),
        mergeMap((action) => this.uploadFile(action.filePath, action.fileName, action.properties)),
        map((nodeEntry: NodeEntry) => new StartSessionOfficeAction(nodeEntry))
    ));

    private getFileBlob(filePath: string): Observable<Blob> {
        return this.http.get(filePath, { responseType: 'blob' });
    }

    uploadFile(filePath: string, fileName: string, props: any): Observable<any> {
        return this.store.select(getCurrentFolder).pipe(
            take(1),
            mergeMap((node) => {
                if (node && node.id) {
                    return zip(this.getFileBlob(filePath), of(node.id));
                }
                return EMPTY;
            }),
            mergeMap(([fileBlob, nodeId]) => of(
                new FileModel(new File([fileBlob], fileName), {
                    parentId: nodeId,
                    path: '',
                    nodeType: 'cm:content',
                    properties: props,
                })
            )),
            mergeMap((file) => from(this.uploadService.getUploadPromise(file)))
        );
    }
}
