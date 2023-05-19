/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject, timer } from 'rxjs';
import { ActionService } from '../../core/services/action.service';
import { infoDrawerMetadataAspect, SetInfoDrawerMetadataAspectAction, SetInfoDrawerStateAction } from '@alfresco-dbp/content-ce/shared/store';

@Injectable({
    providedIn: 'root',
})
export class InfoDrawerService implements OnDestroy {
    private hasValidSelection: boolean;
    private displayAspect: string;
    private destroy$ = new Subject<boolean>();

    constructor(private store: Store<any>, private actionService: ActionService) {
        this.actionService
            .onRecordSelection()
            .pipe(takeUntil(this.destroy$))
            .subscribe((isValidSelection: boolean) => {
                this.hasValidSelection = isValidSelection;
                if (isValidSelection) {
                    this.resetStoreAspect();
                } else {
                    this.setMetaDataAspect(null);
                }
            });
        this.store
            .select(infoDrawerMetadataAspect)
            .pipe(takeUntil(this.destroy$))
            .subscribe((aspect) => (this.displayAspect = aspect));
    }

    public openInfoDrawer(state): Observable<any> {
        return timer(300).pipe(
            tap(() => {
                this.store.dispatch(new SetInfoDrawerStateAction(this.hasValidSelection));
                this.setMetaDataAspect(state);
            })
        );
    }

    public setMetaDataAspect(state: 'Record' | 'Properties') {
        this.store.dispatch(new SetInfoDrawerMetadataAspectAction(state));
    }

    private resetStoreAspect() {
        const isValidReset = this.displayAspect !== 'Properties';
        if (isValidReset) {
            this.setMetaDataAspect('Properties');
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
