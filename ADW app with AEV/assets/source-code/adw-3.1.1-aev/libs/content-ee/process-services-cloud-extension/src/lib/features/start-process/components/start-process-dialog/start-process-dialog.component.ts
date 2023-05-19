/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
    selectProcessDefinitionEntities,
    selectProcessDefinitionsLoadingError,
    selectRecentProcessDefinitionKeys,
} from '../../../../store/selectors/process-definitions.selector';
import { FeatureCloudRootState } from '../../../../store/states/state';

@Component({
    selector: 'apa-start-process-dialog',
    templateUrl: './start-process-dialog.component.html',
    styleUrls: ['./start-process-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StartProcessDialogComponent implements OnInit {
    constructor(
        private store: Store<FeatureCloudRootState>,
        private dialog: MatDialogRef<StartProcessDialogComponent>
    ) {}

    allProcesses$: Observable<ProcessDefinitionCloud[]>;
    loadingProcessesError$: Observable<string>;
    recentDefinitionKeys$: Observable<string[]>;

    ngOnInit(): void {
        this.allProcesses$ = this.store.select(selectProcessDefinitionEntities);
        this.recentDefinitionKeys$ = this.store.select(selectRecentProcessDefinitionKeys);
        this.loadingProcessesError$ = this.store.select(selectProcessDefinitionsLoadingError);
    }

    onSelectProcess(process: { name: string }): void {
        this.dialog.close(process.name);
    }
}
