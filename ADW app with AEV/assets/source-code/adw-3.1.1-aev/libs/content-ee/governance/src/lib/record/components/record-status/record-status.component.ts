/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { NodeEntry } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { isNodeHavingProp } from '../../../core/rules/node.evaluator';
import { filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DeclareRecord } from '../../models/declare-record.model';
import { isFailedRecord } from '../../rules/record.evaluator';
import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { InfoDrawerService } from '../../services/info-drawer.service';
import { RecordService } from '../../services/record.service';
import { isInfoDrawerOpened } from '@alfresco-dbp/content-ce/shared/store';

@Component({
    selector: 'aga-record-status',
    templateUrl: './record-status.component.html',
    styleUrls: ['./record-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RecordStatusComponent implements OnInit, OnDestroy {
    @Input()
    node: NodeEntry;

    private subscriptions: Subscription[] = [];

    isRecord = false;
    isRejectedRecord = false;
    isLoading = false;
    canHideName = false;
    canHideChip = false;

    @ViewChild('divElement') parentElement: ElementRef<HTMLElement>;

    constructor(
        private store: Store<any>,
        private changeDetection: ChangeDetectorRef,
        private router: Router,
        private userPreferencesService: UserPreferencesService,
        private infoDrawerService: InfoDrawerService,
        private recordService: RecordService
    ) {}

    ngOnInit() {
        this.isRecord = this.hasRecordProperties(this.node);
        this.isRejectedRecord = this.hasRejectedRecordProperties(this.node) && !this.router.url.startsWith('/personal-files');
        this.subscriptions = this.subscriptions.concat(this.updateRecordNameStatus(), this.updateRecordLoadingStatus());
    }

    getRecordAction(): string | null {
        if (this.isRecord) {
            return 'record';
        } else if (this.isRejectedRecord) {
            return 'rejectedRecord';
        } else if (this.isLoading) {
            return 'loading';
        }
        return null;
    }

    openRecordInfo(isIcon?: boolean) {
        if (!isIcon) {
            this.parentElement.nativeElement.click();
        }
        this.infoDrawerService.openInfoDrawer('GOVERNANCE.RECORD-PROPERTIES.RECORD_GROUP_TITLE').subscribe(() => {});
    }

    openRejectedRecordInfo(isIcon?: boolean) {
        if (!isIcon) {
            this.parentElement.nativeElement.click();
        }
        this.infoDrawerService.openInfoDrawer('GOVERNANCE.RECORD-PROPERTIES.REJECTED_RECORD_GROUP_TITLE').subscribe(() => {});
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions = [];
    }

    private hasRecordProperties(node: NodeEntry): boolean {
        return isNodeHavingProp(node, 'aspectNames', 'rma:declaredRecord', 'array') || isNodeHavingProp(node, 'aspectNames', 'rma:record', 'array');
    }

    private hasRejectedRecordProperties(node: NodeEntry) {
        return isNodeHavingProp(node, 'aspectNames', 'rma:recordRejectionDetails', 'array');
    }

    private updateRecordNameStatus(): Subscription {
        return combineLatest([
            this.userPreferencesService.onChange.pipe(map((preferences) => preferences[UserPreferenceValues.ExpandedSideNavStatus])),
            this.store.select(isInfoDrawerOpened),
        ]).subscribe(([sidenav, infoDrawer]) => this.updateNameStatus(sidenav, infoDrawer));
    }

    private updateNameStatus(sidenavExpanded: boolean, isDrawerOpened: boolean) {
        this.canHideName = sidenavExpanded && isDrawerOpened;
        this.canHideChip = sidenavExpanded || isDrawerOpened;
        this.changeDetection.markForCheck();
    }

    private updateRecordLoadingStatus(): Subscription {
        return this.recordService.declaredSingleRecord$
            .pipe(filter((recordDeclared: DeclareRecord) => recordDeclared.entry.id === this.node.entry.id))
            .subscribe((node: DeclareRecord) => {
                this.isLoading = false;
                if (node) {
                    this.isLoading = !isFailedRecord(node);
                    this.changeDetection.markForCheck();
                }
            });
    }
}
