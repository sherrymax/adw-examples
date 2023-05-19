/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ElementRef, ViewEncapsulation } from '@angular/core';
import { NameColumnComponent } from '@alfresco/adf-content-services';
import { Subject } from 'rxjs';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'ooi-resume-active-session',
    templateUrl: './resume-active-session.component.html',
    styleUrls: ['./resume-active-session.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ResumeActiveSessionComponent extends NameColumnComponent implements OnInit, OnDestroy {
    private onDestroy$$ = new Subject<boolean>();
    private iconPath = './assets/icons/ic_pencil.svg';

    constructor(element: ElementRef, private apiService: AlfrescoApiService) {
        super(element, apiService);
    }

    ngOnInit() {
        this.updateValue();

        this.apiService.nodeUpdated.pipe(takeUntil(this.onDestroy$$)).subscribe((node: any) => {
            const row = this.context.row;
            if (row) {
                const { entry } = row.node;
                const currentId = entry.nodeId || entry.id;
                const updatedId = node.nodeId || node.id;

                if (currentId === updatedId) {
                    entry.name = node.name;
                    row.node = { entry };
                    this.updateValue();
                }
            }
        });
    }

    get getIconPath(): string {
        return this.iconPath;
    }

    isBeingEditedInMicrosoft(): boolean {
        return (
            this.node?.entry?.aspectNames?.indexOf('ooi:editingInMSOffice') !== -1 &&
            this.node?.entry?.properties?.['ooi:sessionNodeId'] === this.node?.entry?.id &&
            this.node?.entry?.properties?.['ooi:acsSessionOwner'] === this.node?.entry?.properties?.['cm:lockOwner']?.id &&
            localStorage.getItem('microsoftOnline') !== null
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.onDestroy$$.next(true);
        this.onDestroy$$.complete();
    }
}
