/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Node, NodeEntry } from '@alfresco/js-api';
import { RuleContext, SelectionState } from '@alfresco/adf-extensions';
import { fakeSite, fakeRMSite } from '../../core/rules/mock/mock-site-data';
import { DeclareRecord } from '../models/declare-record.model';
import {
    canDeclareAsRecord,
    canDeclareRecord,
    canDeleteRecord,
    canEditSharedURL,
    canShareRecord,
    canDeleteStoredNode,
    canDeleteStoredRecord,
    canUpdateRecord,
    canUpdateVersion,
    isFailedRecord,
    isNodeRecord,
    isNodeRecordRejected,
    isRecord,
    trimRecordId,
} from './record.evaluator';

describe('RecordRules', () => {
    let ruleContext: any;
    let fakeSelection: SelectionState;
    let fakeNodeRecord: NodeEntry;
    let fakeNodeRecordRejected: NodeEntry;
    let fakeNode: NodeEntry;

    beforeEach(() => {
        ruleContext = {
            navigation: { url: '/personal-files' },
            repository: null,
            permissions: {
                check: (node, permissions: string[]) => node.entry.allowableOperations.find((allowable) => allowable === permissions[0]),
            },
        };

        fakeSelection = <SelectionState>{};

        fakeNodeRecord = {
            entry: {
                name: 'Node Action',
                id: 'fake-id',
                isFile: true,
                aspectNames: ['rma:record'],
                allowableOperations: ['update'],
            },
        } as NodeEntry;

        fakeNodeRecordRejected = {
            entry: {
                name: 'Node Action',
                id: 'fake-id',
                isFile: true,
                aspectNames: ['rma:recordRejectionDetails'],
                allowableOperations: ['update'],
            },
        } as NodeEntry;

        fakeNode = {
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

    describe('isRecord rule', () => {
        let fakeSimpleNode: NodeEntry;

        beforeEach(() => {
            fakeSimpleNode = {
                entry: { name: 'Node Action', id: 'fake-id', isFile: true },
            } as NodeEntry;
        });

        it('should return true when the node has the record aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecord;
            ruleContext.selection = fakeSelection;
            expect(isNodeRecord(ruleContext)).toBeTruthy();
        });

        it('should return false when the node has not the record aspect', () => {
            fakeSelection.first = <NodeEntry>fakeSimpleNode;
            ruleContext.selection = fakeSelection;
            expect(isNodeRecord(ruleContext)).toBeFalsy();
        });
    });

    describe('isNodeRecordRejected rule', () => {
        it('should return true when the node has the record aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecord;
            ruleContext.selection = fakeSelection;
            expect(isNodeRecordRejected(ruleContext)).toBeFalsy();
        });

        it('should return true when the node has the record reject aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecordRejected;
            ruleContext.selection = fakeSelection;
            expect(isNodeRecordRejected(ruleContext)).toBeTruthy();
        });

        it('should return false when the node is null', () => {
            fakeSelection.first = <NodeEntry>null;
            ruleContext.selection = fakeSelection;
            expect(isNodeRecordRejected(ruleContext)).toBeFalsy();
        });
    });

    describe('canDeclareAsRecord rule', () => {
        beforeEach(() => {
            ruleContext.navigation.url = '/libraries/id';
            ruleContext.repository = fakeRMSite;
        });

        afterEach(() => {
            ruleContext.repository = null;
        });

        it('should return true when  node have permission, RM is available and is not a rejected node', () => {
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeTruthy();
        });

        it('should return true when more than one node selected', () => {
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode, fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeTruthy();
        });

        it('should return false when  more zero node selected', () => {
            ruleContext.selection = {};
            ruleContext.selection.nodes = [];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it('should return false when user in personal folder', () => {
            ruleContext.navigation.url = '/personal-files';
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it('should return false on search results', () => {
            ruleContext.navigation.url = '/search';
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it('should return true when the node has the rejected aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecordRejected;
            fakeNodeRecordRejected.entry.allowableOperations = ['update'];
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNodeRecordRejected];
            expect(canDeclareAsRecord(ruleContext)).toBeTruthy();
        });

        it('should return false when the node is record', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecord;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNodeRecord];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it(`should return false when the node didn't have permission`, () => {
            fakeNode.entry.allowableOperations = [];
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it('should return false when the node is locked', () => {
            fakeNode.entry.isLocked = true;
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });

        it('should return false when the repo is not having RM', () => {
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.repository = fakeSite;
            ruleContext.selection = fakeSelection;
            ruleContext.selection.nodes = [fakeNode];
            expect(canDeclareAsRecord(ruleContext)).toBeFalsy();
        });
    });

    describe('canDeleteRecord rule', () => {
        it('should return false when the node has the rejected aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecordRejected;
            ruleContext.selection = fakeSelection;
            expect(canDeleteRecord(ruleContext)).toBeFalsy();
        });

        it(`should return false when the node didn't have permission`, () => {
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            expect(canDeleteRecord(ruleContext)).toBeFalsy();
        });

        it('should return true when the node have permission', () => {
            spyOn(ruleContext.permissions, 'check').and.returnValue(true);
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = <NodeEntry>fakeNodeRecord;
            ruleContext.selection = fakeSelection;
            expect(canDeleteRecord(ruleContext)).toBeTruthy();
        });
    });

    describe('canUpdateRecord rule', () => {
        it('should return false when the node has the rejected aspect', () => {
            fakeSelection.first = <NodeEntry>fakeNodeRecordRejected;
            ruleContext.selection = fakeSelection;
            expect(canUpdateRecord(ruleContext)).toBeFalsy();
        });

        it(`should return false when the node didn't have permission`, () => {
            fakeSelection.first = <NodeEntry>fakeNode;
            ruleContext.selection = fakeSelection;
            expect(canUpdateRecord(ruleContext)).toBeFalsy();
        });

        it('should return true when the node have permission', () => {
            spyOn(ruleContext.permissions, 'check').and.returnValue(true);
            fakeNode.entry.allowableOperations = ['update'];
            fakeSelection.first = <NodeEntry>fakeNodeRecord;
            ruleContext.selection = fakeSelection;
            expect(canUpdateRecord(ruleContext)).toBeTruthy();
        });
    });

    describe('isFailedRecord', () => {
        it('should return false if node is not failed', () => {
            const node = <DeclareRecord>{ entry: {} };
            expect(isFailedRecord(node)).toBeFalsy();

            node.status = null;
            expect(isFailedRecord(node)).toBeFalsy();

            node.status = 'passed';
            expect(isFailedRecord(node)).toBeFalsy();
        });

        it('should return true if node is failed', () => {
            const node = <DeclareRecord>{ entry: {}, status: 'failed' };
            expect(isFailedRecord(node)).toBeTruthy();
        });
    });

    describe('isRecord', () => {
        it('Should return true when node is valid record', () => {
            let fakeRecord = <NodeEntry>{
                entry: {
                    name: 'Record File',
                    aspectNames: ['rma:declaredRecord'],
                },
            };
            expect(isRecord(fakeRecord)).toBeTruthy();

            fakeRecord = <NodeEntry>{
                entry: { name: 'Record File', aspectNames: ['rma:record'] },
            };
            expect(isRecord(fakeRecord)).toBeTruthy();
        });

        it('Should return false when node is not valid record', () => {
            let fakeRecord = <NodeEntry>{ entry: { name: 'Record File' } };
            expect(isRecord(fakeRecord)).toBeFalsy();

            fakeRecord = <NodeEntry>null;
            expect(isRecord(fakeRecord)).toBeFalsy();
        });
    });

    describe('canDeclareRecord', () => {
        let fakeNodeRejected: NodeEntry;
        let fakeRuleContext: RuleContext;
        let fakeContentNode: NodeEntry;

        beforeEach(() => {
            fakeNodeRejected = {
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: ['rma:recordRejectionDetails'],
                    allowableOperations: ['update'],
                },
            } as NodeEntry;

            fakeRuleContext = {
                permissions: {
                    check: (node, permissions: string[]) => node.entry.allowableOperations.find((allowable) => allowable === permissions[0]),
                },
            } as RuleContext;

            fakeContentNode = {
                entry: {
                    name: 'Record File',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: ['cm:content'],
                    allowableOperations: ['update'],
                },
            } as NodeEntry;
        });

        it('should return true when node is valid', () => {
            expect(canDeclareRecord(fakeRuleContext, fakeContentNode)).toBeTruthy();
        });

        it('should return true when the node is rejected', () => {
            expect(canDeclareRecord(fakeRuleContext, fakeNodeRejected)).toBeTruthy();
        });

        it(`should return false when the node didn't have permission`, () => {
            fakeContentNode.entry.allowableOperations = [];
            expect(canDeclareRecord(fakeRuleContext, fakeContentNode)).toBeFalsy();
        });

        it('should return false when the node is record', () => {
            fakeContentNode.entry.aspectNames = ['rma:record'];
            expect(canDeclareRecord(fakeRuleContext, fakeContentNode)).toBeFalsy();
        });

        it('should return false when the node is locked', () => {
            fakeContentNode.entry.isLocked = true;
            expect(canDeclareRecord(fakeRuleContext, fakeContentNode)).toBeFalsy();
        });
    });

    describe('canUpdateVersion', () => {
        let node: NodeEntry;
        let fakeRecord: NodeEntry;

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

            fakeRecord = {
                entry: { name: 'Record File', aspectNames: ['rma:declaredRecord'] },
            } as NodeEntry;
        });

        it('should return false if node is record or stored', () => {
            fakeSelection.first = fakeRecord;
            ruleContext.selection = fakeSelection;
            expect(canUpdateVersion(ruleContext)).toBeFalsy();

            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            fakeSelection.first = fakeRecord;
            ruleContext.selection = fakeSelection;
            expect(canUpdateVersion(ruleContext)).toBeFalsy();
        });

        it('should return true if node is not record or stored', () => {
            fakeSelection.first = fakeRecord;
            fakeSelection.first.entry.aspectNames = [];
            ruleContext.selection = fakeSelection;
            expect(canUpdateVersion(ruleContext)).toBeTruthy();

            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            fakeSelection.first = fakeRecord;
            ruleContext.selection = fakeSelection;
            expect(canUpdateVersion(ruleContext)).toBeTruthy();

            node.entry.properties['gl:contentState'] = 'RESTORED';
            expect(canUpdateVersion(ruleContext)).toBeTruthy();

            node.entry.properties['gl:contentState'] = null;
            expect(canUpdateVersion(ruleContext)).toBeTruthy();
        });
    });

    describe('trimRecordId', () => {
        it('should remove the id if it is present', () => {
            const node: Node = JSON.parse(JSON.stringify(fakeNode)).entry;
            node.properties['rma:identifier'] = '123';
            node.name = 'abc (123).png';
            expect(trimRecordId(node)).toEqual('abc.png');

            node.properties['rma:identifier'] = '123';
            node.name = 'qqq (123)';
            expect(trimRecordId(node)).toEqual('qqq');
        });

        it('should not remove the id if it is not present', () => {
            const node: Node = JSON.parse(JSON.stringify(fakeNode)).entry;
            node.name = 'abc (123).png';
            expect(trimRecordId(node)).toEqual('abc (123).png');
        });
    });

    describe('canDeleteStoredNode', () => {
        let node: NodeEntry;
        let fakeRecord: NodeEntry;

        beforeEach(() => {
            ruleContext.permissions = {
                check: (nodes: NodeEntry[], permissions: string[]) =>
                    nodes.every((nodeEntry) => !!nodeEntry.entry.allowableOperations.find((allowable) => allowable === permissions[0])),
            };
            node = <NodeEntry>{
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: ['delete'],
                    properties: {},
                },
            };
            fakeRecord = <NodeEntry>{
                entry: {
                    name: 'Record File',
                    aspectNames: ['rma:declaredRecord'],
                    allowableOperations: [],
                },
            };
        });

        it('should return false if node is (record, stored or pending restore)', () => {
            ruleContext.selection = { first: fakeRecord, nodes: [fakeRecord] };
            expect(canDeleteStoredNode(ruleContext)).toBeFalsy();

            node.entry.properties['gl:contentState'] = 'ARCHIVED';
            node.entry.aspectNames = ['gl:archived', 'rma:record'];
            ruleContext.selection = { first: node, nodes: [node] };
            expect(canDeleteStoredNode(ruleContext)).toBeFalsy();

            node.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            node.entry.aspectNames = [];
            ruleContext.selection = { first: node, nodes: [node] };
            expect(canDeleteStoredNode(ruleContext)).toBeFalsy();
        });

        it('should return true if node is not (record, stored and pending restore)', () => {
            ruleContext.selection = { first: node, nodes: [node] };
            expect(canDeleteStoredNode(ruleContext)).toBeTruthy();

            node.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = { first: node, nodes: [node] };
            expect(canDeleteStoredNode(ruleContext)).toBeTruthy();

            node.entry.properties['gl:contentState'] = null;
            ruleContext.selection = { first: node, nodes: [node] };
            expect(canDeleteStoredNode(ruleContext)).toBeTruthy();
        });
    });

    describe('canDeleteStoredRecord', () => {
        let fakeRecord: NodeEntry;

        beforeEach(() => {
            ruleContext.permissions = {
                check: (node: Node, permissions: string[]) => !!node.allowableOperations.find((allowable) => allowable === permissions[0]),
            };
            fakeRecord = <NodeEntry>{
                entry: {
                    name: 'Record File',
                    isFile: true,
                    aspectNames: ['rma:declaredRecord'],
                    properties: {},
                    allowableOperations: [],
                },
            };
        });

        it('should return false if record is (stored and pending restore)', () => {
            fakeRecord.entry.allowableOperations = ['update'];
            fakeRecord.entry.properties['gl:contentState'] = 'ARCHIVED';
            fakeRecord.entry.aspectNames = ['gl:archived', 'rma:record'];
            ruleContext.selection = { first: fakeRecord };
            expect(canDeleteStoredRecord(ruleContext)).toBeFalsy();

            fakeRecord.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            ruleContext.selection = { first: fakeRecord };
            expect(canDeleteStoredRecord(ruleContext)).toBeFalsy();
        });

        it(`should return false if record didn't 'update' permission`, () => {
            ruleContext.selection = { first: fakeRecord };

            fakeRecord.entry.properties['gl:contentState'] = 'RESTORED';
            expect(canDeleteStoredRecord(ruleContext)).toBeFalsy();

            fakeRecord.entry.properties['gl:contentState'] = null;
            expect(canDeleteStoredRecord(ruleContext)).toBeFalsy();
        });

        it('should return true if record  has `update` permission and not stored', () => {
            fakeRecord.entry.allowableOperations = ['update'];
            fakeRecord.entry.aspectNames = ['rma:record'];

            fakeRecord.entry.properties['gl:contentState'] = 'RESTORED';
            ruleContext.selection = { first: fakeRecord };
            expect(canDeleteStoredRecord(ruleContext)).toBeTruthy();

            fakeRecord.entry.properties['gl:contentState'] = null;
            ruleContext.selection = { first: fakeRecord };
            expect(canDeleteStoredRecord(ruleContext)).toBeTruthy();
        });
    });

    describe('canShareRecord', () => {
        let node: NodeEntry;
        let fakeRecord: NodeEntry;

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

            fakeRecord = {
                entry: { name: 'Record File', aspectNames: ['rma:declaredRecord'] },
            } as NodeEntry;

            ruleContext.repository = { status: { isQuickShareEnabled: true } };
        });

        it('should return true if node is not shared', () => {
            ruleContext.selection = { first: node, file: node };
            expect(canShareRecord(ruleContext)).toBeTruthy();
        });

        it('should return false if node is record', () => {
            ruleContext.selection = { first: fakeRecord, file: fakeRecord };
            expect(canShareRecord(ruleContext)).toBeFalsy();
        });

        it('should return true if node is shared', () => {
            node.entry.properties['qshare:sharedId'] = 'fake-id';
            ruleContext.selection = { first: node, file: node };
            expect(canShareRecord(ruleContext)).toBeTruthy();
        });
    });

    describe('canEditSharedURL', () => {
        let node: NodeEntry;
        let fakeRecord: NodeEntry;

        beforeEach(() => {
            node = <NodeEntry>{
                entry: {
                    name: 'Node Action',
                    id: 'fake-id',
                    isFile: true,
                    aspectNames: [],
                    allowableOperations: [],
                    properties: {},
                },
            };

            fakeRecord = <NodeEntry>{
                entry: { name: 'Record File', aspectNames: ['rma:declaredRecord'] },
            };

            ruleContext.repository = { status: { isQuickShareEnabled: true } };
        });

        it('should return false if node is not shared', () => {
            ruleContext.selection = { first: node, file: node };
            expect(canEditSharedURL(ruleContext)).toBeFalsy();
        });

        it('should return false if node is record', () => {
            ruleContext.selection = { first: fakeRecord, file: fakeRecord };
            expect(canEditSharedURL(ruleContext)).toBeFalsy();
        });

        it('should return true if node is shared', () => {
            node.entry.properties['qshare:sharedId'] = 'fake-id';
            ruleContext.selection = { first: node, file: node };
            expect(canEditSharedURL(ruleContext)).toBeTruthy();
        });
    });
});
