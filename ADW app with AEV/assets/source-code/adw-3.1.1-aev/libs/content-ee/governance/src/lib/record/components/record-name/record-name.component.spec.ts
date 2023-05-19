/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordNameComponent } from './record-name.component';
import { CoreModule, setupTestBed } from '@alfresco/adf-core';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeNode } from '../../rules/mock-data';
import { By } from '@angular/platform-browser';
import { NodeEntry } from '@alfresco/js-api';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('RecordNameComponent', () => {
    let fixture: ComponentFixture<RecordNameComponent>;
    let component: RecordNameComponent;

    setupTestBed({
        imports: [CoreModule.forRoot(), MatIconTestingModule, GovernanceTestingModule],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordNameComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('disabled css', () => {
        it('should show gray color(disabled) if node is stored', () => {
            const node = JSON.parse(JSON.stringify(fakeNode));
            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            component.context = {
                row: {
                    node: node,
                    getValue(key: string) {
                        return key;
                    }
                }
            };
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('.aga-disabled-name'));
            expect(nameElement.nativeElement).toBeTruthy();
        });

        it('should not show gray color(disabled) if node is not stored', () => {
            const node = JSON.parse(JSON.stringify(fakeNode));
            component.context = {
                row: {
                    node: node,
                    getValue(key: string) {
                        return key;
                    }
                }
            };
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('.aga-disabled-name'));
            expect(nameElement).toBeFalsy();
        });
    });

    describe('trimRecordId', () => {
        it('should update the display text', () => {
            const node = JSON.parse(JSON.stringify(fakeNode));
            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            component.context = {
                row: {
                    node: node,
                    getValue(key: string) {
                        return key;
                    }
                },
            };
            spyOn(component.displayText$, 'next').and.callThrough();
            fixture.detectChanges();
            expect(component.displayText$.next).toHaveBeenCalledTimes(2);
        });

        it('should remove the id if it is present', () => {
            const node: NodeEntry = JSON.parse(JSON.stringify(fakeNode));
            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            node.entry.properties['rma:identifier'] = '123';
            node.entry.name = 'abc (123).png';
            component.context = {
                row: {
                    node: node,
                    getValue(key: string) {
                        return key;
                    }
                },
            };
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('[data-automation-id="adf-name-column"]'));
            expect(nameElement.nativeElement.innerHTML.trim()).toEqual('abc.png');
        });

        it('should not remove the id if it is not present', () => {
            const node: NodeEntry = JSON.parse(JSON.stringify(fakeNode));
            node.entry.name = 'abc (123).png';
            component.context = {
                row: {
                    node: node,
                    getValue(key: string) {
                        return node.entry[key];
                    }
                },
            };
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('[data-automation-id="adf-name-column"]'));
            expect(nameElement.nativeElement.innerHTML.trim()).toEqual('abc (123).png');
        });
    });
});
