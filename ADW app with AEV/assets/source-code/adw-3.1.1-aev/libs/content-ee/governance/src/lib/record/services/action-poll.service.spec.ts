/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NodesApiService, AlfrescoApiServiceMock, AppConfigService, ContentService, StorageService } from '@alfresco/adf-core';
import { ActionPollService } from './action-poll.service';
import { of } from 'rxjs';
import { fakeNode } from '../rules/mock-data';
import { isPendingRestore } from '../../glacier/rules/glacier-evaluator';
import { NodePaging } from '@alfresco/js-api';
import { ExtensionService } from '@alfresco/adf-extensions';

describe('ActionPollService', () => {
    const fakeAlfrescoApi = new AlfrescoApiServiceMock(new AppConfigService(null, { setup$: of() } as ExtensionService), new StorageService());
    const nodeApiService: NodesApiService = new NodesApiService(fakeAlfrescoApi, null);
    const contentService: ContentService = new ContentService(null, null, null, null, null, null);
    const actionPoll = new ActionPollService(nodeApiService, contentService);

    const fakeNodeChildrenWithTwoEntry = {
        list: {
            entries: [{ entry: { isFile: true, id: '999-001' } }, { entry: { isFile: true, id: '999-002' } }],
        },
    } as NodePaging;

    const fakeNodeChildrenWithThreeEntry = {
        list: {
            entries: [{ entry: { isFile: true, id: '999-001' } }, { entry: { isFile: true, id: '999-002' } }, { entry: { isFile: true, id: '999-003' } }],
        },
    } as NodePaging;

    const fakeNodeChildrenWithOneEntry = {
        list: {
            entries: [{ entry: { isFile: true, id: '999-001' } }],
        },
    } as NodePaging;

    describe('when checks node not in the folder', () => {
        it('should emit the node page when the node-id is not a children', (done) => {
            spyOn(nodeApiService, 'getNodeChildren').and.returnValue(of(fakeNodeChildrenWithOneEntry));
            actionPoll.checkNodeDeletedFromFolder('999-002', 'parent-id-folder').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(node.list.entries.length).toBe(1);
                expect(node.list.entries[0].entry.id).not.toBe('999-002');
                done();
            });
        });

        it('should retry the calls unless the node-id is not a children', (done) => {
            spyOn(nodeApiService, 'getNodeChildren').and.returnValues(of(fakeNodeChildrenWithThreeEntry), of(fakeNodeChildrenWithTwoEntry), of(fakeNodeChildrenWithOneEntry));
            actionPoll.checkNodeDeletedFromFolder('999-002', 'parent-id-folder').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(node.list.entries.length).toBe(1);
                expect(nodeApiService.getNodeChildren).toHaveBeenCalledTimes(3);
                done();
            });
        });
    });

    describe('when checks node is into folder', () => {
        it('should emit the node page when the node-id is a children', (done) => {
            spyOn(nodeApiService, 'getNodeChildren').and.returnValue(of(fakeNodeChildrenWithOneEntry));
            actionPoll.checkNodeInFolder('999-001', 'parent-id-folder').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(node.list.entries.length).toBe(1);
                expect(node.list.entries[0].entry.id).toBe('999-001');
                done();
            });
        });

        it('should retry the calls unless the node-id is a children', (done) => {
            spyOn(nodeApiService, 'getNodeChildren').and.returnValues(of(fakeNodeChildrenWithOneEntry), of(fakeNodeChildrenWithTwoEntry), of(fakeNodeChildrenWithThreeEntry));
            actionPoll.checkNodeInFolder('999-003', 'parent-id-folder').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(node.list.entries.length).toBe(3);
                expect(nodeApiService.getNodeChildren).toHaveBeenCalledTimes(3);
                done();
            });
        });
    });

    describe('checkNodeWithProperty', () => {
        it('should emit the node page when the node-id with updated property', (done) => {
            const response = JSON.parse(JSON.stringify(fakeNode));
            response.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            spyOn(contentService, 'getNode').and.returnValue(of(response));
            actionPoll.checkNodeWithProperty('999-001', 'gl:contentState', 'PENDING_RESTORE').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(isPendingRestore(node)).toBeTruthy();
                expect(contentService.getNode).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should retry the calls till node get updated', (done) => {
            const response = JSON.parse(JSON.stringify(fakeNode));
            const responseThree = JSON.parse(JSON.stringify(fakeNode));
            responseThree.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            spyOn(contentService, 'getNode').and.returnValues(of(response), of(response), of(responseThree));
            actionPoll.checkNodeWithProperty('999-001', 'gl:contentState', 'PENDING_RESTORE').subscribe((node: any) => {
                expect(node).not.toBeNull();
                expect(isPendingRestore(node)).toBeTruthy();
                expect(contentService.getNode).toHaveBeenCalledTimes(3);
                done();
            });
        });

        it('should retry the calls till node get retry count finish', (done) => {
            const response = JSON.parse(JSON.stringify(fakeNode));
            spyOn(contentService, 'getNode').and.returnValues(of(response), of(response));
            actionPoll.checkNodeWithProperty('999-001', 'gl:contentState', 'PENDING_RESTORE', 2).subscribe(
                () => {},
                (res) => {
                    expect(res).toBeFalsy();
                },
                () => {
                    expect(contentService.getNode).toHaveBeenCalledTimes(2);
                    done();
                }
            );
        });
    });
});
