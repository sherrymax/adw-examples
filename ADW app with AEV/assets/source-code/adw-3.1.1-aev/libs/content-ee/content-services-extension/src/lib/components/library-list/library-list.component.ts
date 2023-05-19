/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AppExtensionService } from '@alfresco-dbp/content-ce/shared';
import { merge, Observable } from 'rxjs';
import { isInfoDrawerOpened, NavigateLibraryAction, SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';
import { ToolbarComponent } from '../shared';
import { finalize } from 'rxjs/operators';
import { SitesService, UserPreferencesService } from '@alfresco/adf-core';
import { SiteEntry, SitePaging } from '@alfresco/js-api';
import { AppHookService } from '@alfresco/aca-shared';

@Component({
    templateUrl: './library-list.component.html',
    styleUrls: ['./library-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LibraryListComponent extends ToolbarComponent implements OnInit, OnDestroy {
    infoDrawerOpened$: Observable<boolean>;
    sites: SitePaging;
    isLoading = true;

    constructor(
        protected appExtensionService: AppExtensionService,
        protected store: Store<any>,
        private sitesService: SitesService,
        private userPreferences: UserPreferencesService,
        private appHookService: AppHookService
    ) {
        super(store, appExtensionService);
        this.infoDrawerOpened$ = this.store.select(isInfoDrawerOpened);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.loadSites(0, this.userPreferences.paginationSize);
        merge(this.appHookService.libraryDeleted, this.appHookService.libraryLeft, this.appHookService.libraryJoined, this.appHookService.libraryUpdated).subscribe(() => {
            this.store.dispatch(new SetSelectedNodesAction([]));
            this.loadSites(0, this.userPreferences.paginationSize);
        });
    }

    loadSites(skipCount, maxItems) {
        this.isLoading = true;
        this.sitesService
            .getSites({ skipCount, maxItems })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe((sites) => (this.sites = sites));
    }

    navigateTo(site: SiteEntry) {
        this.store.dispatch(new NavigateLibraryAction(site.entry.guid));
    }

    updatePagination({ skipCount, maxItems }): void {
        this.loadSites(skipCount, maxItems);
    }
}
