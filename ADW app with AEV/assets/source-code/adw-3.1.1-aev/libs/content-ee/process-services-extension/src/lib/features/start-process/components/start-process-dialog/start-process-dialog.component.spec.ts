/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentEeSharedUiModule, ProcessListByCategoryComponent } from '@alfresco-dbp/content-ee/shared/ui';
import { StartProcessDialogComponent } from './start-process-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppsProcessService } from '@alfresco/adf-core';
import { ProcessDefinitionRepresentation, ProcessService } from '@alfresco/adf-process-services';
import { AppDefinitionRepresentation } from '@alfresco/js-api';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { createProcessesDefinitionRepresentationMock } from '../../../../mock/process-definition-representation.mock';

type AppsProcessServiceMock = Pick<AppsProcessService, 'getDeployedApplications'>;
type ProcessServiceMock = Pick<ProcessService, 'getProcessDefinitions'>;

describe('StartProcessDialogComponent', () => {
    let fixture: ComponentFixture<StartProcessDialogComponent>;
    let appOneProcesses: ProcessDefinitionRepresentation[];
    let appTwoProcesses: ProcessDefinitionRepresentation[];
    let appDefinitionRepresentation: AppDefinitionRepresentation[];

    const appsProcessServiceMock: AppsProcessServiceMock = {
        getDeployedApplications() { return of(appDefinitionRepresentation); },
    };

    const processServiceMock: ProcessServiceMock = {
        getProcessDefinitions(appId?: number) {
            let processes: ProcessDefinitionRepresentation[] = [];

            switch (appId) {
            case appDefinitionRepresentation[0].id:
                processes = appOneProcesses;
                break;

            case appDefinitionRepresentation[1].id:
                processes = appTwoProcesses;
                break;
            }

            return of(processes);
        }
    };

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        appOneProcesses = createProcessesDefinitionRepresentationMock();
        appTwoProcesses = createProcessesDefinitionRepresentationMock();

        appDefinitionRepresentation = [{
            id: 1,
            name: 'app1'
        }, {
            id: 2,
            name: 'app2'
        }, {
            id: undefined,
            name: 'default application'
        }];

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ContentEeSharedUiModule,
                NoopAnimationsModule,
                MatIconModule,
                MatSelectModule,
                MatFormFieldModule,
                ReactiveFormsModule,
            ],
            providers: [
                {
                    provide: AppsProcessService,
                    useValue: appsProcessServiceMock
                },
                {
                    provide: ProcessService,
                    useValue: processServiceMock
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                }
            ],
            declarations: [StartProcessDialogComponent]
        });

        fixture = TestBed.createComponent(StartProcessDialogComponent);
        fixture.detectChanges();
    });

    describe('one application definition', () => {
        beforeEach(() => {
            appDefinitionRepresentation = [appDefinitionRepresentation[0]];

            fixture = TestBed.createComponent(StartProcessDialogComponent);
            fixture.detectChanges();
        });

        it('should use by default application processes if there is only one application available', () => {
            const processListByCategory = fixture.debugElement.query(
                By.css('process-list-by-category')
            ).componentInstance as ProcessListByCategoryComponent;

            expect(processListByCategory.processes).toEqual(appOneProcesses);
        });
    });

    describe('more than one application definitions', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(StartProcessDialogComponent);
            fixture.detectChanges();
        });

        it('should use empty list of processes if more than one application is found', () => {
            const processListByCategory = fixture.debugElement.query(
                By.css('process-list-by-category')
            ).componentInstance as ProcessListByCategoryComponent;

            expect(processListByCategory.processes).toEqual([]);
        });

        it('should remove default applications (application without id)', async () => {
            const selector = fixture.debugElement.query(By.css('[data-automation-id="aca-start-process-dialog-application-selector-id"]')).nativeElement;
            selector.click();

            fixture.detectChanges();
            await fixture.whenStable();

            const options = fixture.debugElement.queryAll(By.css('mat-option'));
            expect(options.length).toBe(2);
            expect(options[0].nativeElement.textContent.trim()).toBe(appDefinitionRepresentation[0].name);
            expect(options[1].nativeElement.textContent.trim()).toBe(appDefinitionRepresentation[1].name);
        });

        it('should use selected application processes', async () => {
            const selector = fixture.debugElement.query(
                By.css('[data-automation-id="aca-start-process-dialog-application-selector-id"]')
            ).nativeElement;

            selector.click();

            fixture.detectChanges();
            await fixture.whenStable();

            const options = fixture.debugElement.queryAll(By.css('mat-option'));
            options[0].nativeElement.click();

            fixture.detectChanges();
            await fixture.whenStable();

            const processListByCategory = fixture.debugElement.query(
                By.css('process-list-by-category')
            ).componentInstance as ProcessListByCategoryComponent;

            expect(processListByCategory.processes).toEqual(appOneProcesses);
        });
    });
});
