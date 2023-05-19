/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { OnDestroy, OnInit, Directive } from '@angular/core';
import { getAppSelection, SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ContentActionRef, SelectionState } from '@alfresco/adf-extensions';
import { AppExtensionService } from '@alfresco-dbp/content-ce/shared';
import { Store } from '@ngrx/store';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class ToolbarComponent implements OnInit, OnDestroy {
    selection: SelectionState;
    actions: Array<ContentActionRef>;
    onDestroy$ = new Subject();

    protected constructor(protected store: Store<any>, protected appExtensionService: AppExtensionService) { }

    ngOnInit(): void {
        this.store
            .select(getAppSelection)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((selection) => {
                this.selection = selection;
            });

        this.appExtensionService.getAllowedToolbarActions()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((actions) => {
                this.actions = actions;
            });
    }

    ngOnDestroy(): void {
        this.store.dispatch(new SetSelectedNodesAction([]));
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    trackByActionId(_: number, action: ContentActionRef) {
        return action.id;
    }
}
