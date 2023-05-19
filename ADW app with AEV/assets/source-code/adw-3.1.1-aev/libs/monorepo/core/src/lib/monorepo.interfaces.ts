/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface MonorepoProjectScript {
    command: string;
    args: string[];
}

export interface MonorepoProjectScripts {
    preinstall?: MonorepoProjectScript[];
    postinstall?: MonorepoProjectScript[];
    prebuild?: MonorepoProjectScript[];
    postbuild?: MonorepoProjectScript[];
    prestart?: MonorepoProjectScript[];
    poststart?: MonorepoProjectScript[];
}

export interface MonorepoProjectDeploy {
    releaseVersion: string;
    tagAliases: string[];
    tagVersionSuffix: string;
}

export interface MonorepoStandaloneProject {
    projectRoot: string;
}

export interface ProjectMetadataJson {
    scripts?: MonorepoProjectScripts;
    deploy?: MonorepoProjectDeploy;
    standalone?: MonorepoStandaloneProject;
}

export interface WorkspaceProjectLike {
    root: string;
    sourceRoot?: string;
    projectType?: 'application' | 'library';
    targets?: { [key: string]: WorkspaceProjectTargetLike };
    tags?: string[];
}

export interface WorkspaceProjectTargetLike {
    executor: string;
    outputs?: string[];
    options?: any;
    configurations?: {
        [config: string]: any;
    };
    defaultConfiguration?: string;
}

export interface WorkspaceProjectsLike {
    [projectName: string]: WorkspaceProjectLike;
}

export interface WorkspaceConfigLike {
    projects: WorkspaceProjectsLike;
}

export interface LoggerLike {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
