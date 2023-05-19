/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { withLatestFrom, switchMap } from 'rxjs/operators';
import { FilterParamsModel, IdentityUserService, ProcessCloudService, ProcessInstanceCloud, TaskFilterCloudModel } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { openProcessCancelConfirmationDialog } from '../../../../store/actions/process-details.actions';

@Component({
    selector: 'apa-process-details',
    templateUrl: './process-details-cloud-ext.component.html',
    styleUrls: ['./process-details-cloud-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProcessDetailsCloudExtComponent implements OnInit, OnDestroy {
    appName: string;
    processInstance: ProcessInstanceCloud;
    processInstanceId: string;
    currentFilter$: Observable<FilterParamsModel>;
    onDestroy$ = new Subject<boolean>();
    taskListFilterParams: TaskFilterCloudModel;
    filter: any;

    constructor(
        private route: ActivatedRoute,
        private store: Store<any>,
        private identityUserService: IdentityUserService,
        private processService: ProcessCloudService
    ) {}

    ngOnInit() {
        this.route.queryParams.pipe(
            withLatestFrom(this.store.select(selectApplicationName)),
            switchMap(([params, appName]) => {
                this.appName = appName;
                this.processInstanceId = params['processInstanceId'];
                this.filter = { appName: this.appName, processInstanceId: this.processInstanceId };
                this.taskListFilterParams = <TaskFilterCloudModel> { appName: this.appName, processInstanceId: this.processInstanceId };
                return this.processService.getProcessInstanceById(appName, params['processInstanceId']);
            })
        ).subscribe((details) => {
            this.processInstance = details;
        });

        this.currentFilter$ = this.store.select(selectProcessManagementFilter);
    }

    canCancelProcess(): boolean {
        const currentUser = this.identityUserService.getCurrentUserInfo().username;
        return this.processInstance.initiator === currentUser && this.processInstance.status === 'RUNNING';
    }

    onCancelProcess() {
        this.store.dispatch(
            openProcessCancelConfirmationDialog({
                processInstanceId: this.processInstanceId,
                appName: this.appName,
            })
        );
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
