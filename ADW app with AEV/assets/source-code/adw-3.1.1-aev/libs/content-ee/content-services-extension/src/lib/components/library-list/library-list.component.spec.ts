/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContentServicesTestingModule } from '../../testing/content-services-testing.module';
import { PageLayoutModule, SharedInfoDrawerModule, SharedToolbarModule } from '@alfresco-dbp/content-ce/shared';
import { AppConfigService, CoreModule, setupTestBed, SitesService, ThumbnailService } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { fakeLibrary, fakeLibraryListDatatableSchema } from '../../mock/library-mock';
import { LibraryListComponent } from './library-list.component';
import { DataTableExtensionComponent } from '../shared';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { ExtensionEffects } from '../../store/effects/extension.effects';
import { AppStore, NavigateLibraryAction } from '@alfresco/aca-shared/store';

describe('LibraryListComponent', () => {
    let sitesService: SitesService;
    let thumbnailService: ThumbnailService;
    let fixture: ComponentFixture<LibraryListComponent>;
    let store: Store<AppStore>;
    let appConfig: AppConfigService;

    setupTestBed({
        imports: [
            ContentServicesTestingModule,
            CoreModule,
            SharedToolbarModule,
            SharedInfoDrawerModule,
            TranslateModule.forRoot(),
            PageLayoutModule,
            EffectsModule.forRoot([ExtensionEffects]),
        ],
        declarations: [LibraryListComponent, DataTableExtensionComponent],
        providers: [{ provide: Store, useValue: { dispatch: () => null, select: () => of([]) } }],
        schemas: [NO_ERRORS_SCHEMA],
    });

    describe('With Content', () => {
        beforeEach(() => {
            appConfig = TestBed.inject(AppConfigService);
            appConfig.config = Object.assign(appConfig.config, fakeLibraryListDatatableSchema);

            fixture = TestBed.createComponent(LibraryListComponent);
            store = TestBed.inject(Store);
            sitesService = TestBed.inject(SitesService);
            thumbnailService = TestBed.inject(ThumbnailService);
            spyOn(sitesService, 'getSites').and.returnValue(of(fakeLibrary));
            spyOn(thumbnailService, 'getDocumentThumbnailUrl').and.returnValue('http://fake');
            fixture.detectChanges();
        });

        it('Should display the available sites', async () => {
            await fixture.whenStable();
            fixture.detectChanges();

            const adfSiteList = fixture.debugElement.nativeElement.querySelector('.adf-datatable');
            expect(adfSiteList).toBeDefined();
            const list = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-body adf-datatable-row');
            expect(list.length).toBe(2);
            const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_fake-desc"]`));
            const value2 = fixture.debugElement.query(By.css(`[data-automation-id="text_blog-desc"]`));
            expect(value1.nativeElement.innerText.trim()).toBe('fake-desc');
            expect(value2.nativeElement.innerText.trim()).toBe('blog-desc');
        });

        it('Should dispatch navigate action on enter of row', async () => {
            await fixture.whenStable();
            fixture.detectChanges();

            spyOn(store, 'dispatch').and.stub();
            const event = new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' } as KeyboardEventInit);
            const firstRow = document.querySelectorAll('.adf-datatable-body .adf-datatable-row')[0];
            firstRow.dispatchEvent(event);
            expect(store.dispatch).toHaveBeenCalledWith(new NavigateLibraryAction(fakeLibrary.list.entries[0].entry.guid));
        });
    });

    describe('With no content', () => {
        beforeEach(() => {
            appConfig = TestBed.inject(AppConfigService);
            appConfig.config = Object.assign(appConfig.config, fakeLibraryListDatatableSchema);

            fixture = TestBed.createComponent(LibraryListComponent);
            sitesService = TestBed.inject(SitesService);
            spyOn(sitesService, 'getSites').and.returnValue(of({ list: { entries: [], pagination: { count: 10, maxItems: 25 } } }));
            fixture.detectChanges();
        });

        it('Should display the empty sites', async () => {
            await fixture.whenStable();
            fixture.detectChanges();

            const adfSiteList = fixture.debugElement.nativeElement.querySelector('.adf-datatable');
            expect(adfSiteList).toBeDefined();
            const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_exampleName"`));
            const tableContent = fixture.debugElement.query(By.css(`[class="adf-empty-content__title"]`));
            expect(value1).toBeNull();
            expect(tableContent).not.toBeNull();
            expect(tableContent.nativeElement.innerText.trim()).toBe('LIBRARY_LIST.EMPTY_TEMPLATE.TITLE');
        });
    });
});
