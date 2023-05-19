/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExtensionEffects } from './extension.effects';
import { ContentServicesTestingModule } from '../../testing/content-services-testing.module';
import { Router, RouterModule } from '@angular/router';
import { AddMemberAction, ManageMembersAction } from '../extension.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { AppStore } from '@alfresco-dbp/content-ce/shared/store';
import { Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SiteEntry } from '@alfresco/js-api';
import { LibraryDialogService } from '../../components/library-member-management';

describe('LibraryEffects', () => {
    let router: Router;
    let store: Store<AppStore>;
    let libraryDialogService: LibraryDialogService;
    const site = { entry: { id: 'fake-site-id' } } as SiteEntry;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([ExtensionEffects]), ContentServicesTestingModule, RouterModule, MatDialogModule],
            providers: [LibraryDialogService],
        });

        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        libraryDialogService = TestBed.inject(LibraryDialogService);
        spyOn(router, 'navigateByUrl').and.stub();
    });

    it('should navigate to site members', () => {
        store.dispatch(new ManageMembersAction(site));
        expect(router.navigateByUrl).toHaveBeenCalledWith('/fake-site-id/members/libraries');
    });

    it('should open dialog with action data', () => {
        spyOn(libraryDialogService, 'openAddLibraryMemberDialog').and.returnValue(of([]));
        const members = [];

        store.dispatch(new AddMemberAction(site, members));
        expect(libraryDialogService.openAddLibraryMemberDialog).toHaveBeenCalledWith(site, members);
    });
});
