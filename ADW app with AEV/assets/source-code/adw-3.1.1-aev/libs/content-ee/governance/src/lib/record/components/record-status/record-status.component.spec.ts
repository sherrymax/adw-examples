/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RecordStatusComponent } from './record-status.component';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { NodeEntry } from '@alfresco/js-api';
import { setupTestBed, UserPreferencesService } from '@alfresco/adf-core';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { Actions } from '@ngrx/effects';
import { By } from '@angular/platform-browser';
import { DeclareRecordAction } from '../../actions/record.action';
import { Router } from '@angular/router';
import { DeclareRecord } from '../../models/declare-record.model';
import { fakeNode, fakeRecord, fakeRejectedNode } from '../../rules/mock-data';
import { Store } from '@ngrx/store';
import { getToolTipMessage } from '../../../testing/utils';
import { infoDrawerMetadataAspect, SetInfoDrawerStateAction, SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('RecordStatusComponent', () => {
    let fixture: ComponentFixture<RecordStatusComponent>;
    let component: RecordStatusComponent;
    const dialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open')
    };
    const storeSelection = new Subject();
    let router: Router;
    let store: Store<any>;
    let dispatchMock: jasmine.Spy;

    const userPreferenceMock = {
        onChange: new Subject(),
    };

    const fakeNodeRecord = JSON.parse(JSON.stringify(fakeRecord));
    const fakeNodeRecordRejected = JSON.parse(JSON.stringify(fakeRejectedNode));

    setupTestBed({
        imports: [GovernanceTestingModule, MatIconTestingModule],
        providers: [
            { provide: MatDialog, useValue: dialogRef },
            { provide: Actions, useValue: storeSelection },
            { provide: UserPreferencesService, useValue: userPreferenceMock },
            {
                provide: Store,
                useValue: {
                    select: (selector) => {
                        if (selector === infoDrawerMetadataAspect) {
                            return of('');
                        } else {
                            return of({});
                        }
                    },
                    dispatch: () => {},
                },
            }
        ],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordStatusComponent);
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        dispatchMock = spyOn(store, 'dispatch').and.callThrough();
        spyOn(store, 'select').and.returnValue(of(true));
        component = fixture.componentInstance;
        component.node = fakeNodeRecord;
    });

    afterEach(() => {
        fixture.destroy();
        dispatchMock['calls'].reset();
    });

    describe('record Icon', () => {
        it('should add record Icon when node is record', () => {
            fixture.detectChanges();
            expect(component.isRecord).toBeTruthy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon.nativeElement.getAttribute('svgicon')).toEqual('record');
            expect(getToolTipMessage(icon)).toContain('GOVERNANCE.RECORD-NAME.ICONS-TOOLTIP-MESSAGE.RECORD');
            const hyperlink = fixture.debugElement.query(By.css('.adf-record-name span'));
            expect(hyperlink.nativeElement.innerHTML.trim()).toEqual('GOVERNANCE.RECORD-NAME.TITLE');
            expect(getToolTipMessage(hyperlink)).toContain('GOVERNANCE.RECORD-NAME.ICONS-TOOLTIP-MESSAGE.RECORD-HYPERLINK');
        });

        it('should not add record icon when node is null', () => {
            component.node = new NodeEntry();
            fixture.detectChanges();
            expect(component.isRecord).toBeFalsy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon).toBeFalsy();
        });

        it('should not add record icon when node is not record', () => {
            component.node = <any>{ entry: { id: 'id' } };
            fixture.detectChanges();
            expect(component.isRecord).toBeFalsy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon).toBeFalsy();
        });
    });

    describe('reject Icon', () => {
        it('should add the icon when node is rejected', () => {
            spyOnProperty(router, 'url').and.returnValue('/fake-url');
            component.node = fakeNodeRecordRejected;
            fixture.detectChanges();
            expect(component.isRejectedRecord).toBeTruthy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon.nativeElement.getAttribute('svgicon')).toEqual('rejected');
            expect(getToolTipMessage(icon)).toContain('GOVERNANCE.RECORD-NAME.ICONS-TOOLTIP-MESSAGE.REJECTED-RECORD');
            const hyperlink = fixture.debugElement.query(By.css('.adf-reject-name span'));
            expect(hyperlink.nativeElement.innerHTML.trim()).toEqual('GOVERNANCE.RECORD-NAME.REJECT');
            expect(getToolTipMessage(hyperlink)).toContain('GOVERNANCE.RECORD-NAME.ICONS-TOOLTIP-MESSAGE.REJECTED-RECORD-HYPERLINK');
        });

        it('should not add the icon when node url having personal', () => {
            spyOnProperty(router, 'url').and.returnValue('/personal-files');
            component.node = fakeNodeRecordRejected;
            fixture.detectChanges();
            expect(component.isRejectedRecord).toBeFalsy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon).toBeFalsy();
        });

        it('should not add icon when node neither record and rejected', () => {
            component.node = <any>{ entry: { id: 'id' } };
            fixture.detectChanges();
            expect(component.isRecord).toBeFalsy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon).toBeFalsy();
        });

        it('should not add the icon when node is null', () => {
            component.node = new NodeEntry();
            fixture.detectChanges();
            expect(component.isRejectedRecord).toBeFalsy();
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            expect(icon).toBeFalsy();
        });
    });

    describe('loading Icon', () => {
        beforeEach(() => {
            component.node = <NodeEntry>{ entry: { id: 'id' } };
            fixture.detectChanges();
        });

        it('should not show loading icon when declare-record action is not triggered', () => {
            storeSelection.next(new DeclareRecordAction([<DeclareRecord>{ entry: { id: 'fake-id' } }]));
            const icon = fixture.debugElement.query(By.css('.adf-record-loading-icon'));
            expect(icon).toBeFalsy();
            const isLoading = fixture.debugElement.query(By.css('.adf-record-loading-spinner'));
            expect(isLoading).toBeFalsy();
        });

        it('should show loading icon when declare-record action is triggered', () => {
            storeSelection.next(new DeclareRecordAction([<DeclareRecord>{ entry: { id: 'id' } }]));
            fixture.detectChanges();
            const isLoading = fixture.debugElement.query(By.css('.adf-record-loading-spinner'));
            expect(isLoading).toBeTruthy();
        });

        it('should not show loading icon when declare-record action is failed', () => {
            storeSelection.next(
                new DeclareRecordAction([
                    <DeclareRecord>{
                        entry: { id: 'fake-id' },
                        status: 'failed',
                    },
                ])
            );
            const icon = fixture.debugElement.query(By.css('.adf-record-loading-icon'));
            expect(icon).toBeFalsy();
            const isLoading = fixture.debugElement.query(By.css('.adf-record-loading-spinner'));
            expect(isLoading).toBeFalsy();
        });
    });

    describe('Open Drawer', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should call the open drawer when we click', () => {
            spyOn(component, 'openRecordInfo');
            const icon = fixture.debugElement.query(By.css('.adf-action-icon'));
            icon.nativeElement.click();
            expect(component.openRecordInfo).toHaveBeenCalled();

            const label = fixture.debugElement.query(By.css('.adf-record-name'));
            label.nativeElement.click();
            expect(component.openRecordInfo).toHaveBeenCalled();
        });

        it('should open the drawer', fakeAsync(() => {
            storeSelection.next(
                new SetSelectedNodesAction([
                    <NodeEntry>{
                        entry: { id: 'id', aspectNames: ['rma:record'] },
                    },
                ])
            );
            component.openRecordInfo();
            tick(400);
            const dispatchedAction = store.dispatch['calls'].argsFor(1);
            expect(dispatchedAction[0]).toEqual(new SetInfoDrawerStateAction(true));
        }));

        it('should close the drawer when we click again', fakeAsync(() => {
            storeSelection.next(new SetSelectedNodesAction());
            component.openRecordInfo();
            tick(400);
            component.openRecordInfo();
            tick(400);
            const dispatchedAction = store.dispatch['calls'].argsFor(1);
            expect(dispatchedAction[0]).toEqual(new SetInfoDrawerStateAction(false));
        }));
    });

    describe('Name', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should hide name section', async () => {
            userPreferenceMock.onChange.next({ expandedSidenav: true });

            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.canHideName).toBeTruthy();
        });

        it('select show the name', async () => {
            userPreferenceMock.onChange.next({ expandedSidenav: false });
            await fixture.whenStable();

            expect(component.canHideName).toBeFalsy();
            const selector = `[data-automation-id="record-title"]`;
            expect(fixture.nativeElement.querySelector(selector).textContent).toBe('GOVERNANCE.RECORD-NAME.TITLE');
        });
    });

    describe('store Icon', () => {
        beforeEach(() => {
            component.node = JSON.parse(JSON.stringify(fakeNode));
        });

        it('should not show store icon when node is not stored', () => {
            fixture.detectChanges();
            const icon = fixture.debugElement.query(By.css('[data-automation-id="aga-store-icon"]'));
            expect(icon).toBeFalsy();
        });

        it('should show store icon when node is stored', () => {
            component.node.entry.aspectNames = ['gl:archived', 'rma:record'];
            component.node.entry.properties['gl:contentState'] = 'ARCHIVED';
            fixture.detectChanges();
            const icon = fixture.debugElement.query(By.css(`[data-automation-id="aga-store-icon"]`));
            expect(icon.nativeElement).toBeTruthy();
        });
    });

    describe('Pending Store Icon', () => {
        beforeEach(() => {
            component.node = JSON.parse(JSON.stringify(fakeNode));
        });

        it('should not show pending restore icon when node is not in pending', () => {
            fixture.detectChanges();
            const icon = fixture.debugElement.query(By.css('[data-automation-id="aga-pending-store-icon"]'));
            expect(icon).toBeFalsy();
        });

        it('should show pending restore icon when node is in pending', () => {
            component.node.entry.aspectNames = ['gl:archived', 'rma:record'];
            component.node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            fixture.detectChanges();
            const icon = fixture.debugElement.query(By.css(`[data-automation-id="aga-pending-store-icon"]`));
            expect(icon.nativeElement).toBeTruthy();
        });
    });
});
