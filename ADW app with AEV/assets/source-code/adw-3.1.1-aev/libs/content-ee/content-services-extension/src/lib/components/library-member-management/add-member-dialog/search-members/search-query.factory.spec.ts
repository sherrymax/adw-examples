/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { setupTestBed, VersionCompatibilityService } from '@alfresco/adf-core';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideAutoSpy, Spy } from 'jasmine-auto-spies';
import { SearchQueryFactory } from './search-query.factory';

describe('SearchQueryFactory', () => {
    let factory: SearchQueryFactory;
    let versionCompatibilityServiceSpy: Spy<VersionCompatibilityService>;

    setupTestBed({
        imports: [HttpClientModule],
        providers: [
            provideAutoSpy(VersionCompatibilityService),
            SearchQueryFactory,
        ],
    });

    beforeEach(() => {
        factory = TestBed.inject(SearchQueryFactory);
        versionCompatibilityServiceSpy = TestBed.inject<any>(VersionCompatibilityService);
    });

    it('should use query for users and groups if it is version 7 or higher', () => {
        versionCompatibilityServiceSpy.isVersionSupported.and.returnValue(true);
        const query = factory.query;
        expect(query).toBe(
            // eslint-disable-next-line max-len
            '(email:*${searchTerm}* OR firstName:*${searchTerm}* OR lastName:*${searchTerm}* OR displayName:*${searchTerm}* OR authorityName:*${searchTerm}* OR authorityDisplayName:*${searchTerm}*) AND ANAME:("0/APP.DEFAULT")'
        );
    });

    it('should use query for users only if it is version 6 or lower', () => {
        versionCompatibilityServiceSpy.isVersionSupported.and.returnValue(false);
        const query = factory.query;
        expect(query).toBe('email:*${searchTerm}* OR firstName:*${searchTerm}* OR lastName:*${searchTerm}* OR displayName:*${searchTerm}*');
    });
});
