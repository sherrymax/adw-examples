/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { spawnSync } from 'child_process';
import { resolve } from 'path';

export function cspellChecker(options, projectRootPath: string): boolean {
    const files = [`${projectRootPath}/{src,e2e,projects,mocks,pages,resources,tests,models,util,${options.include}}/**/*.ts`];
    const childProcess = spawnSync(`cspell`, [`${files}`, '--no-progress'], { cwd: resolve('./'), stdio: 'pipe' });
    if (childProcess.status !== 0) {
        /* eslint-disable-next-line */
        console.log(String(childProcess.stdout));
        return false;
    }
    return true;
}
