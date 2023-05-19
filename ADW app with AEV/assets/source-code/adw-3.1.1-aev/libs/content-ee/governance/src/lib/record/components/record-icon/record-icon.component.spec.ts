/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordIconComponent } from './record-icon.component';
import { NodeEntry } from '@alfresco/js-api/src/api/content-rest-api/model/nodeEntry';
import { setupTestBed, ThumbnailService } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovernanceTestingModule } from '../../../testing/governance-test.module';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('IconComponent', () => {
    let fixture: ComponentFixture<RecordIconComponent>;
    let component: RecordIconComponent;
    let defaultIcon: string;
    let thumbnailService: ThumbnailService;
    const fakeNodeWithMime: NodeEntry = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            content: { mimeType: 'image/png' },
            aspectNames: [],
        },
    };
    const fakeNodeNUllMime: NodeEntry = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            content: { mimeType: null },
            aspectNames: [],
        },
    };
    const fakeNodeWithOutMime: NodeEntry = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            aspectNames: [],
        },
    };
    const fakeFolder: NodeEntry = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: false,
            aspectNames: [],
        },
    };
    const fakeLockNode: NodeEntry = <NodeEntry>{
        entry: {
            name: 'Node Action',
            id: 'fake-id',
            isFile: true,
            isLocked: true,
            aspectNames: ['rma:record'],
        },
    };

    setupTestBed({
        imports: [GovernanceTestingModule, MatIconTestingModule],
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordIconComponent);
        component = fixture.componentInstance;
        thumbnailService = TestBed.inject(ThumbnailService);
        defaultIcon = thumbnailService.getDefaultMimeTypeIcon();
        component.node = null;
    });

    describe('getIcon function', () => {
        it('should return mime type when node having mime', () => {
            expect(component.getIcon(fakeNodeWithMime)).toEqual({
                type: 'existing',
                icon: 'adf:image/png',
            });
        });

        it('should return file when node not having mime', () => {
            expect(component.getIcon(fakeNodeWithOutMime)).toEqual({
                type: 'image',
                icon: defaultIcon,
            });
        });

        it('should return file when node mime is null', () => {
            expect(component.getIcon(fakeNodeNUllMime)).toEqual({
                type: 'image',
                icon: defaultIcon,
            });
        });

        it('should return folder when node is folder', () => {
            expect(component.getIcon(fakeFolder)).toEqual({
                type: 'existing',
                icon: 'adf:folder',
            });
        });

        it('should return lock when node is locked', () => {
            expect(component.getIcon(fakeLockNode)).toEqual({
                type: 'image',
                icon: 'assets/images/baseline-lock-24px.svg',
            });
        });
    });

    it('should assign mime type icon when node having mime', () => {
        component.node = fakeNodeWithMime;
        fixture.detectChanges();
        expect(component.icon).toBe('adf:image/png');
    });

    it('should assign file icon when node not having mime', () => {
        component.node = fakeNodeWithOutMime;
        fixture.detectChanges();
        expect(component.icon).toBe(defaultIcon);
    });
});
