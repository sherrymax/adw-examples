/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { NodeEntry } from '@alfresco/js-api';
import { isStoredInGlacier, isPendingRestore, isRestored } from '../../rules/glacier-evaluator';

@Component({
    selector: 'aga-glacier-icon',
    templateUrl: './icon.component.html',
})
export class IconComponent {
    @Input()
    node: NodeEntry;

    public isStoredNode(): boolean {
        return isStoredInGlacier(this.node);
    }

    public isPendingRestoreNode(): boolean {
        return isPendingRestore(this.node);
    }

    public isRestoredNode(): boolean {
        return isRestored(this.node);
    }
}
