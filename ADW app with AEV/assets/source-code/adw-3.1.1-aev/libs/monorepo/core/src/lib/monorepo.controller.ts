/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { existsSync } from 'fs';
import { LoggerLike, ProjectMetadataJson, WorkspaceProjectLike } from './monorepo.interfaces';
import { ProjectMetadata } from './project-metadata';
import { WorkspaceConfig } from './workspace-config';
import { MonorepoUtils } from './monorepo.utils';

class MissingProjectMetadataError extends Error {}
class NonExistingProjectError extends Error {}

export class MonorepoController {
    static triggerHookOnEveryProject(hook: string, logger: LoggerLike, requireMethod = require): void {
        const workspaceConfig = new WorkspaceConfig();
        return workspaceConfig.getProjectNames()
            .map(projectName => {
                try {
                    return MonorepoController.createMonorepoProject(projectName, workspaceConfig.getProject(projectName), logger, requireMethod);
                } catch (error) {
                    if (error instanceof MissingProjectMetadataError) {
                        return {
                            hookExists: () => false
                        } as unknown as ProjectMetadata;
                    } else {
                        throw error;
                    }
                }
            })
            .filter(monorepoProject => monorepoProject.hookExists(hook))
            .forEach(monorepoProject => {
                logger.info(`Executing ${hook} hook for ${monorepoProject.name}`);
                monorepoProject.triggerHook(hook);
            });
    }

    static triggerHookOnProject(projectName: string, hook: string, logger: LoggerLike, requireMethod = require): void {
        const monorepoProject = MonorepoController.getMonorepoProject(projectName, logger, requireMethod);
        if (monorepoProject.hookExists(hook)) {
            logger.info(`Executing ${hook} hook for ${projectName}`);
            monorepoProject.triggerHook(hook);
        } else {
            logger.debug(`Hook: ${hook} is not defined for project: ${projectName}`);
        }
    }

    static getMonorepoProject(projectName: string, logger?: LoggerLike, requireMethod = require): ProjectMetadata {
        const workspaceProjectData = MonorepoController.getMonorepoProjectConfig(projectName);

        return MonorepoController.createMonorepoProject(projectName, workspaceProjectData, logger, requireMethod);
    }

    static getMonorepoProjectConfig(projectName: string): WorkspaceProjectLike {
        const workspaceConfig = new WorkspaceConfig();
        const workspaceProjectData = workspaceConfig.getProject(projectName);
        if (!workspaceProjectData) {
            throw new NonExistingProjectError(`Project (${projectName}) doesn't exist in workspace file`);
        }
        return workspaceProjectData;
    }

    static getStandaloneProjects(logger?: LoggerLike, requireMethod = require): ProjectMetadata[] {
        const workspaceConfig = new WorkspaceConfig();
        return workspaceConfig.getProjectNames()
            .map(projectName => {
                try {
                    return MonorepoController.createMonorepoProject(projectName, workspaceConfig.getProject(projectName), logger, requireMethod);
                } catch (error) {
                    if (error instanceof MissingProjectMetadataError) {
                        return { isStandalone: () => false } as ProjectMetadata;
                    } else {
                        throw error;
                    }
                }
            })
            .filter(monorepoProject => monorepoProject.isStandalone());
    }

    static getDeployableProjects(logger?: LoggerLike, requireMethod = require): ProjectMetadata[] {
        const workspaceConfig = new WorkspaceConfig();
        return workspaceConfig.getProjectNames()
            .map(projectName => {
                try {
                    return MonorepoController.createMonorepoProject(projectName, workspaceConfig.getProject(projectName), logger, requireMethod);
                } catch (error) {
                    if (error instanceof MissingProjectMetadataError) {
                        return { isDeployable: () => false } as ProjectMetadata;
                    } else {
                        throw error;
                    }
                }
            })
            .filter(monorepoProject => monorepoProject.isDeployable());
    }

    private static createMonorepoProject(
        projectName: string,
        workspaceProjectData: WorkspaceProjectLike,
        logger?: LoggerLike,
        requireMethod = require
    ): ProjectMetadata {
        const projectJsonPath = MonorepoUtils.projectJsonPath(workspaceProjectData.root);
        if (existsSync(projectJsonPath)) {
            const projectDefinition: ProjectMetadataJson = requireMethod(projectJsonPath);

            return new ProjectMetadata(
                projectName,
                projectDefinition,
                workspaceProjectData,
                logger
            );
        } else {
            throw new MissingProjectMetadataError(`Project monorepo metadata, can't be found: ${projectJsonPath}`);
        }

    }
}
