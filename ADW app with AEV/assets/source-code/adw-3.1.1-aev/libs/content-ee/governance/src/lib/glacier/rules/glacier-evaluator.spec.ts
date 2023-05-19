/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SelectionState } from '@alfresco/adf-extensions';
import { fakeNode, fakeRecord } from './mock-data';
import {
    canExtendRestoreNode,
    canRestoreNode,
    canStoreNode,
    hasEnabledGlacierPlugin,
    hasPendingRestore,
    hasRestored,
    hasStored,
    hasAdminCapability,
    isPendingRestore,
    isRestored,
    isStoredInGlacier,
    canShowViewer,
} from './glacier-evaluator';
import { NodeEntry } from '@alfresco/js-api';
import { fakeFolder } from '../../record/rules/mock-data';

describe('glacier evaluator', () => {
    let ruleContext;
    const fakeSelection: SelectionState = <SelectionState>{};

    beforeEach(() => {
        ruleContext = <any>{
            selection: [],
            navigation: { currentFolder: null },
            profile: { groups: [] },
            repository: { modules: [] },
            permissions: {
                check: (node, permissions: string[]) => node.entry.allowableOperations.find((allowable) => allowable === permissions[0]),
            },
        };
    });

    describe('canStoreNode', () => {
        beforeEach(() => {
            ruleContext.navigation.url = '/libraries/fake-id';
        });

        describe('single node operation', () => {
            it('should return false when user is not a manager or admin', () => {
                fakeSelection.first = fakeRecord;
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeRecord];
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when node is already stored', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when user and node is valid but plugin is not enabled', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when node is already restored', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation = {
                    currentFolder: {
                        path: { name: '/user home/Sites/abc_site' },
                    },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when action is not a library', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation = {
                    currentFolder: {
                        path: { name: '/user home/Sites/abc_site' },
                    },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
                ruleContext.navigation.url = 'fake-url';
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });

            it('should return true selected row is node', () => {
                fakeSelection.first = fakeNode;
                fakeSelection.first.entry.allowableOperations = ['update'];
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
                expect(canStoreNode(ruleContext)).toBeTruthy();
            });

            it('should return true if user and node is valid and plugin enabled', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.allowableOperations = ['update'];
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
                expect(canStoreNode(ruleContext)).toBeTruthy();
            });
        });

        describe('bulk operation', () => {
            beforeEach(() => {
                ruleContext.navigation = {
                    currentFolder: {
                        path: { name: '/user home/Sites/abc_site' },
                    },
                    url: '/libraries/fake-id',
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
            });

            it('should return true if all the node having update property', () => {
                const node1 = JSON.parse(JSON.stringify(fakeRecord));
                node1.entry.allowableOperations = ['update'];
                ruleContext.selection.nodes = [node1, node1];
                expect(canStoreNode(ruleContext)).toBeTruthy();
            });

            it('should return false if any one not having update property', () => {
                const node1 = JSON.parse(JSON.stringify(fakeRecord));
                node1.entry.allowableOperations = ['update'];
                const node2 = JSON.parse(JSON.stringify(fakeRecord));
                node2.entry.allowableOperations = [];
                ruleContext.selection.nodes = [node1, node2];
                expect(canStoreNode(ruleContext)).toBeFalsy();
            });
        });
    });

    describe('canRestoreNode', () => {
        describe('single operation', () => {
            beforeEach(() => {
                ruleContext.navigation.url = '/libraries/fake-id';
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
            });

            it('should return false when node is not a stored', () => {
                ruleContext.selection = fakeSelection;
                fakeSelection.first = fakeNode;
                ruleContext.selection.nodes = [fakeSelection.first];

                expect(canRestoreNode(ruleContext)).toBeFalsy();

                fakeSelection.first = fakeRecord;
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when node is pending restore or restored', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
                ruleContext.selection.nodes = [fakeSelection.first];
                expect(canRestoreNode(ruleContext)).toBeFalsy();

                fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when user is not a manager or admin', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.profile.groups = [];
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when plugin is not enabled', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.repository.modules = [];
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return false when action is not a library', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.url = 'fake-url';
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return true when both node and user is valid ', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [
                    {
                        isRoot: false,
                        displayName: 'site_Test-Site_SiteManager',
                        id: 'GROUP_site_abc_site_SiteManager',
                    },
                ];
                expect(canRestoreNode(ruleContext)).toBeTruthy();
            });

            it('should return true when both node and user is superAdmin', () => {
                fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
                fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
                fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
                ruleContext.selection = fakeSelection;
                ruleContext.selection.nodes = [fakeSelection.first];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [];
                ruleContext.profile.isAdmin = true;
                expect(canRestoreNode(ruleContext)).toBeTruthy();
            });
        });

        describe('bulk operation', () => {
            beforeEach(() => {
                ruleContext.navigation.url = '/libraries/fake-id';
                ruleContext.repository.modules = [
                    {
                        id: 'alfresco-glacier-connector-repo',
                    },
                ];
            });

            it('should return false if user not having update permission', () => {
                const node = JSON.parse(JSON.stringify(fakeRecord));
                ruleContext.selection.nodes = [node, fakeFolder];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [];
                ruleContext.profile.isAdmin = true;
                expect(canRestoreNode(ruleContext)).toBeFalsy();
            });

            it('should return true for superadmin and update permission for all selected nodes', () => {
                const node = JSON.parse(JSON.stringify(fakeRecord));
                node.entry.allowableOperations = ['update'];
                ruleContext.selection.nodes = [node, fakeFolder];
                ruleContext.navigation.currentFolder = {
                    path: { name: '/user home/Sites/abc_site' },
                };
                ruleContext.profile.groups = [];
                ruleContext.profile.isAdmin = true;
                expect(canRestoreNode(ruleContext)).toBeTruthy();
            });
        });
    });

    describe('canExtendRestoreNode', () => {
        beforeEach(() => {
            ruleContext.navigation.url = '/libraries/fake-id';
        });

        it('should return false when node is not a stored', () => {
            ruleContext.selection = fakeSelection;

            fakeSelection.first = fakeNode;
            expect(canExtendRestoreNode(ruleContext)).toBeFalsy();

            fakeSelection.first = fakeRecord;
            expect(canExtendRestoreNode(ruleContext)).toBeFalsy();
        });

        it('should return false when node is in pending restore', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            expect(canExtendRestoreNode(ruleContext)).toBeFalsy();
        });

        it('should return false when user is not a manager or admin', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
            fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = fakeSelection;
            ruleContext.profile.groups = [];
            expect(canExtendRestoreNode(ruleContext)).toBeFalsy();
        });

        it('should return false when action is not library', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
            fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = fakeSelection;
            ruleContext.navigation = {
                currentFolder: { path: { name: '/user home/Sites/abc_site' } },
            };
            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteManager',
                    id: 'GROUP_site_abc_site_SiteManager',
                },
            ];
            ruleContext.navigation.url = 'fake-url';
            expect(canExtendRestoreNode(ruleContext)).toBeFalsy();
        });

        it('should return true when both node and user is valid', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
            fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = fakeSelection;
            ruleContext.navigation.currentFolder = {
                path: { name: '/user home/Sites/abc_site' },
            };
            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteManager',
                    id: 'GROUP_site_abc_site_SiteManager',
                },
            ];
            expect(canExtendRestoreNode(ruleContext)).toBeTruthy();
        });

        it('should return true when both node and user is superAdmin', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.aspectNames = ['rma:record', 'gl:archived'];
            fakeSelection.first.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = fakeSelection;
            ruleContext.navigation.currentFolder = {
                path: { name: '/user home/Sites/abc_site' },
            };
            ruleContext.profile.groups = [];
            ruleContext.profile.isAdmin = true;
            expect(canExtendRestoreNode(ruleContext)).toBeTruthy();
        });
    });

    describe('hasEnabledGlacierPlugin', () => {
        it('should return false when glacier is not enabled', () => {
            ruleContext.repository.modules = [];
            expect(hasEnabledGlacierPlugin(ruleContext)).toBeFalsy();
        });

        it('should return true when glacier is enabled', () => {
            ruleContext.repository.modules = [
                {
                    id: 'alfresco-glacier-connector-repo',
                },
            ];
            expect(hasEnabledGlacierPlugin(ruleContext)).toBeTruthy();
        });
    });

    describe('hasStored', () => {
        it('should return false when glacier is not stored', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            ruleContext.selection = fakeSelection;
            fakeSelection.first.entry.aspectNames = ['rma:record'];
            expect(hasStored(ruleContext)).toBeFalsy();

            fakeSelection.first.entry.aspectNames = [];
            expect(hasStored(ruleContext)).toBeFalsy();
        });

        it('should return true when glacier is enabled', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            fakeSelection.first.entry.properties['gl:contentState'] = 'ARCHIVED';
            fakeSelection.first.entry.aspectNames = ['gl:archived', 'rma:record'];
            ruleContext.selection = fakeSelection;
            expect(hasStored(ruleContext)).toBeTruthy();
        });
    });

    describe('hasAdminCapability', () => {
        it('should return true when user is admin or manager or superadmin', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            ruleContext.selection = fakeSelection;
            ruleContext.navigation = {
                currentFolder: { path: { name: '/user home/Sites/abc_site' } },
            };
            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteManager',
                    id: 'GROUP_site_abc_site_SiteManager',
                },
            ];
            expect(hasAdminCapability(ruleContext)).toBeTruthy();

            ruleContext.profile.groups = [];
            ruleContext.profile.isAdmin = true;
            expect(hasAdminCapability(ruleContext)).toBeTruthy();
        });

        it('should return false if current library folder has no path', () => {
            ruleContext.navigation = {
                currentFolder: { path: {} },
            };
            expect(hasAdminCapability(ruleContext)).toBeFalsy();
        });

        it('should return false when user is not (admin or manager or superadmin)', () => {
            fakeSelection.first = JSON.parse(JSON.stringify(fakeRecord));
            ruleContext.selection = fakeSelection;
            ruleContext.navigation = {
                currentFolder: { path: { name: '/user home/Sites/abc_site' } },
            };
            ruleContext.profile.groups = [];
            ruleContext.profile.isAdmin = false;
            expect(hasAdminCapability(ruleContext)).toBeFalsy();

            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteCollaborator',
                    id: 'GROUP_site_abc_site_SiteCollaborator',
                },
            ];
            expect(hasAdminCapability(ruleContext)).toBeFalsy();

            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteContributor',
                    id: 'GROUP_site_abc_site_SiteContributor',
                },
            ];
            expect(hasAdminCapability(ruleContext)).toBeFalsy();

            ruleContext.profile.groups = [
                {
                    isRoot: false,
                    displayName: 'site_Test-Site_SiteConsumer',
                    id: 'GROUP_site_abc_site_SiteConsumer',
                },
            ];
            expect(hasAdminCapability(ruleContext)).toBeFalsy();
        });
    });

    describe('hasPendingRestore', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should false if node is not pending store', () => {
            fakeSelection.first = node;
            ruleContext.selection = fakeSelection;
            expect(hasPendingRestore(ruleContext)).toBeFalsy();
        });

        it('should return true if node is in pending store', () => {
            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            fakeSelection.first = node;
            ruleContext.selection = fakeSelection;
            expect(hasPendingRestore(ruleContext)).toBeTruthy();
        });
    });

    describe('hasRestored', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should return false if node is not restored', () => {
            fakeSelection.first = node;
            ruleContext.selection = fakeSelection;
            expect(hasRestored(ruleContext)).toBeFalsy();
        });

        it('should return true if node is in restored', () => {
            node.entry.properties['gl:contentState'] = 'RESTORED';
            fakeSelection.first = node;
            ruleContext.selection = fakeSelection;
            expect(hasRestored(ruleContext)).toBeTruthy();
        });
    });

    describe('isStoredInGlacier', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should not return true if node is not stored', () => {
            expect(isStoredInGlacier(null)).toBeFalsy();
            expect(isStoredInGlacier(node)).toBeFalsy();

            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            expect(isStoredInGlacier(node)).toBeFalsy();

            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            expect(isStoredInGlacier(node)).toBeFalsy();
        });

        it('should return true if node stored', () => {
            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            expect(isStoredInGlacier(node)).toBeTruthy();
        });
    });

    describe('isPendingRestore', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should not return true if node is not pending store', () => {
            expect(isPendingRestore(node)).toBeFalsy();
            expect(isPendingRestore(null)).toBeFalsy();
        });

        it('should return true if node is in pending store', () => {
            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            expect(isPendingRestore(node)).toBeTruthy();
        });
    });

    describe('isRestored', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should not return true if node is not pending store', () => {
            expect(isRestored(node)).toBeFalsy();
            expect(isRestored(null)).toBeFalsy();
        });

        it('should return true if node is in pending store', () => {
            node.entry.properties['gl:contentState'] = 'RESTORED';
            expect(isRestored(node)).toBeTruthy();
        });
    });

    describe('canShowViewer', () => {
        let node: NodeEntry;

        beforeEach(() => {
            node = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            } as NodeEntry;
        });

        it('should not return true if node is not stored', () => {
            expect(canShowViewer(null, node)).toBeTruthy();
            node.entry.properties['gl:contentState'] = 'RESTORED';
            expect(canShowViewer(null, node)).toBeTruthy();
            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            expect(canShowViewer(null, node)).toBeTruthy();
        });

        it('should return true if node is in stored', () => {
            node.entry.aspectNames = ['gl:archived'];
            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            expect(canShowViewer(null, node)).toBeFalsy();
        });
    });
});
