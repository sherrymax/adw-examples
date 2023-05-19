/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { getAppSelection } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SiteEntry, SiteMemberPaging } from '@alfresco/js-api';
import { LibraryMemberService } from '../services/library-member.service';

@Component({
    selector: 'adw-info-drawer-member-list',
    templateUrl: './info-drawer-member-list.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class InfoDrawerMemberListComponent implements OnInit, OnDestroy {
    site: SiteEntry;
    loading: Observable<boolean>;
    members: Observable<SiteMemberPaging>;

    private onDestroy$ = new Subject<boolean>();

    constructor(private store: Store<any>, private libraryMemberService: LibraryMemberService) {
        this.members = this.libraryMemberService.members.asObservable();
        this.loading = this.libraryMemberService.loading.asObservable();
    }

    ngOnInit(): void {
        this.store
            .select(getAppSelection)
            .pipe(
                filter((selection) => !!selection.library),
                map((selection) => selection.library),
                takeUntil(this.onDestroy$)
            )
            .subscribe((site) => {
                this.site = site;
                this.libraryMemberService.loadMembers(this.site.entry.id);
            });
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }
}
