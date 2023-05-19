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
import { ProcessHealthEffects } from './effects/process-health.effects';
import * as fromProcessServices from './reducers/process-services.reducer';
import { FiltersEffects } from './effects/filters.effects';

@NgModule({
    imports: [CommonModule, EffectsModule.forFeature([ProcessHealthEffects, FiltersEffects]), StoreModule.forFeature(fromProcessServices.featureKey, fromProcessServices.reducer)],
})
export class ProcessServicesExtensionStoreModule {}
