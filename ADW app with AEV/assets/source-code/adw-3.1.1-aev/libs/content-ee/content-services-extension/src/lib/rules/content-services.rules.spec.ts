/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './content-services.rules';

describe('Content Services rules', () => {
    describe('isContentServicePluginEnabled rule', () => {
        let getItemSpy: jasmine.Spy;

        beforeEach(() => {
            getItemSpy = spyOn(localStorage, 'getItem');
        });

        it('Should return true when contentService is enabled', () => {
            getItemSpy.and.returnValue('true');
            expect(rules.isContentServicePluginEnabled()).toBe(true);
        });

        it('Should return false when contentService is disabled', () => {
            getItemSpy.and.returnValue('false');
            expect(rules.isContentServicePluginEnabled()).toBe(false);
        });
    });
});
