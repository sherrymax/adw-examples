/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { GlacierService } from './glacier.service';
import { GovernanceTestingModule } from '../../testing/governance-test.module';
import { RecordService } from '../../record/services/record.service';
import { fakeNode } from '../../record/rules/mock-data';
import { of, throwError } from 'rxjs';
import { ContentService, LogService } from '@alfresco/adf-core';
import { ActionPollService } from '../../record/services/action-poll.service';

describe('GlacierService', () => {
    let service: GlacierService;
    let recordService: RecordService;
    let logService: LogService;
    let contentService: ContentService;
    let pollingService: ActionPollService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GovernanceTestingModule],
        });
        service = TestBed.inject(GlacierService);
        recordService = TestBed.inject(RecordService);
        logService = TestBed.inject(LogService);
        contentService = TestBed.inject(ContentService);
        pollingService = TestBed.inject(ActionPollService);
    });

    describe('storeGlacier', () => {
        it('should return async execution id when it passed', (done) => {
            spyOn(recordService, 'executeAction').and.returnValue(of({ id: 'fake-id' } as any));
            service.storeRecord(fakeNode.entry).subscribe((res) => {
                expect(recordService.executeAction).toHaveBeenCalledWith({
                    actionDefinitionId: 'archive',
                    targetId: fakeNode.entry.id,
                });
                expect(res.id).toBe('fake-id');
                done();
            });
        });

        it('should return log the error when it failed', (done) => {
            spyOn(recordService, 'executeAction').and.returnValue(throwError('fake-error'));
            spyOn(logService, 'error').and.stub();

            service.storeRecord(fakeNode.entry).subscribe(
                () => {},
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('restoreGlacier', () => {
        let actionApi: jasmine.Spy;
        let contentApi: jasmine.Spy;
        let downloadApi: jasmine.Spy;
        let pollingApi: jasmine.Spy;

        beforeEach(() => {
            actionApi = spyOn(recordService, 'executeAction');
            downloadApi = spyOn(contentService, 'getNodeContent');
            contentApi = spyOn(contentService, 'getNode');
            pollingApi = spyOn(pollingService, 'checkNodeWithProperty');
        });

        it('should return boolean when it passed', (done) => {
            resetStorage();
            const fakeResponse = JSON.parse(JSON.stringify(fakeNode));
            actionApi.and.returnValue(of({}));
            contentApi.and.returnValue(of(fakeResponse));
            downloadApi.and.returnValue(of({}));
            pollingApi.and.returnValue(of(fakeResponse));
            spyOn(Date, 'now').and.returnValue(123);
            service.restoreRecord(fakeNode.entry, 'Expedited', 6).subscribe((res) => {
                expect(recordService.executeAction).toHaveBeenCalledWith({
                    actionDefinitionId: 'restore',
                    targetId: fakeNode.entry.id,
                    params: {
                        'expiration-days': 6,
                        tier: 'Expedited',
                    },
                });
                expect(contentService.getNodeContent).toHaveBeenCalled();
                expect(contentService.getNode).toHaveBeenCalled();
                expect(res).toBeFalsy();
                expect(service.getRestoreCache('fake-id')).toEqual({
                    type: 'Expedited',
                    days: 6,
                    initiated: 123,
                });
                done();
            });
        });

        it('should not poll when node is updated immediately', (done) => {
            resetStorage();
            const response = JSON.parse(JSON.stringify(fakeNode));
            response.entry.properties['gl:contentState'] = 'PENDING_RESTORE';
            actionApi.and.returnValue(of({}));
            downloadApi.and.returnValue(of({}));
            contentApi.and.returnValue(of(response));
            pollingApi.and.returnValue(of({}));
            spyOn(Date, 'now').and.returnValue(123);
            service.restoreRecord(fakeNode.entry, 'Expedited', 6).subscribe((res) => {
                expect(recordService.executeAction).toHaveBeenCalledWith({
                    actionDefinitionId: 'restore',
                    targetId: fakeNode.entry.id,
                    params: {
                        'expiration-days': 6,
                        tier: 'Expedited',
                    },
                });
                expect(contentService.getNodeContent).toHaveBeenCalled();
                expect(contentService.getNode).toHaveBeenCalled();
                expect(pollingService.checkNodeWithProperty).not.toHaveBeenCalled();
                expect(res).toEqual(true);
                expect(service.getRestoreCache('fake-id')).toEqual({
                    type: 'Expedited',
                    days: 6,
                    initiated: 123,
                });
                done();
            });
        });

        it('should return log the error when it failed', (done) => {
            actionApi.and.returnValue(throwError('fake-error'));
            spyOn(logService, 'error').and.stub();

            service.restoreRecord(fakeNode.entry, 'Expedited', '6').subscribe(
                () => {},
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });

    describe('cache testing', () => {
        beforeEach(() => {
            resetStorage();
        });

        it('should store the data for the first time', () => {
            spyOn(Date, 'now').and.returnValue(123);
            expect(service.getRestoreCache('fake-id')).toBeFalsy();
            service.updateCache('fake-id', 2, 'Standard');
            expect(service.getRestoreCache('fake-id')).toBeTruthy();
            expect(service.getRestoreCache('fake-id')).toEqual({
                type: 'Standard',
                days: 2,
                initiated: 123,
            });
        });

        it('should update the stored data for if data is there', () => {
            spyOn(Date, 'now').and.returnValue(123);
            service.updateCache('fake-id', 2, 'Standard');
            expect(service.getRestoreCache('fake-id')).toEqual({
                type: 'Standard',
                days: 2,
                initiated: 123,
            });

            service.updateCache('fake-id', 2, 'Bulk');
            expect(service.getRestoreCache('fake-id')).toEqual({
                type: 'Bulk',
                days: 4,
                initiated: 123,
            });
        });
    });

    describe('extendRestore', () => {
        it('should return async execution id when it passed', (done) => {
            spyOn(recordService, 'executeAction').and.returnValue(of({ entry: { id: 'fake-id' } }));
            spyOn(service, 'updateCache').and.callThrough();
            service.extendRestore(fakeNode.entry, 'fake-type', 5).subscribe((res) => {
                expect(recordService.executeAction).toHaveBeenCalledWith({
                    actionDefinitionId: 'restore',
                    targetId: 'fake-id',
                    params: {
                        'expiration-days': 5,
                        tier: 'fake-type',
                    },
                });
                expect(service.updateCache).toHaveBeenCalled();
                expect(res.entry.id).toBe('fake-id');
                done();
            });
        });

        it('should return log the error when it failed', (done) => {
            spyOn(recordService, 'executeAction').and.returnValue(throwError('fake-error'));
            spyOn(logService, 'error').and.stub();

            service.extendRestore(fakeNode.entry, 'fake', 6).subscribe(
                () => {},
                () => {
                    expect(logService.error).toHaveBeenCalled();
                    done();
                }
            );
        });
    });
});

function resetStorage() {
    localStorage.removeItem('fake-id__restore_info');
}
