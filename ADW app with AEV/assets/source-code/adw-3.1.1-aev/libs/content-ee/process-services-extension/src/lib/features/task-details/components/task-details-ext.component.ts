/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TaskFormComponent, TaskDetailsModel, TaskListService } from '@alfresco/adf-process-services';
import { Store } from '@ngrx/store';
import { ProcessServicesExtActions } from '../../../process-services-ext-actions-types';
import { SnackbarInfoAction, SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { FormOutcomeEvent, ContentLinkModel, ProcessContentService, NodesApiService, StorageService } from '@alfresco/adf-core';
import { Observable } from 'rxjs';
import { getSelectedTask } from '../../../process-services-ext.selector';
import { TaskDetailsExtActions } from '../../../store/task-details-ext-actions-types';
import { ProcessServiceExtensionState } from '../../../store/reducers/process-services.reducer';

@Component({
    selector: 'aps-task-details-ext',
    templateUrl: './task-details-ext.component.html',
    styleUrls: ['./task-details-ext.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TaskDetailsExtComponent implements OnInit, OnDestroy {
    static SAVE_OUTCOME_ID = '$save';

    @ViewChild('adfTaskForm', { static: true })
    adfTaskForm: TaskFormComponent;

    appId = null;
    taskId: string;
    processInstanceId: string;
    docNodeId: string;
    parentNodeId: string;
    taskDetails$: Observable<TaskDetailsModel>;
    showMetadata = false;
    aevURL: any;
    showAEV = false;
    nodeAEVURLmap = new Map<string, string>();


    constructor(private route: ActivatedRoute,
        private location: Location,
        private processContentService: ProcessContentService,
        private nodeService: NodesApiService,
        private taskService: TaskListService,
        private storageService: StorageService,
        private router: Router,
        private store: Store<ProcessServiceExtensionState>) { }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.appId = +params['appId'];
            this.taskId = params['taskId'];
            if (this.taskId) {
                this.loadTaskDetails(this.taskId);
            }
            this.taskDetails$ = this.store.select(getSelectedTask);
            this.taskService.getTaskDetails(this.taskId).subscribe(
                res => {
                    this.processInstanceId = res.processInstanceId;
                    console.log('ProcessInstanceId: ', this.processInstanceId);
                    setTimeout(() => {
                        this.prepareAEVUrlForAllAttachments();
                    }, 500);
                }, error => {
                    console.log('Error: ', error);
                });


            console.log(">>> TASK DETAILS <<<")
            console.dir(this.taskDetails$)

            this.showAEV = (this.storageService.getItem("viewerType") == "AEV");


        });
    }

    loadTaskDetails(taskId: string) {
        this.store.dispatch(TaskDetailsExtActions.loadTaskDetails({ taskId: taskId }));
    }

    onFormLoaded() {
        if (this.adfTaskForm.isReadOnlyForm() && !this.adfTaskForm.isCompletedTask() && !this.adfTaskForm.isTaskClaimable()) {
            this.showWarningMessage('PROCESS-EXTENSION.ERROR.TASK_ACCESS_WARNING');
        }
    }

    onFormCompleted() {
        this.showInfoMessage('PROCESS-EXTENSION.TASK_FORM.FORM_COMPLETED');
        this.navigateToDefaultTaskFilter();
    }

    onFormOutcomeExecute(outcome: FormOutcomeEvent) {
        if (outcome.outcome.id === TaskDetailsExtComponent.SAVE_OUTCOME_ID) {
            this.showInfoMessage('PROCESS-EXTENSION.TASK_FORM.FORM_SAVED');
        }
    }

    onCompleteTaskForm() {
        this.showInfoMessage('PROCESS-EXTENSION.TASK_FORM.FORM_COMPLETED');
        this.navigateToDefaultTaskFilter();
    }

    onContentClick(content: ContentLinkModel): void {
        console.log("My content clicked from TASK ID = " + this.taskId);
        console.dir(content);
        if (!this.showAEV) { //STANDARD VIEWER
            this.store.dispatch(
                ProcessServicesExtActions.showAttachedContentPreviewAction({
                    content,
                })
            );
        } else { //AEV VIEWER

            console.log('this.nodeAEVURLmap');
            console.dir(this.nodeAEVURLmap);

            console.log('this.docNodeId', this.docNodeId);

            if (this.nodeAEVURLmap.has(content.name)) { //DOCUMENT FROM ACS
                var url = this.nodeAEVURLmap.get(content.name)
                this.router.navigateByUrl(url);
            }
            else { //DOCUMENT FROM LOCAL SYSTEM
                this.store.dispatch(
                    ProcessServicesExtActions.showAttachedContentPreviewAction({
                        content,
                    })
                );
            }

        }

    }

    onCloseForm() {
        this.location.back();
    }

    onClaim() {
        this.adfTaskForm.reloadTask();
        this.store.dispatch(TaskDetailsExtActions.reloadTaskDetails({ taskId: this.taskId }));
        this.showInfoMessage('PROCESS-EXTENSION.TASK_FORM.CLAIM_TASK');
    }

    onUnClaim() {
        this.navigateToDefaultTaskFilter();
        this.showInfoMessage('PROCESS-EXTENSION.TASK_FORM.UNCLAIM_TASK');
    }

    onError() {
        this.showWarningMessage('PROCESS-EXTENSION.TASK_FORM.CLAIM_FAILED');
    }

    navigateToDefaultTaskFilter(): void {
        this.store.dispatch(ProcessServicesExtActions.navigateToDefaultTaskFilter({}));
    }

    showWarningMessage(message: string) {
        this.store.dispatch(new SnackbarWarningAction(message));
    }

    showInfoMessage(message: string) {
        this.store.dispatch(new SnackbarInfoAction(message));
    }

    toggleMetadata() {
        this.showMetadata = !this.showMetadata;
    }

    ngOnDestroy() {
        this.store.dispatch(TaskDetailsExtActions.resetSelectedTask());
    }

    prepareAEVUrlForAllAttachments() {
        console.log('START of prepareAEVUrlForAllAttachments()');

        this.processContentService.getProcessRelatedContent(this.processInstanceId).subscribe(
            res => {
                console.log('RES OBJECT: ', res);

                for (var i = 0; i < res.data.length; i++) {
                    var resData = res.data[i];
                    if (resData && resData.linkUrl && resData.sourceId) {
                        console.log('Response : ' + i, resData.linkUrl);
                        console.log('Response: ' + i, resData.sourceId.split(';')[0]);
                        let _nodeId = resData.sourceId.split(';')[0];

                        setTimeout(() => {
                            console.log('_nodeId > ' + _nodeId);

                            this.nodeService.getNode(_nodeId).subscribe(
                                node => {
                                    console.log('Node Name from  Response: ', node.name);
                                    console.dir(node);
                                    this.parentNodeId = node.parentId;

                                    var url = '/libraries/' + node.parentId + '/(viewer:view/' + node.id + ')'
                                    // this.router.navigateByUrl(url);
                                    this.nodeAEVURLmap.set(node.name, url);

                                }, error => {
                                    console.log('Error: ', error);
                                });
                        }, 500);
                    }
                }
            }, error => {
                console.log('Error: ', error);
            });
    }
}
