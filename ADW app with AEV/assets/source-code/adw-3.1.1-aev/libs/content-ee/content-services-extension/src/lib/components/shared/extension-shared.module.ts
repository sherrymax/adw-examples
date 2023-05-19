/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { DataTableExtensionComponent } from './data-table-extension/data-table-extension.component';
import { CoreModule } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { SharedToolbarModule } from '@alfresco/aca-shared';

@NgModule({
    imports: [CoreModule, ContentModule, SharedToolbarModule],
    declarations: [DataTableExtensionComponent],
    exports: [DataTableExtensionComponent, SharedToolbarModule],
})
export class ExtensionSharedModule {}
