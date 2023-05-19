/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CustomModeledExtensionEffects } from './effects/custom-modeled-extension.effects';
import * as customModeledExtensionServices from './reducers/reducer';

@NgModule({
    imports: [
        CommonModule,
        EffectsModule.forFeature([CustomModeledExtensionEffects]),
        StoreModule.forFeature(customModeledExtensionServices.featureKey, customModeledExtensionServices.reducer),
    ],
})
export class CustomModeledExtensionExtensionStoreModule {}
