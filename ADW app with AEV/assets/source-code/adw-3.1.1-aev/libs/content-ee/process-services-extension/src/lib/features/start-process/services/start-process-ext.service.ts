/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { FormService, AppConfigService, LogService } from '@alfresco/adf-core';
import { MinimalNode, FormDefinitionRepresentation, FormFieldRepresentation } from '@alfresco/js-api';
import { Observable } from 'rxjs/internal/Observable';
import { UploadWidgetType } from '../../../models/process-service.model';
import { map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { SnackbarWarningAction, SnackbarErrorAction } from '@alfresco-dbp/content-ce/shared/store';
import { throwError, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StartProcessExtService {
    static UPLOAD = 'upload';
    static MULTIPLE = 'multiple';
    static SINGLE = 'single';
    static LOCAL_FILE_SOURCE = 'local-file';
    private selectedNodesSubject = new BehaviorSubject([]);
    selectedNodes$: Observable<MinimalNode[]>;

    processServicesRunning = false;

    constructor(private formService: FormService, private appConfig: AppConfigService, private logService: LogService, private store: Store<any>) {
        this.selectedNodes$ = this.selectedNodesSubject.asObservable();
    }

    getDefaultProcessName(): string {
        return this.appConfig.get<string>('adf-start-process.name');
    }

    getDefaultProcessDefinitionName(): string {
        return this.appConfig.get<string>('adf-start-process.processDefinitionName');
    }

    getTotalQuickStartProcessDefinitions(): number {
        return this.appConfig.get<number>('totalQuickStartProcessDefinitions');
    }

    setSelectedNodes(selectedNodes: MinimalNode[]) {
        this.selectedNodesSubject.next(selectedNodes);
    }

    resetSelectedNodes() {
        this.selectedNodesSubject.next([]);
    }

    getContentUploadWidgets(processDefinitionId: string): Observable<UploadWidgetType[]> {
        return this.getStartFormByProcessDefinitionId(processDefinitionId);
    }

    private getStartFormByProcessDefinitionId(processDefinitionId: string): Observable<UploadWidgetType[]> {
        return this.formService.getStartFormDefinition(processDefinitionId).pipe(
            map((res: FormDefinitionRepresentation) => {
                if (res.fields.length === 0) {
                    this.showWarning('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');
                }
                return res.fields.length ? this.findFieldsOfTypeContent(res.fields) : [];
            }),
            catchError((error) => {
                this.showError('PROCESS-EXTENSION.ERROR.NO_FORM');
                return this.handleError(error);
            })
        );
    }

    private findFieldsOfTypeContent(fieldContainers: FormFieldRepresentation[]): UploadWidgetType[] {
        const uploadWidgets = this.filterFieldsByType(this.getFormFields(fieldContainers), StartProcessExtService.UPLOAD);

        if (uploadWidgets.length === 0) {
            this.showWarning('PROCESS-EXTENSION.ERROR.CAN_NOT_ATTACH');
        } else if (this.areAllWidgetsLocalSource(uploadWidgets)) {
            this.showWarning('PROCESS-EXTENSION.ERROR.NO_CONTENT');
        }

        return uploadWidgets
            .filter((res: any) => !this.isLocalSourceWidget(res))
            .map((filteredWidget: any) => <UploadWidgetType> {
                id: filteredWidget.id,
                type: filteredWidget.params.multiple ? StartProcessExtService.MULTIPLE : StartProcessExtService.SINGLE,
                link: filteredWidget.params.link,
            });
    }

    private getFormFields(fieldContainers: FormFieldRepresentation[]): FormFieldRepresentation[] {
        return fieldContainers.map((fieldContainer: any) => [].concat(...Object.values(fieldContainer.fields))).reduce((previous, current) => previous.concat(current));
    }

    private filterFieldsByType(fields: FormFieldRepresentation[], fieldType: string): FormFieldRepresentation[] {
        return fields.filter((widget: any) => widget.type === fieldType);
    }

    private isLocalSourceWidget(uploadWidget: FormFieldRepresentation): boolean {
        return uploadWidget.params.fileSource && uploadWidget.params.fileSource.serviceId === StartProcessExtService.LOCAL_FILE_SOURCE;
    }

    areAllWidgetsLocalSource(uploadWidgets: FormFieldRepresentation[]): boolean {
        return uploadWidgets.length && uploadWidgets.every((uploadWidget) => this.isLocalSourceWidget(uploadWidget));
    }

    areAllWidgetsSingleType(uploadWidgets: UploadWidgetType[]): boolean {
        return uploadWidgets.length && uploadWidgets.every((uploadWidget) => this.isSingleTypeWidget(uploadWidget));
    }

    private isSingleTypeWidget(uploadWidget: FormFieldRepresentation): boolean {
        return uploadWidget.type === StartProcessExtService.SINGLE;
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }

    showWarning(message: string) {
        this.store.dispatch(new SnackbarWarningAction(message));
    }

    showError(message: string) {
        this.store.dispatch(new SnackbarErrorAction(message));
    }
}
