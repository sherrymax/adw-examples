/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { AuthGuard, CoreModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { ContentModule } from '@alfresco/adf-content-services';
import { PageLayoutModule, SharedInfoDrawerModule, SharedModule } from '@alfresco-dbp/content-ce/shared';
import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { MaterialModule } from './material.module';
import { LibraryListComponent } from './components/library-list/library-list.component';
import { MembershipRequestsNotificationsComponent } from './components/notifications/membership-requests-notifications.component';
import { isContentServicePluginEnabled, isMemberManagement } from './rules/content-services.rules';
import { DataTableDirective } from './directives/data-table.directive';
import { ExtensionEffects } from './store/effects/extension.effects';
import { InfoDrawerMemberListComponent, LibraryDetailsComponent, LibraryMemberManagementModule } from './components/library-member-management';
import { ExtensionSharedModule } from './components/shared';
import { AcaFolderRulesModule } from '@alfresco/aca-folder-rules';

export const effects = [ExtensionEffects];

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        ExtensionsModule,
        SharedModule.forRoot(),
        CoreModule,
        ContentModule,
        PageLayoutModule,
        FlexLayoutModule,
        TranslateModule,
        SharedInfoDrawerModule,
        EffectsModule.forFeature(effects),
        A11yModule,
        LibraryMemberManagementModule,
        ExtensionSharedModule,
        AcaFolderRulesModule
    ],
    declarations: [LibraryListComponent, DataTableDirective, MembershipRequestsNotificationsComponent],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'content-services-extension',
                source: 'assets/adf-content-services-extension',
            },
        },
        provideExtensionConfig(['content-services-extension.json']),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'never' } },
    ],
})
export class ContentServicesExtensionModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'content-services.components.library-list': LibraryListComponent,
            'content-services.components.library-requests-notification': MembershipRequestsNotificationsComponent,
            'content-services.components.members': InfoDrawerMemberListComponent,
            'content-services.components.member-manager': LibraryDetailsComponent,
        });

        extensions.setAuthGuards({
            'content-services.auth': AuthGuard,
        });

        extensions.setEvaluators({
            'app.content-services.isEnabled': isContentServicePluginEnabled,
            'app.content-services.isMemberManagement': isMemberManagement,
        });
    }
}
