/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeSite, fakeRMSite, fakeDataForAGS } from './mock/mock-site-data';
import { isAGSInstalled, isLibraryAction, isRMSite } from './site.evaluator';

describe('SiteRule', () => {
    let ruleContext = <any>{ repository: null };

    describe('Rm Site rule ', () => {
        beforeEach(() => {
            ruleContext.repository = fakeRMSite;
        });

        it('should return true when RM is available', () => {
            expect(isRMSite(ruleContext)).toBeTruthy();
        });

        it('should return false when RM is not available', () => {
            ruleContext.repository = fakeSite;
            expect(isRMSite(ruleContext)).toBeFalsy();
        });
    });

    describe('isLibraryAction', () => {
        beforeEach(() => {
            ruleContext = {
                navigation: { url: '/libraries' },
                repository: null,
            };
        });

        it('should return true when url contains with `/libraries`', () => {
            expect(isLibraryAction(ruleContext)).toBe(true);
            ruleContext.navigation.url = 'root/libraries/fake-node';
            expect(isLibraryAction(ruleContext)).toBe(true);
        });

        it('should return false when url does not contain `/libraries`', () => {
            ruleContext.navigation.url = 'some/url';
            expect(isLibraryAction(ruleContext)).toBe(false);
        });

        it('should return false when url is null', () => {
            ruleContext.navigation.url = null;
            expect(isLibraryAction(ruleContext)).toBe(false);
        });
    });

    describe('AGS rule ', () => {

        it('should return true when AGS is available', () => {
            ruleContext.repository = fakeDataForAGS;
            expect(isAGSInstalled(ruleContext)).toBeTruthy();
        });

        it('should return false when AGS is not available', () => {
            ruleContext.repository = fakeSite;
            expect(isAGSInstalled(ruleContext)).toBeFalsy();
        });
    });
});
