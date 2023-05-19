/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderContext } from '@angular-devkit/architect';
import { DevServerBuilderOptions, DevServerBuilderOutput, executeDevServerBuilder } from '@angular-devkit/build-angular';
import { Observable, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { MonorepoController, HookExecutionEnvironment, WorkspaceConfig } from '@alfresco-dbp/monorepo/core';

function getDevServerUrl(projectName: string) {
    const workspaceConfig = new WorkspaceConfig();
    const workspaceProject = workspaceConfig.getProject(projectName);
    const host = workspaceProject?.targets?.serve?.options.host || 'localhost';
    const port = workspaceProject?.targets?.serve?.options.port || 4200;
    return `http://${host}:${port}`;
}

export function runBuilder(options: DevServerBuilderOptions, context: BuilderContext): Observable<DevServerBuilderOutput> {
    return from(context.getProjectMetadata(context.target)).pipe(
        tap(() => {
            // We need this, because of CORS and proxying
            HookExecutionEnvironment.setVariables({ 'DEV_SERVER_URL': getDevServerUrl(context.target.project) });
            MonorepoController.triggerHookOnProject(context.target.project, 'prestart', context.logger);
        }),
        switchMap(() => executeDevServerBuilder(options, context as any))
    );
}

export default createBuilder<DevServerBuilderOptions, DevServerBuilderOutput>(runBuilder) as any; // Since we are using an internal contract...
