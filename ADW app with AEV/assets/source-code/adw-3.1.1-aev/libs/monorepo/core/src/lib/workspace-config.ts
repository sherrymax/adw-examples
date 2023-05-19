/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { join } from 'path';
import { Workspaces } from '@nrwl/tao/src/shared/workspace';
import { WorkspaceConfigLike, WorkspaceProjectLike, WorkspaceProjectsLike } from './monorepo.interfaces';

export class WorkspaceConfig {
    private workspaces: Workspaces;
    constructor(private rootPath = process.cwd()) {}

    getProjects(): WorkspaceProjectsLike {
        if (!this.workspaces) {
            this.load();
        }
        return this.workspaces.readWorkspaceConfiguration().projects;
    }

    getProject(projectName: string): WorkspaceProjectLike {
        return this.getProjects()[projectName];
    }

    getProjectNames(): string[] {
        return Object.keys(this.getProjects());
    }

    getPackageJson() {
        return require(join(process.cwd(), 'package.json'));
    }

    private load(): WorkspaceConfigLike {
        this.workspaces = new Workspaces(this.rootPath);
        return this.workspaces.readWorkspaceConfiguration();
    }

    get version(): number {
        return this.workspaces.readWorkspaceConfiguration().version;
    }

    get schema(): string {
        return this.workspaces.readWorkspaceConfiguration()['$schema'];
    }
}
