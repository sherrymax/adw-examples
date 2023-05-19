/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderContext } from '@angular-devkit/architect';
import { executeBrowserBuilder, BrowserBuilderOutput } from '@angular-devkit/build-angular';
import { Schema as BrowserBuilderSchema } from '@angular-devkit/build-angular/src/builders/browser/schema';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { invokeBuilderHook } from '../../helpers/invoke-builder-hook';

export function runBuilder(options: BrowserBuilderSchema, context: BuilderContext): Observable<BrowserBuilderOutput> {
    return invokeBuilderHook(context, 'prebuild').pipe(
        switchMap(() => executeBrowserBuilder(options, context as any))
    );
}

export default createBuilder<json.JsonObject & BrowserBuilderSchema>(runBuilder) as any; // Since we are using an internal contract...
