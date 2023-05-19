/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { ContentLinkModel, ProcessContentService, DownloadService, LogService } from '@alfresco/adf-core';
import { Location } from '@angular/common';
import { ProcessServiceExtensionState } from '../../../../store/reducers/process-services.reducer';
import { Store } from '@ngrx/store';
import { getAttachedContent } from '../../../../process-services-ext.selector';

@Component({
    selector: 'aps-file-preview-ext',
    templateUrl: './file-preview-ext.component.html',
})
export class FilePreviewExtComponent implements OnInit {
    content: ContentLinkModel;
    showViewer = true;
    constructor(
        private processContentService: ProcessContentService,
        private downloadService: DownloadService,
        private logService: LogService,
        private location: Location,
        private store: Store<ProcessServiceExtensionState>
    ) {}

    ngOnInit() {
        this.store.select(getAttachedContent).subscribe((content) => {
            this.content = content;
        });
    }

    onViewerVisibilityChanged() {
        this.location.back();
    }

    public downloadContent(): void {
        this.processContentService.getFileRawContent(this.content.id).subscribe(
            (blob: Blob) => this.downloadService.downloadBlob(blob, this.content.name),
            (err) => {
                this.logService.error(err);
            }
        );
    }
}
