/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { ProcessServiceExtensionState } from '../../store/reducers/process-services.reducer';
import { getTaskFilters, isProcessManagementExpanded, getSelectedFilter } from '../../process-services-ext.selector';
import { ProcessServicesExtActions } from '../../process-services-ext-actions-types';
import { FilterRepresentationModel } from '@alfresco/adf-process-services';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';
import { NavigationStart, Router } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'aps-sidenav-ext',
    templateUrl: './sidenav-ext.component.html',
    styleUrls: ['./sidenav-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SidenavExtComponent implements OnInit, OnDestroy {
    @Input()
    data: any;

    processManagementExpanded$: Observable<boolean>;
    private onDestroy$ = new Subject<boolean>();

    currentFilter: UserProcessInstanceFilterRepresentation | FilterRepresentationModel;

    constructor(private store: Store<ProcessServiceExtensionState>,
                private router: Router,
                private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationStart),
                takeUntil(this.onDestroy$)
            )
            .subscribe((navigationStart: NavigationStart) => {
                if (this.isNotProcessServicesUrl(navigationStart.url)) {
                    this.resetProcessManagement();
                }
            });

        this.loadFilters();
        this.processManagementExpanded$ = this.store.select(isProcessManagementExpanded);

        this.store.select(getSelectedFilter).pipe(takeUntil(this.onDestroy$))
            .subscribe((selectedFilter) => {
                this.currentFilter = selectedFilter;
                this.changeDetectorRef.detectChanges();
            });
    }

    private isNotProcessServicesUrl(url: string): boolean {
        return !url.includes('process') && !url.includes('task');
    }

    isExpanded(): boolean {
        return this.data.state === 'expanded';
    }

    toggleProcessManagement(expanded: boolean) {
        this.store.dispatch(
            ProcessServicesExtActions.toggleProcessManagement({
                expanded,
            })
        );
        if (expanded && !this.currentFilter) {
            this.navigateToDefaultTaskFilter();
        }
    }

    processFilterSelected(selectedFilter: UserProcessInstanceFilterRepresentation) {
        this.dispatchSelectFilterAction(selectedFilter);
    }

    taskFilterSelected(selectedFilter: UserProcessInstanceFilterRepresentation | FilterRepresentationModel) {
        this.dispatchSelectFilterAction(selectedFilter);
    }

    dispatchSelectFilterAction(selectedFilter: UserProcessInstanceFilterRepresentation | FilterRepresentationModel) {
        this.store.dispatch(
            ProcessServicesExtActions.selectFilterAction({
                filter: selectedFilter,
            })
        );
    }

    private navigateToDefaultTaskFilter() {
        this.store
            .select(getTaskFilters)
            .pipe(filter(filters => !!filters.length), take(1))
            .subscribe((taskFilters) => {
                if (taskFilters) {
                    this.store.dispatch(ProcessServicesExtActions.navigateToDefaultTaskFilter({}));
                }
            });
    }

    private resetProcessManagement() {
        this.toggleProcessManagement(false);
        this.dispatchSelectFilterAction(undefined);
    }

    loadFilters() {
        this.store.dispatch(ProcessServicesExtActions.loadFiltersAction({}));
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }
}
