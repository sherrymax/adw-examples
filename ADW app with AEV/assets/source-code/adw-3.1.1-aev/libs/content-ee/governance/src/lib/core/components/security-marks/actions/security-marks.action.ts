/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action } from '@ngrx/store';
import { Node } from '@alfresco/js-api';

export const MANAGE_SECURITY_MARK = 'MANAGE_SECURITY_MARK';

export class ManageSecurityMarksAction implements Action {
    readonly type = MANAGE_SECURITY_MARK;

    constructor(public payload: Node) {}
}
