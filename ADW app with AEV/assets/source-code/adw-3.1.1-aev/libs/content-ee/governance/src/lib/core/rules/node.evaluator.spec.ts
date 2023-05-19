/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NodeEntry } from '@alfresco/js-api';
import { isLocked, isNodeHavingProp } from './node.evaluator';

describe('NodeUtils', () => {
    const fakeNode = <NodeEntry>{
        entry: {
            name: 'Record File',
            id: 'fake-id',
            isFile: true,
            aspectNames: ['cm:content'],
            allowableOperations: ['update'],
        },
    };

    describe('string and number type', () => {
        it('Should return true when node having correct props vale', () => {
            expect(isNodeHavingProp(fakeNode, 'name', 'Record File', 'string')).toBeTruthy();
        });

        it('Should return false when node not having correct props vale', () => {
            expect(isNodeHavingProp(fakeNode, 'name', null, 'string')).toBeFalsy();
        });

        it('Should return false when node not having correct props vale', () => {
            expect(isNodeHavingProp(fakeNode, 'name', '123', 'number')).toBeFalsy();
        });
    });

    describe('array type', () => {
        it('Should return true when node having correct props vale', () => {
            expect(isNodeHavingProp(fakeNode, 'aspectNames', 'cm:content', 'array')).toBeTruthy();
        });

        it('Should return false when node not having correct props vale', () => {
            expect(isNodeHavingProp(fakeNode, 'name', null, 'array')).toBeFalsy();
        });
    });

    describe('props', () => {
        it('Should return false when node not having props', () => {
            expect(isNodeHavingProp(fakeNode, 'abc', null, 'string')).toBeFalsy();
        });

        it('Should return false when node not having props', () => {
            expect(isNodeHavingProp(fakeNode, 'abc', null, 'number')).toBeFalsy();
        });

        it('Should return false when node is null', () => {
            expect(isNodeHavingProp(null, 'abc', null, 'string')).toBeFalsy();
        });
    });

    describe('isLocked', () => {
        it('Should return true when node is locked', () => {
            let fakeLockedNode = <NodeEntry>{
                entry: {
                    name: 'Record File',
                    properties: { 'cm:lockType': 'READ_ONLY_LOCK' },
                },
            };
            expect(isLocked(fakeLockedNode)).toBeTruthy();

            fakeLockedNode = <NodeEntry>{
                entry: {
                    name: 'Record File',
                    properties: { 'cm:lockType': 'WRITE_LOCK' },
                },
            };
            expect(isLocked(fakeLockedNode)).toBeTruthy();

            fakeLockedNode = <NodeEntry>{
                entry: { name: 'Record File', isLocked: true },
            };
            expect(isLocked(fakeLockedNode)).toBeTruthy();
        });

        it('Should return false when node is not locked', () => {
            const node = <NodeEntry>{ entry: { name: 'Record File' } };
            expect(isLocked(node)).toBeFalsy();
        });
    });
});
