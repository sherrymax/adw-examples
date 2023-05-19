/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, HostBinding, ViewEncapsulation } from '@angular/core';
import { ProcessInstance } from '@alfresco/adf-process-services';

@Component({
    selector: 'aps-process-metadata-ext',
    templateUrl: './process-metadata-ext.component.html',
    styleUrls: ['./process-metadata-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProcessMetadataExtComponent {
    @HostBinding('class.aps-process-metadata') true;

    @Input()
    processInstanceDetails: ProcessInstance;
}
