/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

@NgModule({
    providers: [provideExtensionConfig(['app.actions-order.json'])],
})
export class ExtensionsOrderExtensionModule {}
