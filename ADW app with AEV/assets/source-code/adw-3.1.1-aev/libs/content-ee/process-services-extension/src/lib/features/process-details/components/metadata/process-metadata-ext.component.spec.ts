/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessMetadataExtComponent } from './process-metadata-ext.component';
import { setupTestBed } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeRunningProcessInstance } from '../../../../mock/process-instances.mock';
import { ProcessModule } from '@alfresco/adf-process-services';
import { ProcessServicesTestingModule } from '../../../../testing/process-services-testing.module';

describe('ProcessMetadataExtComponent', () => {
    let component: ProcessMetadataExtComponent;
    let fixture: ComponentFixture<ProcessMetadataExtComponent>;

    setupTestBed({
        imports: [TranslateModule.forRoot(), ProcessModule, ProcessServicesTestingModule],
        declarations: [ProcessMetadataExtComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessMetadataExtComponent);
        component = fixture.componentInstance;
        component.processInstanceDetails = fakeRunningProcessInstance;
    });

    it('should define adf-info-drawer with tab', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfInfoDrawer = fixture.debugElement.nativeElement.querySelector('adf-info-drawer');
        const adfInfoDrawerTab = fixture.debugElement.nativeElement.querySelector('adf-info-drawer-tab');

        expect(adfInfoDrawer).not.toBe(null);
        expect(adfInfoDrawerTab).not.toBe(null);
    });
});
