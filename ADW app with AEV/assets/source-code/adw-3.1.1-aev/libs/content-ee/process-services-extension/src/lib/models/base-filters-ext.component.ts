/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Input, Output, EventEmitter, Directive } from '@angular/core';
import { FilterParamsModel, FilterRepresentationModel } from '@alfresco/adf-process-services';
import { UserProcessInstanceFilterRepresentation } from '@alfresco/js-api';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseFiltersExtComponent {
    @Input()
    currentFilter: FilterParamsModel | UserProcessInstanceFilterRepresentation;

    @Output()
    filterSelected = new EventEmitter<FilterRepresentationModel | UserProcessInstanceFilterRepresentation>();

    appId = null;
    showIcons = false;
}
