/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './process-services.rules';
import { mockSharedSelectionState } from '../mock/process-services.mock';

describe('Process Services rules', () => {
    describe('canShowStartProcessFromContent rule', () => {
        let getItemSpy: jasmine.Spy;

        const getContext = (isFile: boolean, url: string): any => ({
            selection: {
                nodes: [
                    {
                        entry: {
                            isFile: isFile,
                        },
                    },
                ],
            },
            navigation: {
                url: url,
            },
        });

        beforeEach(() => {
            getItemSpy = spyOn(localStorage, 'getItem');
        });

        it('Should return true when selection is file, process services extension is enabled and if url does not start with `/trashcan`', () => {
            getItemSpy.and.returnValue('true');
            const context = getContext(true, '/path/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(true);
        });

        it('Should return true when selection contains only files', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                selection: {
                    nodes: [
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'cm:content',
                            },
                        },
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'cm:content',
                            },
                        },
                    ],
                },
                navigation: {
                    url: '/valid/path',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(true);
        });

        it('Should return false when selection contains files and at least one folders', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                selection: {
                    nodes: [
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'cm:content',
                            },
                        },
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'cm:content',
                            },
                        },
                        {
                            entry: {
                                isFile: false,
                                isFolder: true,
                                nodeType: 'cm:folder',
                            },
                        },
                    ],
                },
                navigation: {
                    url: '/valid/path',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection contains at least one library', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                selection: {
                    nodes: [
                        {
                            entry: {
                                id: 'abc',
                                guid: '18ebc02d-3be0-46cc-a50c-27621c630942',
                                title: 'fake-',
                                visibility: 'PUBLIC',
                                preset: 'site-dashboard-preset',
                                role: 'SiteManagerRole',
                            },
                            isLibrary: true,
                        },
                    ],
                },
                navigation: {
                    url: '/valid/path',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection contains different libraries with favorite', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                selection: {
                    nodes: [
                        {
                            entry: {
                                id: 'abc',
                                guid: '18ebc02d-3be0-46cc-a50c-27621c630942',
                                title: 'fake-abc',
                                visibility: 'PUBLIC',
                                preset: 'site-dashboard-preset',
                                role: 'SiteManagerRole',
                            },
                            isLibrary: true,
                        },
                        {
                            entry: {
                                id: 'zyx',
                                guid: '3be046cc-a50c-18ebc02d-xrt2adf2t',
                                title: 'fake-zyx',
                                visibility: 'PUBLIC',
                                preset: 'site-dashboard-preset',
                                role: 'SiteManagerRole',
                            },
                            isLibrary: true,
                            isFavorite: true,
                        },
                    ],
                },
                navigation: {
                    url: '/valid/path',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection contains files and at least one fileLink', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                selection: {
                    nodes: [
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'cm:content',
                            },
                        },
                        {
                            entry: {
                                isFile: true,
                                nodeType: 'app:filelink',
                            },
                        },
                    ],
                },
                navigation: {
                    url: '/valid/path',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection is a file, process services extension is disabled and if url does not start with `/trashcan`', () => {
            getItemSpy.and.returnValue('false');
            const context = getContext(true, '/path/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection is not file, process services extension is not enabled and if url does not start with `/trashcan`', () => {
            getItemSpy.and.returnValue('false');
            const context = getContext(false, '/path/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection is file, process services extension is enabled and if url does start with `/trashcan`', () => {
            getItemSpy.and.returnValue('true');
            const context = getContext(true, '/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection is not file, process services extension is enabled and if url does start with `/trashcan`', () => {
            getItemSpy.and.returnValue('true');
            const context = getContext(false, '/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return false when selection is file, process services extension is not enabled and if url does start with `/trashcan`', () => {
            getItemSpy.and.returnValue('false');
            const context = getContext(true, '/trashcan');
            expect(rules.canShowStartProcessFromContent(context)).toBe(false);
        });

        it('Should return true when process services extension is enabled and url start with /shared', () => {
            getItemSpy.and.returnValue('true');
            const context: any = {
                ...mockSharedSelectionState,
                navigation: {
                    url: '/shared',
                },
            };
            expect(rules.canShowStartProcessFromContent(context)).toBe(true);
        });
    });

    describe('isProcessServicePluginEnabled rule', () => {
        let getItemSpy: jasmine.Spy;

        beforeEach(() => {
            getItemSpy = spyOn(localStorage, 'getItem');
        });

        it('Should return true when processService is enabled', () => {
            getItemSpy.and.returnValue('true');
            expect(rules.isProcessServicePluginEnabled()).toBe(true);
        });

        it('Should return false when processService is disabled', () => {
            getItemSpy.and.returnValue('false');
            expect(rules.isProcessServicePluginEnabled()).toBe(false);
        });
    });
});
