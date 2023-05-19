/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { WorkspaceProjectLike } from './monorepo.interfaces';
import { NxCliHelper } from './nx-cli-helper';

const workspaceProjects = {
    mockProject1: {
        tags: ['category:a']
    },
    mockProject2: {
        tags: ['category:b']
    },
    mockProject3: {
        tags: ['category:c']
    }
};

const mockNxJson = {
    projects: {
        mockProject1: {
            tags: ['category:a']
        },
        mockProject4: {
            tags: ['category:d']
        },
        mockProject5: {
            tags: ['category:e']
        }
    }
};

function requireNxMock() {
    return mockNxJson;
}

function getWorkspaceProjects() {
    return workspaceProjects as unknown as { [projectName: string]: WorkspaceProjectLike };
}

describe('NxCliHelper', () => {

    it('should return empty when no tags are passed to projectsWithTag function', () => {
        const res = NxCliHelper.projectsWithTag(undefined, getWorkspaceProjects, requireNxMock);
        expect(res).toBe('');
    });

    it('should return projects with the tags passed to projectsWithTag function', () => {
        const result1 = NxCliHelper.projectsWithTag(['category:a'], getWorkspaceProjects, requireNxMock);
        expect(result1).toBe('mockProject1');

        const result2 = NxCliHelper.projectsWithTag(['category:a', 'category:b', 'category:e'], getWorkspaceProjects, requireNxMock);
        expect(result2).toBe('mockProject1,mockProject5,mockProject2');
    });

    it('should return projects without the tags passed to projectsWithoutTag function', () => {
        const result1 = NxCliHelper.projectsWithoutTag(['category:a'], getWorkspaceProjects, requireNxMock);
        expect(result1).toBe('mockProject4,mockProject5,mockProject2,mockProject3');

        const result2 = NxCliHelper.projectsWithoutTag(['category:a', 'category:b'], getWorkspaceProjects, requireNxMock);
        expect(result2).toBe('mockProject4,mockProject5,mockProject3');
    });

    it('should return project with the name passed to projectsWithName function', () => {
        const result1 = NxCliHelper.projectsWithName('mockProject1', getWorkspaceProjects);
        expect(result1).toBe('mockProject1');
    });

    it('should return empty when no name passed to projectsWithName function', () => {
        const result1 = NxCliHelper.projectsWithName(undefined, getWorkspaceProjects);
        expect(result1).toBe('');
    });
});
