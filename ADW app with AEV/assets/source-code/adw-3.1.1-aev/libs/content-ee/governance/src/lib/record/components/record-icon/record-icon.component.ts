/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThumbnailService } from '@alfresco/adf-core';
import { IconComponent } from '../../../core/components/icon/icon.component';

@Component({
    selector: 'aga-icon',
    templateUrl: './record-icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordIconComponent extends IconComponent {
    constructor(thumbnailService: ThumbnailService) {
        super(thumbnailService);
    }
}
