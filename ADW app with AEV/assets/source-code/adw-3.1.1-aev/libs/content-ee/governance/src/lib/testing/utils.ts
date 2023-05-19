/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DebugElement } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

export function getToolTipMessage(node: DebugElement) {
    const tooltipDirective = node.injector.get<MatTooltip>(MatTooltip);
    return tooltipDirective.message;
}
