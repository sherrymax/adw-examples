/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderContext } from '@angular-devkit/architect';
import { resolve } from 'path';
import { cspellChecker } from './cspell-checker';
import { json } from '@angular-devkit/core';

interface Options extends json.JsonObject {
    include: string;
}

export default createBuilder(async (options: Options, context: BuilderContext) => {
    const projectAngularData = await context.getProjectMetadata(context.target);
    const projectRootPath = resolve(process.cwd(), projectAngularData.root as string);
    const result = cspellChecker(options, projectRootPath);
    return { success: result };
}) as any; // Since we are using an internal contract...
