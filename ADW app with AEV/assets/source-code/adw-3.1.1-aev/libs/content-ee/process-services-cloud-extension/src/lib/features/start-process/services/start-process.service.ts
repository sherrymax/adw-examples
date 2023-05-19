/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, LogService } from '@alfresco/adf-core';
import { MinimalNode, FormDefinitionRepresentation, FormFieldRepresentation } from '@alfresco/js-api';
import { Observable } from 'rxjs/internal/Observable';
import { map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { SnackbarWarningAction } from '@alfresco-dbp/content-ce/shared/store';
import { ReplaySubject, of } from 'rxjs';
import { FormCloudService, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';

export interface UploadWidget {
    id: string;
    type: string;
}

@Injectable({
    providedIn: 'root',
})
export class StartProcessService {
    static UPLOAD = 'upload';
    static MULTIPLE = 'multiple';
    static SINGLE = 'single';
    private selectedNodesSubject = new ReplaySubject<MinimalNode[]>(1);
    selectedNodes$: Observable<MinimalNode[]>;

    constructor(
        private formCloudService: FormCloudService,
        private startProcessCloudService: StartProcessCloudService,
        private appConfigService: AppConfigService,
        private logService: LogService,
        private store: Store<any>
    ) {
        this.selectedNodes$ = this.selectedNodesSubject.asObservable();
    }

    getAppName() {
        return this.appConfigService.get('alfresco-deployed-apps')[0].name;
    }

    getDefaultProcessName(): string {
        return this.appConfigService.get<string>('adf-cloud-start-process.name');
    }

    getDefaultProcessDefinitionName(): string {
        return this.appConfigService.get<string>('adf-cloud-start-process.processDefinitionName');
    }

    setSelectedNodes(selectedNodes: MinimalNode[]) {
        this.selectedNodesSubject.next(selectedNodes);
    }

    getContentUploadWidgets(processDefinitionName: string): Observable<UploadWidget[]> {
        return this.getStartFormByProcessDefinitionName(processDefinitionName);
    }

    private getStartFormByProcessDefinitionName(processDefinitionFormKey: string) {
        return this.getFormById(processDefinitionFormKey).pipe(
            map((res: FormDefinitionRepresentation) => {
                if (res.fields.length === 0) {
                    this.showError('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
                }
                return res.fields.length ? this.getUploadWidgetFields(res.fields) : [];
            }),
            catchError((error) => {
                this.showError('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
                this.logService.error(error);
                return of([]);
            })
        );
    }

    getProcessDefinitions(appName) {
        return this.startProcessCloudService.getProcessDefinitions(appName);
    }

    getFormById(formId: string) {
        const appName = this.getAppName();

        return this.formCloudService.getForm(appName, formId).pipe(
            map((form: any) => {
                const flattenForm = {
                    ...form.formRepresentation,
                    ...form.formRepresentation.formDefinition,
                };
                delete flattenForm.formDefinition;
                return flattenForm;
            })
        );
    }

    private getUploadWidgetFields(fieldContainers: FormFieldRepresentation[]): UploadWidget[] {
        const uploadWidgets = this.filterFieldsByType(this.getFormFields(fieldContainers), StartProcessService.UPLOAD);

        if (uploadWidgets.length === 0) {
            this.showError('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
        }

        return uploadWidgets.map((filteredWidget: any) => <UploadWidget> {
            id: filteredWidget.id,
            type: filteredWidget.params.multiple ? StartProcessService.MULTIPLE : StartProcessService.SINGLE,
        });
    }

    private getFormFields(fieldContainers: FormFieldRepresentation[]): FormFieldRepresentation[] {
        return fieldContainers
            .map((fieldContainer: any) => [].concat(...Object.values(fieldContainer.fields)))
            .reduce((previous, current) => previous.concat(current));
    }

    private filterFieldsByType(fields: FormFieldRepresentation[], fieldType: string): FormFieldRepresentation[] {
        return fields.filter((widget: any) => widget.type === fieldType);
    }

    showError(message: string) {
        this.store.dispatch(new SnackbarWarningAction(message));
    }
}
