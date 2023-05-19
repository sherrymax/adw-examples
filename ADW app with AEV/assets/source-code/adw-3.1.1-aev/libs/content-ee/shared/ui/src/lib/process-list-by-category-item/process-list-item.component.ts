/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ListByCategoryProcess } from '../process-list-by-category/process-list-by-category.component';

@Component({
    selector: 'process-list-item',
    templateUrl: './process-list-item.component.html',
    styleUrls: ['./process-list-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessListByCategoryItemComponent {
    @Input() process: ListByCategoryProcess;

    @Output() selectProcess = new EventEmitter<ListByCategoryProcess>();
}
