/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, Observable, of } from 'rxjs';
import { PluginPreviewAction, SnackbarErrorAction, SetFileUploadingDialogAction } from '@alfresco-dbp/content-ce/shared/store';
import { StartProcessService, UploadWidget } from '../../services/start-process.service';
import { TaskVariableCloud, ProcessInstanceCloud, ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { filter, switchMap, map, takeUntil, take } from 'rxjs/operators';
import { MinimalNode } from '@alfresco/js-api';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { processCreationSuccess } from '../../../../store/actions/process-instance-cloud.action';

const PROCESS_DEFINITION_QUERY_PARAM = 'process';

@Component({
    templateUrl: './start-process.component.html',
    styleUrls: ['./start-process.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class StartProcessComponent implements OnInit, OnDestroy {
    appName$: Observable<string>;
    defaultProcessName: string;
    formValues$: Observable<TaskVariableCloud[]>;
    processDefinitionName: string;
    defaultProcessDefinition?: string;
    processId: number;
    selectedNodes: MinimalNode[];
    private onDestroy$ = new Subject<boolean>();
    private processDefinitionSelected$ = new Subject<string>();

    constructor(private location: Location,
                private store: Store<any>,
                private route: ActivatedRoute,
                private router: Router,
                public startProcessServiceCloud: StartProcessService
    ) {
        this.appName$ = this.store.select(selectApplicationName);
        this.formValues$ = this.processDefinitionSelected$.pipe(switchMap(this.mapSelectedFilesFormKey.bind(this)));
    }

    ngOnInit() {
        this.route.queryParams
            .pipe(
                take(1),
            )
            .subscribe((params: Params) => {
                this.defaultProcessDefinition = params[PROCESS_DEFINITION_QUERY_PARAM];
                this.setFileUploadingDialogVisibility(false);
                this.defaultProcessName = this.startProcessServiceCloud.getDefaultProcessName();
                this.getSelectedNodes();
            }
            );
    }

    onProcessDefinitionSelection(processDefinition: ProcessDefinitionCloud) {
        this.addProcessNameToQueryParam(processDefinition.name);

        if (this.hasSelectedContent()) {
            this.processDefinitionSelected$.next(processDefinition.formKey);
        }
    }

    addProcessNameToQueryParam(processName: string) {
        void this.router.navigate(
            ['.'],
            {
                relativeTo: this.route,
                queryParams: { [PROCESS_DEFINITION_QUERY_PARAM]: processName },
                queryParamsHandling: 'merge',
                replaceUrl: true
            }
        );
    }

    mapSelectedFilesFormKey(formKey: string) {
        return this.startProcessServiceCloud.getContentUploadWidgets(formKey).pipe(
            filter((contentWidgets) => contentWidgets.length > 0),
            switchMap((contentWidgets) => this.startProcessServiceCloud.selectedNodes$.pipe(
                map((selectedNodes: MinimalNode[]) => {
                    if (contentWidgets.length && selectedNodes.length) {
                        return this.prepareFormValues(contentWidgets, selectedNodes);
                    }
                    return of();
                })
            ))
        );
    }

    prepareFormValues(contentWidgets: UploadWidget[], selectedNodes: MinimalNode[]): TaskVariableCloud[] {
        const values: TaskVariableCloud[] = [];
        const firstSimpleWidget = contentWidgets.find(({ type }) => type === 'single');
        const firstMultipleWidget = contentWidgets.find(({ type }) => type === 'multiple');

        if (selectedNodes.length === 1 && (firstSimpleWidget || firstMultipleWidget)) {
            values.push(
                new TaskVariableCloud({
                    name: (firstSimpleWidget || firstMultipleWidget).id,
                    value: selectedNodes,
                })
            );
        } else if (selectedNodes.length > 1 && firstMultipleWidget) {
            values.push(
                new TaskVariableCloud({
                    name: firstMultipleWidget.id,
                    value: selectedNodes,
                })
            );
        }

        return values;
    }

    onProcessCreation(event: ProcessInstanceCloud): void {
        this.store.dispatch(processCreationSuccess({
            processName: event.name,
            processDefinitionKey: event.processDefinitionKey
        }));

        this.backFromProcessCreation();
    }

    onFormContentClicked({ nodeId }) {
        this.store.dispatch(new PluginPreviewAction('start-process-cloud', nodeId));
    }

    onProcessCreationError(event: any) {
        this.store.dispatch(new SnackbarErrorAction(event.response.body.entry.message));
    }

    backFromProcessCreation(): void {
        this.location.back();
    }

    private getSelectedNodes() {
        this.startProcessServiceCloud.selectedNodes$.pipe(takeUntil(this.onDestroy$)).subscribe((selectedNodes) => {
            this.selectedNodes = selectedNodes;
        });
    }

    private hasSelectedContent(): boolean {
        return this.selectedNodes?.length > 0;
    }

    ngOnDestroy(): void {
        this.setFileUploadingDialogVisibility(true);
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    private setFileUploadingDialogVisibility(visibility: boolean) {
        this.store.dispatch(new SetFileUploadingDialogAction(visibility));
    }
}
