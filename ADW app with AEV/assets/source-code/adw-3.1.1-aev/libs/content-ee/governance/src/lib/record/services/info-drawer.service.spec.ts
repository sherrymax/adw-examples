/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';

import { InfoDrawerService } from './info-drawer.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { Store } from '@ngrx/store';
import { SetInfoDrawerMetadataAspectAction, SetSelectedNodesAction } from '@alfresco-dbp/content-ce/shared/store';
import { fakeRecord } from '../rules/mock-data';
import { of } from 'rxjs';

describe('InfoDrawerService', () => {
    let service: InfoDrawerService;
    const storeMock = {
        dispatch: jasmine.createSpy('dispatch').and.returnValue(of(true)),
        select: jasmine.createSpy('select').and.returnValue(of(true)),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
            providers: [{ provide: Store, useValue: storeMock }],
        });
        service = TestBed.inject(InfoDrawerService);
    });

    afterEach(() => {
        storeMock.dispatch.calls.reset();
        storeMock.select.calls.reset();
    });

    it('should open `Record` metadata tab in the drawer', () => {
        storeMock.dispatch.and.returnValue(new SetSelectedNodesAction([fakeRecord]));
        service.setMetaDataAspect('Record');
        expect(storeMock.dispatch).toHaveBeenCalledTimes(2);
        expect(storeMock.dispatch['calls'].argsFor(1)).toEqual([new SetInfoDrawerMetadataAspectAction('Record')]);
    });

    it('should open `Properties` metadata tab in the drawer', () => {
        storeMock.dispatch.and.returnValue(new SetSelectedNodesAction([]));
        service.setMetaDataAspect('Properties');
        expect(storeMock.dispatch).toHaveBeenCalledTimes(2);
        expect(storeMock.dispatch['calls'].argsFor(1)).toEqual([new SetInfoDrawerMetadataAspectAction('Properties')]);
    });
});
