/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Node, NodeEntry } from '@alfresco/js-api';
import { isLocked } from '../../rules/node.evaluator';
import { ThumbnailService } from '@alfresco/adf-core';

@Component({
    selector: 'aga-icon',
    templateUrl: './icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
    @Input()
    node: NodeEntry;

    icon: string;
    isIconAvailable = false;

    constructor(private thumbnailService: ThumbnailService) {}

    ngOnInit() {
        const iconType = this.getIcon(this.node);
        this.isIconAvailable = iconType.type !== 'image';
        this.icon = iconType.icon;
    }

    getIcon(node: NodeEntry): { type: 'record' | 'existing' | 'image'; icon: string } {
        if (isLocked(node)) {
            return {
                type: 'image',
                icon: 'assets/images/baseline-lock-24px.svg',
            };
        }

        const mimeType = this.getMime(node.entry);
        const mimeIconUrl = this.thumbnailService.getMimeTypeIcon(mimeType);
        const defaultIconUrl = this.thumbnailService.getDefaultMimeTypeIcon();
        if (mimeIconUrl !== defaultIconUrl) {
            return { type: 'existing', icon: `adf:${mimeType}` };
        }
        return { type: 'image', icon: defaultIconUrl };
    }

    private getMime(node: Node): string {
        if (node.isFile) {
            return node.content && node.content.mimeType;
        }
        return 'folder';
    }
}
