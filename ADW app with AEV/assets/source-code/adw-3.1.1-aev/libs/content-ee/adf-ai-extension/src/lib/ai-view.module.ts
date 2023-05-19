/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CoreModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { AiViewComponent } from './ai-view.component';
import { RenditionViewerService } from './rendition-viewer.service';
import { DrawService } from './draw.service';
import { MaterialModule } from './material.module';
import { AiViewExtensionService } from './ai-view-extension.service';
import { A11yModule } from '@angular/cdk/a11y';

export function components() {
    return [AiViewComponent];
}

@NgModule({
    imports: [CoreModule, BrowserModule, FormsModule, MaterialModule, A11yModule],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'adf-ai-extension',
                source: 'assets/adf-ai-extension',
            },
        },
        RenditionViewerService,
        DrawService,
        AiViewExtensionService,
        provideExtensionConfig(['ai-view-extension.json']),
    ],
    declarations: components(),
    exports: components(),
})
export class AiViewModule {
    constructor(extensions: ExtensionService, aiService: AiViewExtensionService) {
        extensions.setComponents({
            'ai-extension.main.component': AiViewComponent,
        });
        extensions.setEvaluators({
            'ai.viewer.disabled': () => !aiService.isSmartViewerEnabled(),
            'ai.plugin.enabled': () => aiService.isExtensionEnabled()
        });
    }
}
