/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordService } from './record.service';
import {
    AppConfigService,
    NotificationService,
    AlfrescoApiServiceMock,
    NodesApiService,
    LogService,
    ContentService,
    StorageService
} from '@alfresco/adf-core';
import { MinimalNodeEntryEntity, Node, NodeEntry, RecordEntry } from '@alfresco/js-api';
import { of, throwError } from 'rxjs';
import { ActionPollService } from './action-poll.service';
import { NodePaging } from '@alfresco/adf-content-services';
import { ExtensionService } from '@alfresco/adf-extensions';

describe('RecordService', () => {
    const fakeNodeChildrenWithOneEntry = {
        id: 'fake-folder-response-id',
        list: {
            entries: [{ entry: { isFile: true, id: '999-001' } }]
        }
    } as any;

    const fakeNodeToMove: MinimalNodeEntryEntity = <MinimalNodeEntryEntity> {
        name: 'Node Action',
        id: '999-001',
        aspectNames: []
    };
    const fakeFolderMoveTarget: MinimalNodeEntryEntity = <MinimalNodeEntryEntity> {
        name: 'Node Action',
        id: 'fake-folder-id',
        aspectNames: []
    };

    const fakeNodeActionWithParentProperty: MinimalNodeEntryEntity | Node = <MinimalNodeEntryEntity | Node> {
        name: 'Node Action',
        id: '999-002',
        aspectNames: [],
        properties: { 'rma:recordOriginatingLocation': 'parent-id' }
    };
    const fakeNodeAction: MinimalNodeEntryEntity | Node = <MinimalNodeEntryEntity | Node> {
        name: 'Node Action',
        id: 'fake-id',
        aspectNames: []
    };
    const fakeFolderNodeAction: MinimalNodeEntryEntity | Node = <MinimalNodeEntryEntity | Node> {
        name: 'Node Action',
        id: 'fake-id',
        aspectNames: []
    };
    const fakeRecordResponse: RecordEntry = <RecordEntry> {
        entry: { name: 'Record File', aspectNames: [] }
    };
    const fakeErrorMessage = { message: 'ERROR-FAKE' };
    const fakeActionResponse = {
        entry: { id: 'f0fc9762-b480-49f9-9d7f-3eadaf762c8c' }
    };

    const fakeAlfrescoApi = new AlfrescoApiServiceMock(new AppConfigService(null, { setup$: of() } as ExtensionService), new StorageService());

    const notificationService = new NotificationService(null, null, new AppConfigService(null, { setup$: of() } as ExtensionService));
    const nodeApiService: NodesApiService = new NodesApiService(fakeAlfrescoApi, null);
    const contentService: ContentService = new ContentService(null, null, null, null, null, null);
    const actionPoll = new ActionPollService(nodeApiService, contentService);
    const logService = new LogService(null);

    const service = new RecordService(fakeAlfrescoApi, actionPoll, logService);

    beforeEach(() => {
        spyOn(notificationService, 'openSnackMessage').and.returnValue({} as any);
        spyOn(logService, 'error');
    });

    describe('Declare as a record', () => {
        it('should return the record when resolved', (done) => {
            spyOn(service['filesApi'], 'declareRecord').and.returnValue(Promise.resolve(fakeRecordResponse));

            service.declareNodeRecord(fakeNodeAction).subscribe((record: RecordEntry) => {
                expect(record.entry.name).toBe('Record File');
                done();
            });
        });

        it('should log an error when the declare record fails', (done) => {
            spyOn(service['filesApi'], 'declareRecord').and.returnValue(Promise.reject(fakeErrorMessage));

            service.declareNodeRecord(fakeNodeAction).subscribe(
                () => {
                },
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('Reject Warning', () => {
        it('should return the NodeEntry when node gets updated', (done) => {
            spyOn(service['nodesApi'], 'updateNode').and.returnValue(Promise.resolve(fakeRecordResponse as any));

            service.removeNodeRejectedWarning(fakeNodeAction).subscribe((node: NodeEntry) => {
                expect(node.entry.name).toBe('Record File');
                done();
            });
        });

        it('should log an error when the node update failed', (done) => {
            spyOn(service['nodesApi'], 'updateNode').and.returnValue(Promise.reject(fakeErrorMessage));

            service.removeNodeRejectedWarning(fakeNodeAction).subscribe(
                () => {
                },
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('Delete Record', () => {
        it('should return a boolean when the record is deleted successfully', (done) => {
            spyOn(service['recordsApi'], 'deleteRecord').and.returnValue(Promise.resolve(true));

            service.deleteRecord(fakeNodeAction).subscribe((result) => {
                expect(result).toBeTruthy();
                done();
            });
        });

        it('should log the error when the record deletion is unsuccessful', (done) => {
            spyOn(service['recordsApi'], 'deleteRecord').and.returnValue(Promise.reject(fakeErrorMessage));

            service.deleteRecord(fakeNodeAction).subscribe(
                () => {
                },
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('Hide Record', () => {
        it('should return the NodePaging updated when the record is hidden', (done) => {
            spyOn(service, 'executeAction').and.returnValue(of(fakeActionResponse));
            spyOn(nodeApiService, 'getNodeChildren').and.returnValue(of(fakeNodeChildrenWithOneEntry));

            service.hideRecord(fakeNodeActionWithParentProperty).subscribe((folderUpdated) => {
                expect(folderUpdated.list.entries[0].entry.id).toBe('999-001');
                done();
            });
        });

        it('should log an error when record hidden gets failed', (done) => {
            spyOn(service, 'executeAction').and.returnValue(throwError('error'));
            spyOn(nodeApiService, 'getNodeChildren').and.returnValue(fakeNodeChildrenWithOneEntry);

            service.hideRecord(fakeNodeAction).subscribe(
                () => {
                },
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('Move Record', () => {
        it('should return the NodePaging updated when record gets moved', (done) => {
            spyOn(service, 'executeAction').and.returnValue(of(fakeActionResponse));
            spyOn(nodeApiService, 'getNodeChildren').and.returnValue(of(fakeNodeChildrenWithOneEntry));

            service.moveRecord(fakeNodeToMove, fakeFolderMoveTarget).subscribe((folderUpdated: NodePaging) => {
                expect(folderUpdated.list.entries.length).toBe(1);
                expect(folderUpdated.list.entries[0].entry.id).toBe('999-001');
                done();
            });
        });

        it('should log the error message when failed to move the record', (done) => {
            spyOn(service, 'executeAction').and.returnValue(throwError('error'));

            service.moveRecord(fakeNodeAction, fakeFolderNodeAction).subscribe(
                () => {
                },
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });
});
