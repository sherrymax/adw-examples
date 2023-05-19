/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ListByCategoryProcess } from '@alfresco-dbp/content-ee/shared/ui';
import { AppsProcessService } from '@alfresco/adf-core';
import { ProcessService, ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';
import { AppDefinitionRepresentation } from '@alfresco/js-api';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface StartProcessDialogOnCloseData {
    process: ProcessDefinitionRepresentation;
    application: AppDefinitionRepresentation;
}

@Component({
    selector: 'aps-start-process-dialog',
    templateUrl: './start-process-dialog.component.html',
    styleUrls: ['./start-process-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StartProcessDialogComponent implements OnInit {
    constructor(
        private processService: ProcessService,
        private dialog: MatDialogRef<StartProcessDialogComponent, StartProcessDialogOnCloseData>,
        private appsProcessService: AppsProcessService,
    ) {}

    loadingProcesses = false;
    showLoadingProcessesError = false;
    applications$: Observable<AppDefinitionRepresentation[]>;
    allProcesses$: Observable<ProcessDefinitionRepresentation[]> = of([]);
    selectApplicationControl = new UntypedFormControl({ value: null, disabled: true });

    ngOnInit(): void {
        this.applications$ = this.appsProcessService.getDeployedApplications().pipe(
            map(this.removeDefaultApplications),
            catchError(() => [])
        );

        this.selectApplicationControl.valueChanges.subscribe((selectedApplication) => {
            if (selectedApplication) {
                this.loadingProcesses = true;

                this.allProcesses$ = this.processService.getProcessDefinitions(selectedApplication.id)
                    .pipe(
                        tap(() => this.loadingProcesses = false)
                    );
            }
        });

        this.applications$.subscribe((applications) => {
            if (applications.length === 0) {
                this.showLoadingProcessesError = true;
            }

            if (applications.length > 0 && this.selectApplicationControl.disabled) {
                this.selectApplicationControl.enable();
            }

            if (applications.length === 1) {
                this.selectApplicationControl.setValue(applications[0]);
            }
        });
    }

    onSelectProcess(listByCategoryProcess: ListByCategoryProcess): void {
        const process = listByCategoryProcess as ProcessDefinitionRepresentation;

        this.dialog.close({
            process,
            application: this.selectApplicationControl.value
        });
    }

    selectApplicationComparator(
        application: AppDefinitionRepresentation,
        selectedApplication: AppDefinitionRepresentation | null
    ): boolean {
        return application.id === selectedApplication?.id;
    }

    private removeDefaultApplications(
        appDefinitions: AppDefinitionRepresentation[]
    ): AppDefinitionRepresentation[] {
        return appDefinitions.filter(application => !!application.id);
    }
}
