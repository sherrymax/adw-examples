/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './office-online-integration.rules';

describe('Office Online rules', () => {
    describe('isMicrosoftOnlinePluginEnabled rule', () => {
        let getItemSpy: jasmine.Spy;

        beforeEach(() => {
            getItemSpy = spyOn(localStorage, 'getItem');
        });

        it('Should return true when microsoftOnline is enabled', () => {
            getItemSpy.and.returnValue('true');
            expect(rules.isMicrosoftOnlinePluginEnabled()).toBe(true);
        });

        it('Should return false when microsoftOnline is disabled', () => {
            getItemSpy.and.returnValue('false');
            expect(rules.isMicrosoftOnlinePluginEnabled()).toBe(false);
        });
    });
});
