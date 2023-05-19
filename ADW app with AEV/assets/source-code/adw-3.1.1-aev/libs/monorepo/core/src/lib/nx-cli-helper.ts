/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// cspell:disable-next-line
const merge = require('deepmerge');
import { WorkspaceProjectLike, WorkspaceProjectsLike } from './monorepo.interfaces';
import { WorkspaceConfig } from './workspace-config';
interface ProjectDefinition {
    projectName: string;
    tags: string[];
}

function ensureGetWorkspaceProjects(getWorkspaceProjects: () => WorkspaceProjectsLike): () => WorkspaceProjectsLike {
    if (!getWorkspaceProjects) {
        const workspaceConfig = new WorkspaceConfig();
        return workspaceConfig.getProjects.bind(workspaceConfig);
    }

    return getWorkspaceProjects;
}

export class NxCliHelper {
    static loadNxJsonConfig(): { projects: { [projectName: string]: WorkspaceProjectLike } } {
        const join = require('path').join;
        return require(join(process.cwd(), 'nx.json'));
    }

    static projectsWithTag(tags: string[], getWorkspaceProjects, requireNx) {
        return NxCliHelper.projectsByPredicate(
            project => project.tags ? NxCliHelper.filterProjectsByTags(project, tags) : false,
            getWorkspaceProjects,
            requireNx
        );
    }

    static projectsWithoutTag(tags: string[], getWorkspaceProjects, requireNx) {
        return NxCliHelper.projectsByPredicate(
            project => project.tags ? !NxCliHelper.filterProjectsByTags(project, tags) : true,
            getWorkspaceProjects,
            requireNx
        );
    }

    static projectsWithName(name: string, getWorkspaceProjects?: () => WorkspaceProjectsLike) {
        getWorkspaceProjects = ensureGetWorkspaceProjects(getWorkspaceProjects);
        return Object.keys(getWorkspaceProjects())
            .filter(project => project === name)
            .join(',');
    }

    private static filterProjectsByTags(project: ProjectDefinition, tags: string[]) {
        const projectList = [];
        if (tags) {
            for (const tag of tags) {
                projectList.push(project.tags.includes(tag));
            }
        } else {
            return false;
        }
        return projectList.includes(true);
    }

    private static projectsByPredicate(
        predicate: (p: ProjectDefinition) => boolean,
        getWorkspaceProjects?: () => WorkspaceProjectsLike,
        loadNxJsonConfig = NxCliHelper.loadNxJsonConfig
    ): string {
        getWorkspaceProjects = ensureGetWorkspaceProjects(getWorkspaceProjects);

        const allProjectDefinitions: {[projectName: string]: WorkspaceProjectLike} = merge(loadNxJsonConfig().projects, getWorkspaceProjects());

        const matchingProjects = Object.keys(allProjectDefinitions)
            .map(projectName => ( {
                projectName,
                tags: allProjectDefinitions[projectName].tags || []
            }))
            .filter(predicate)
            .map(projectWithTag => projectWithTag.projectName);

        const uniqueValues = Array.from(new Set(matchingProjects)).join(',');
        return uniqueValues;
    }
}
