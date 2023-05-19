/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { ExtensionService, ExtensionsModule } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco-dbp/content-ce/shared';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { ProcessListCloudExtComponent } from './components/process-list/process-list-cloud-ext.component';
import { PaginationModule, DataColumnModule } from '@alfresco/adf-core';
import { ProcessListCloudEffects } from '../../store/effects/process-list-cloud.effects';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ProcessListCloudContainerExtComponent } from './components/process-list/process-list-cloud-container-ext.component';
import { ScrollContainerModule } from '../../components/scroll-container/scroll-container.module';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatRippleModule,
        MatIconModule,
        DataColumnModule,
        TranslateModule,
        PageLayoutModule,
        PaginationModule,
        ExtensionsModule,
        ProcessServicesCloudModule,
        ScrollContainerModule,
        EffectsModule.forFeature([ProcessListCloudEffects]),
    ],
    declarations: [ProcessListCloudExtComponent, ProcessListCloudContainerExtComponent],
})
export class ProcessListCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.process-list': ProcessListCloudContainerExtComponent,
        });
    }
}
