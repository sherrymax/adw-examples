/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NameColumnComponent } from '@alfresco/adf-content-services';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, ElementRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { isStoredInGlacier } from '../../../glacier/rules/glacier-evaluator';
import { isRecord, trimRecordId, isRejectedRecord } from '../../rules/record.evaluator';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { NodeActionTypes } from '@alfresco-dbp/content-ce/shared/store';
import { isLocked } from '@alfresco-dbp/content-ce/shared';

@Component({
    selector: 'aga-record-column',
    templateUrl: './record-name.component.html',
    styleUrls: ['./record-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'adf-datatable-content-cell adf-name-column' },
})
export class RecordNameComponent extends NameColumnComponent implements OnInit, OnDestroy {
    private onDestroy$$ = new Subject<boolean>();

    constructor(public elementRef: ElementRef, private actions$: Actions, private apiService: AlfrescoApiService, private cd: ChangeDetectorRef) {
        super(elementRef, apiService);
    }

    public isStoredRecord(): boolean {
        return isStoredInGlacier(this.node);
    }

    ngOnInit(): void {
        this.updateValue();

        if (this.node.entry.isFile && isRecord(this.node)) {
            this.displayText$.next(trimRecordId(this.node.entry));
        }

        this.apiService.nodeUpdated.pipe(takeUntil(this.onDestroy$$)).subscribe((node: any) => {
            const row = this.context.row;
            if (row && this.node.entry.id === node.id) {
                const { entry } = row.node;

                entry.name = node.name;
                row.node = { entry };

                this.updateValue();
            }
        });

        this.actions$
            .pipe(
                ofType<any>(NodeActionTypes.EditOffline),
                filter((val) => this.node.entry.id === val.payload.entry.id),
                takeUntil(this.onDestroy$$)
            )
            .subscribe(() => {
                this.cd.detectChanges();
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.onDestroy$$.next(true);
        this.onDestroy$$.complete();
    }

    isRecordNode() {
        return isRecord(this.node);
    }

    isRejectedRecordNode() {
        return isRejectedRecord(this.node);
    }

    isFile(): boolean {
        return this.node && this.node.entry && !this.node.entry.isFolder;
    }

    isFileWriteLocked(): boolean {
        return isLocked(this.node);
    }
}
