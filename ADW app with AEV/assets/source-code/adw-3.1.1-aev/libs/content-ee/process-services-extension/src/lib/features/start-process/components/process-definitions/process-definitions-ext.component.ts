/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { ProcessService, ProcessDefinitionRepresentation } from '@alfresco/adf-process-services';
import { Store } from '@ngrx/store';
import { getAppSelection } from '@alfresco-dbp/content-ce/shared/store';
import { NodeEntry } from '@alfresco/js-api';
import { ALL_APPS } from '../../../../models/process-service.model';
import { startProcessAction, StartProcessPayload } from '../../actions/start-process.actions';
import { StartProcessExtService } from '../../services/start-process-ext.service';

@Component({
    selector: 'aps-process-definitions-ext',
    templateUrl: './process-definitions-ext.component.html',
    styleUrls: ['./process-definitions-ext.component.scss'],
})
export class ProcessDefinitionsExtComponent implements OnInit {
    selectedNodes: NodeEntry[] = [];

    processDefinitions: ProcessDefinitionRepresentation[];
    totalQuickStartProcessDefinitions: number;

    constructor(private store: Store<any>, private processService: ProcessService, private startProcessExtService: StartProcessExtService) {}

    ngOnInit() {
        this.totalQuickStartProcessDefinitions = this.startProcessExtService.getTotalQuickStartProcessDefinitions();
        this.getSelectedNode();
        this.getProcessDefinitionsByAppId();
    }

    getSelectedNode() {
        this.store.select(getAppSelection).subscribe((res: any) => (this.selectedNodes = res.nodes));
    }

    private hasContentAttachment(): boolean {
        return this.selectedNodes && this.selectedNodes.length > 0;
    }

    hasProcessDefinitions(): boolean {
        return this.processDefinitions && this.processDefinitions.length > 0;
    }

    getProcessDefinitionsByAppId(appId: number = ALL_APPS) {
        this.processService.getProcessDefinitions(appId).subscribe((processDefinitions) => {
            this.processDefinitions = processDefinitions;
        });
    }

    onProcessDefinitionClick(processDefinition: ProcessDefinitionRepresentation) {
        const startProcess: StartProcessPayload = {
            payload: {
                processDefinition: processDefinition,
            },
        };
        if (this.hasContentAttachment()) {
            startProcess.payload.selectedNodes = this.selectedNodes;
        }
        this.store.dispatch(startProcessAction(startProcess));
    }

    onMoreClick() {
        this.onProcessDefinitionClick(new ProcessDefinitionRepresentation());
    }

    canShowMore(): boolean {
        return this.processDefinitions && this.processDefinitions.length > this.totalQuickStartProcessDefinitions;
    }

    getQuickStartProcessDefinitions(): ProcessDefinitionRepresentation[] {
        if (this.canShowMore()) {
            return this.processDefinitions.slice(0, this.totalQuickStartProcessDefinitions);
        } else {
            return this.processDefinitions;
        }
    }
}
