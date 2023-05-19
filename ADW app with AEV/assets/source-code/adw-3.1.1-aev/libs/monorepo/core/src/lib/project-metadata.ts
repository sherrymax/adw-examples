/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProjectMetadataJson, LoggerLike, WorkspaceProjectLike } from './monorepo.interfaces';
import { HookExecutionEnvironment } from './hook-execution-environment';
import { join, resolve } from 'path';
import * as fs from 'fs';
import { MonorepoUtils } from './monorepo.utils';

export class ProjectMetadata {
    constructor(
        public readonly name: string,
        private projectMetadata: ProjectMetadataJson,
        readonly workspaceProject: WorkspaceProjectLike,
        private logger?: LoggerLike
    ) {}

    get packageJsonPath() {
        return this.projectMetadata.standalone?.projectRoot ?
            join(this.standaloneProjectRootPath, 'package.json') :
            null;
    }

    get standaloneProjectRootPath() {
        return this.projectMetadata.standalone?.projectRoot ?
            join(process.cwd(), this.workspaceProject.root, this.projectMetadata.standalone.projectRoot) :
            null;
    }

    get suffixlessReleaseVersion() {
        return this.projectMetadata.deploy?.releaseVersion;
    }

    get releaseVersion() {
        return this.projectMetadata.deploy?.releaseVersion + this.tagVersionSuffix;
    }

    get tagAliases() {
        return this.projectMetadata.deploy?.tagAliases;
    }

    get tagVersionSuffix() {
        return this.projectMetadata.deploy?.tagVersionSuffix;
    }

    isStandalone(): boolean {
        return !!this.projectMetadata.standalone && !!this.projectMetadata.standalone.projectRoot;
    }

    hookExists(hookName: string): boolean {
        return !!this.projectMetadata.scripts?.[hookName];
    }

    isDeployable(): boolean {
        return !!this.projectMetadata.deploy;
    }

    triggerHook(hook: string): void {
        const hookEnv = new HookExecutionEnvironment(this.logger);

        HookExecutionEnvironment.setVariables({
            'THIS_PROJECT': this.name,
            'THIS_PROJECT_ROOT_PATH': resolve(process.cwd(), this.workspaceProject.root),
            'THIS_PROJECT_SOURCE_ROOT_PATH': resolve(process.cwd(), this.workspaceProject.sourceRoot)
        });

        (this.projectMetadata?.scripts?.[hook] ?? [])
            .forEach(item => hookEnv.invokeCommand(item.command, item.args ?? []));
    }

    updateProjectReleaseVersion(newVersion: string, aliases: string[]): void {
        this.projectMetadata.deploy.releaseVersion = newVersion;
        this.projectMetadata.deploy.tagAliases = aliases;
        fs.writeFileSync(MonorepoUtils.projectJsonPath(this.workspaceProject.root), JSON.stringify(this.projectMetadata, null, 2));
    }
}
