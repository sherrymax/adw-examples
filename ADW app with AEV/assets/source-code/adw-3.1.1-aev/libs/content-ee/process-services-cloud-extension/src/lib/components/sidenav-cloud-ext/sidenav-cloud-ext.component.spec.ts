/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { setupTestBed } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { ProcessServicesCloudTestingModule } from '../../testing/process-services-cloud-testing.module';
import { SidenavCloudExtComponent } from './sidenav-cloud-ext.component';
import { selectProcessManagementFilter } from '../../store/selectors/extension.selectors';

describe('SidenavCloudExtComponent', () => {
    let component: SidenavCloudExtComponent;
    let fixture: ComponentFixture<SidenavCloudExtComponent>;
    let store: Store<any>;

    const mockFilter = {
        id: 'mock-id',
        name: 'name',
        key: 'fake-filter',
        index: 1,
    };

    describe('Process management section', () => {
        setupTestBed({
            imports: [ProcessServicesCloudTestingModule, TranslateModule.forRoot(), MatMenuModule],
            providers: [
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectProcessManagementFilter) {
                                return of([]);
                            } else {
                                return of({});
                            }
                        },
                        dispatch: () => {},
                    },
                },
            ],
            declarations: [SidenavCloudExtComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(SidenavCloudExtComponent);
            component = fixture.componentInstance;
            store = TestBed.inject(Store);
        });

        it('Should mark process management section as active when a filter is selected', () => {
            spyOn(store, 'select').and.returnValue(of(mockFilter));
            component.data = { state: 'expanded' };
            fixture.detectChanges();

            const processManagementButton = fixture.debugElement.query(By.css('[data-automation-id="apa-process-cloud-management-button"'));
            expect(processManagementButton.classes['apa-action-button--active']).toBe(true);
        });
    });
});
