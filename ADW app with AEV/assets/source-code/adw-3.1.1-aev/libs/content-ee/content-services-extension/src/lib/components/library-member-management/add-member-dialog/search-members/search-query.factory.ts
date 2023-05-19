/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { QueryProvider } from '@alfresco/adf-content-services';
import { VersionCompatibilityService } from '@alfresco/adf-core';
import { ACS_VERSIONS } from '../../../../models/types';

@Injectable()
export class SearchQueryFactory implements QueryProvider {
    searchQuery = 'email:*${searchTerm}* OR firstName:*${searchTerm}* OR lastName:*${searchTerm}* OR displayName:*${searchTerm}*';
    constructor(private versionCompatibilityService: VersionCompatibilityService) {}

    get query(): string {
        if (this.versionCompatibilityService.isVersionSupported(ACS_VERSIONS['7'])) {
            /* cspell: disable-next-line */
            return '(' + this.searchQuery + ' OR authorityName:*${searchTerm}* OR authorityDisplayName:*${searchTerm}*) AND ANAME:("0/APP.DEFAULT")';
        }
        return this.searchQuery;
    }
}
