/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BuilderContext } from '@angular-devkit/architect';
import { MonorepoController } from '@alfresco-dbp/monorepo/core';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function invokeBuilderHook(context: BuilderContext, hookName: string): Observable<any> {
    return from(context.getProjectMetadata(context.target)).pipe(
        tap(() => {
            MonorepoController.triggerHookOnProject(context.target.project, hookName, context.logger);
        })
    );
}
