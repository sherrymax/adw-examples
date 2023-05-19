/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { switchMap, withLatestFrom, map, filter, take } from 'rxjs/operators';
import {
    ProcessFilterCloudModel,
    ProcessFilterCloudService,
    ProcessFilterAction,
    PROCESS_FILTER_ACTION_DELETE
} from '@alfresco/adf-process-services-cloud';
import { AppConfigService } from '@alfresco/adf-core';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { setProcessManagementFilter, navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { SnackbarInfoAction } from '@alfresco-dbp/content-ce/shared/store';
import { FilterType } from '../../../../store/states/extension.state';
import { ProcessCloudFilterAdapter } from '../../models/process-cloud-filter-adapter.model';
import { ProcessListCloudExtComponent } from './process-list-cloud-ext.component';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';

@Component({
    selector: 'apa-process-list-cloud-container-ext',
    templateUrl: './process-list-cloud-container-ext.component.html',
    styleUrls: ['./process-list-cloud-container-ext.component.scss']
})
export class ProcessListCloudContainerExtComponent implements OnInit, OnDestroy {

    @ViewChild('apaProcessListCloudExt')
    processListCloudExtComponent: ProcessListCloudExtComponent;

    appName: string;
    processFilterProperties: any = {
        filterProperties: [],
        sortProperties: [],
        actions: [],
    };

    currentFilter: ProcessFilterCloudModel;
    onDestroy$ = new Subject<boolean>();

    constructor(
        private processService: ProcessFilterCloudService,
        private appConfigService: AppConfigService,
        private route: ActivatedRoute,
        private store: Store<any>
    ) {}

    ngOnInit() {
        this.setupFilterProperties();

        this.route.queryParams
            .pipe(
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([params, appName]) => {
                    this.appName = appName;
                    const model = this.processService.readQueryParams(params);

                    return combineLatest([
                        this.loadFilter(appName, params['filterId'] || params['id'], model),
                        this.waitUntilProcessDefinitionsAreLoaded()
                    ]).pipe(take(1));
                }),
            ).subscribe(([processFilter]) => {
                this.setCurrentFilter(processFilter);
            });
    }

    setCurrentFilter(processFilter: ProcessFilterCloudModel) {
        this.currentFilter = new ProcessFilterCloudModel(processFilter);
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter: processFilter,
                },
            })
        );
    }

    onFilterChange(processFilter: ProcessFilterCloudModel) {
        if (this.processListCloudExtComponent) {
            this.processListCloudExtComponent.fetchCloudPaginationPreference();
        }
        if (processFilter && this.isFilterChanged(this.currentFilter, processFilter)) {
            const processCloudFilter = new ProcessCloudFilterAdapter(processFilter);
            const queryParams = {
                ...this.processService.writeQueryParams(processCloudFilter, Object.keys(processCloudFilter), this.appName, processFilter.id),
                filterId: processFilter.id,
            };

            this.store.dispatch(
                navigateToFilter({
                    filterId: processFilter.id,
                    queryParams,
                })
            );
        }
    }

    onProcessFilterAction(action: ProcessFilterAction) {
        if (action.actionType === PROCESS_FILTER_ACTION_DELETE) {
            this.processService.getProcessFilters(this.appName).subscribe((filters) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_DELETED');
                this.navigateToFilter(filters[0].id);
            });
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
            this.navigateToFilter(action.filter.id);
        }
    }

    private setupFilterProperties() {
        const properties = this.appConfigService.get<Array<any>>('adf-cloud-process-filter-config');
        if (properties) {
            this.processFilterProperties = properties;
        }
    }

    private isFilterChanged(oldValue: ProcessFilterCloudModel, newValue: ProcessFilterCloudModel): boolean {
        const oldKeys = Object.keys(new ProcessCloudFilterAdapter(oldValue));
        const newKeys = Object.keys(new ProcessCloudFilterAdapter(newValue));

        if (oldKeys.length !== newKeys.length) {
            return true;
        }

        for (const key of oldKeys) {
            if (oldValue[key] !== newValue[key]) {
                return true;
            }
        }

        return false;
    }

    private showFilterNotification(key: string) {
        this.store.dispatch(new SnackbarInfoAction(key));
    }

    private navigateToFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId,
            })
        );
    }

    private loadFilter(appName: string, filterId: string, model: ProcessFilterCloudModel) {
        return this.processService.getFilterById(appName, filterId).pipe(
            map((processFilter) => Object.keys(model).length === 1 ? processFilter : model)
        );
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter(areDefinitionsLoaded => areDefinitionsLoaded));
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
