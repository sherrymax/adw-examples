/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { setupTestBed } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { fakeNode } from '../../rules/mock-data';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { getToolTipMessage } from '../../../testing/utils';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('IconComponent', () => {
    let component: IconComponent;
    let fixture: ComponentFixture<IconComponent>;

    setupTestBed({
        imports: [MatIconTestingModule, GovernanceTestingModule],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IconComponent);
        component = fixture.componentInstance;
        component.node = JSON.parse(JSON.stringify(fakeNode));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should show is store icon if node is stored', () => {
        component.node.entry.aspectNames = ['gl:archived', 'rma:record'];
        component.node.entry.properties['gl:contentState'] = 'ARCHIVED';
        fixture.detectChanges();
        const icon = fixture.debugElement.query(By.css('[data-automation-id="aga-store-icon"]'));
        expect(icon).toBeTruthy();
        expect(getToolTipMessage(icon)).toEqual('GOVERNANCE.GLACIER.ICONS-TOOLTIP-MESSAGE.STORE');
    });

    it('should show is load icon if node is pending', () => {
        component.node.entry.aspectNames = ['gl:archived', 'rma:record'];
        component.node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
        fixture.detectChanges();
        const icon = fixture.debugElement.query(By.css(`[data-automation-id="aga-pending-store-icon"]`));
        expect(icon.nativeElement).toBeTruthy();
        expect(getToolTipMessage(icon)).toEqual('GOVERNANCE.GLACIER.ICONS-TOOLTIP-MESSAGE.PENDING-RESTORE');
    });

    it('should show restore icon if node is restored', () => {
        component.node.entry.aspectNames = ['gl:archived', 'rma:record'];
        component.node.entry.properties['gl:contentState'] = 'RESTORED';
        fixture.detectChanges();
        const restore = fixture.debugElement.query(By.css('[data-automation-id="aga-restore-icon"]'));
        expect(restore.nativeElement).toBeTruthy();
        expect(getToolTipMessage(restore)).toEqual('GOVERNANCE.GLACIER.ICONS-TOOLTIP-MESSAGE.RESTORED');
    });
});
