/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterContentInit, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConfigService, ContentService, DataTableComponent, DataTableSchema, ShowHeaderMode, ThumbnailService } from '@alfresco/adf-core';
import { NodePaging, ShareDataTableAdapter } from '@alfresco/adf-content-services';

@Component({
    selector: 'adw-data-table-extension',
    templateUrl: './data-table-extension.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class DataTableExtensionComponent extends DataTableSchema implements AfterContentInit {
    static PRESET_KEY = 'extension.preset';

    @Input()
    loading = true;

    @Input()
    showHeader: ShowHeaderMode = ShowHeaderMode.Always;

    @Input()
    selectionMode = 'multiple';

    @Input()
    contextMenu = false;

    @Input()
    set items(nodePaging: NodePaging) {
        if (this.data) {
            this.data.loadPage(nodePaging);
        }
    }

    @Input()
    sorting = ['title', 'asc'];

    @Output()
    showRowContextMenu = new EventEmitter();

    @ViewChild(DataTableComponent)
    dataTable: DataTableComponent;

    data: ShareDataTableAdapter;

    constructor(appConfig: AppConfigService, private thumbnailService: ThumbnailService, private contentService: ContentService) {
        super(appConfig, DataTableExtensionComponent.PRESET_KEY, {});
        this.data = new ShareDataTableAdapter(this.thumbnailService, this.contentService, null, null, null);
        this.data.setImageResolver(this.imageResolver);
    }

    ngAfterContentInit() {
        this.createDatatableSchema();
    }

    imageResolver(): string {
        return 'assets/images/baseline-library_books-24px.svg';
    }
}
