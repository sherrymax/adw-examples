/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'path';

export const MONOREPO_PROJECT_METADATA_FILE = 'project.metadata.json';
export class MonorepoUtils {
    static projectJsonPath(root: string, cwd = process.cwd()) {
        return resolve(cwd, root, MONOREPO_PROJECT_METADATA_FILE);
    }
}
