/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { NodeEntry } from '@alfresco/js-api';
import { tap } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { ALL_APPS } from '../../../models/process-service.model';
import { startProcessAction, showNotificationOnStartProcessAction, NotificationPayload } from '../actions/start-process.actions';
import { NotificationService } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { StartProcessExtService } from '../services/start-process-ext.service';
import { MatDialog } from '@angular/material/dialog';
import { StartProcessDialogComponent, StartProcessDialogOnCloseData } from '../components/start-process-dialog/start-process-dialog.component';

@Injectable()
export class StartProcessExtEffect {
    constructor(
        private actions$: Actions,
        private dialog: MatDialog,
        private router: Router,
        private startProcessExtService: StartProcessExtService,
        private notificationService: NotificationService,
        private store: Store<ProcessServiceExtensionState>
    ) {}

    startProcessEffect = createEffect(
        () =>
            this.actions$.pipe(
                ofType(startProcessAction),
                tap((action) => {
                    if (action) {
                        this.setSelectedNodes(action.payload.selectedNodes);

                        if (action.payload.processDefinition) {
                            const navigationExtras: NavigationExtras = {
                                queryParams: {
                                    appId: ALL_APPS,
                                    processDefinitionName: action.payload.processDefinition.name,
                                    processDefinitionId: action.payload.processDefinition.id,
                                },
                            };

                            this.navigateToStartProcess(navigationExtras);
                        } else {
                            this.openDialog();
                        }
                    } else {
                        this.openDialog();
                    }
                })
            ),
        { dispatch: false }
    );

    showNotificationOnStartProcessEffect = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showNotificationOnStartProcessAction),
                tap((action: NotificationPayload) => this.showNotificationWithActionButton(action))
            ),
        { dispatch: false }
    );

    private openStartProcessDialog() {
        return this.dialog.open<StartProcessDialogComponent, any, StartProcessDialogOnCloseData>(
            StartProcessDialogComponent,
            {
                width: '70%',
                height: '80%',
                panelClass: 'aca-start-process-dialog-container',
            }
        );
    }

    private navigateToStartProcess(queryParams: NavigationExtras = { queryParams: { appId: ALL_APPS } }) {
        void this.router.navigate(['/start-process'], queryParams);
    }

    private setSelectedNodes(nodes: NodeEntry[] = []) {
        const selectedNodes = nodes.length > 0 ? nodes.map((node) => node.entry) : [];
        this.startProcessExtService.setSelectedNodes(selectedNodes);
    }

    private showNotificationWithActionButton(action: NotificationPayload) {
        this.notificationService
            .openSnackMessageAction('PROCESS-EXTENSION.SNACKBAR.PROCESS-CREATED', 'PROCESS-EXTENSION.SNACKBAR.ACTION', 10000, { processName: action.processInstanceName })
            .onAction()
            .subscribe(() => {
                this.closeProcessManagementSection();
                this.resetSelectedFilterAction();
                this.store.dispatch(
                    ProcessServicesExtActions.processDetailsAction({
                        appId: action.appId,
                        processInstance: action.processInstance,
                    })
                );
            });
    }

    private openDialog(): void {
        this.openStartProcessDialog().afterClosed().subscribe((closeDialogData) => {
            if (closeDialogData) {
                const navigationExtras: NavigationExtras = {
                    queryParams: {
                        appId: closeDialogData.application.id ?? 0,
                        process: closeDialogData.process.name ?? undefined,
                    },
                };

                this.navigateToStartProcess(navigationExtras);
            }
        });
    }

    private closeProcessManagementSection() {
        this.store.dispatch(
            ProcessServicesExtActions.toggleProcessManagement({
                expanded: false,
            })
        );
    }

    private resetSelectedFilterAction() {
        this.store.dispatch(ProcessServicesExtActions.resetSelectedFilterAction({}));
    }
}
