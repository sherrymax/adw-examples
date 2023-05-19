/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AlfrescoApiService, AuthenticationService } from '@alfresco/adf-core';
import { from, Observable } from 'rxjs';
import { MicrosoftExtensionService } from '../../services/microsoft-extension.service';
import { MicrosoftSessionDetails } from '../../store/effects/microsoft-online.effects';

@Injectable({ providedIn: 'root' })
export class MicrosoftOnlineService {
    private ooiHost = '';

    constructor(private authService: AuthenticationService, private apiService: AlfrescoApiService, private microsoftExtensionService: MicrosoftExtensionService) {
        this.microsoftExtensionService.msalHealthSubject$.subscribe((msalConfig) => {
            if (msalConfig.isActive) {
                this.ooiHost = msalConfig?.auth?.msHost;
            }
        });
    }

    startSession(microsoftTicket: string, nodeId: string): Observable<MicrosoftSessionDetails> {
        const uri = this.ooiHost + nodeId,
            pathParams = {},
            queryParams = {},
            postBody = {},
            formParams = {},
            contentTypes = ['application/json'],
            accepts = ['application/json'],
            headerParams = {
                'X-Authorization-MS-OOI': 'Bearer ' + microsoftTicket,
            };
        return this.authService.isOauth()
            ? from(this.apiService.getInstance().oauth2Auth.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts))
            : from(this.apiService.getInstance().contentClient.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts));
    }

    cancelSession(microsoftTicket: string, nodeId: string): Observable<MicrosoftSessionDetails> {
        const uri = this.ooiHost + nodeId + '/cancel',
            pathParams = {},
            queryParams = {
                ignoreOpenEditors: 'true',
            },
            postBody = {},
            formParams = {},
            contentTypes = ['application/json'],
            accepts = ['application/json'],
            headerParams = {
                'X-Authorization-MS-OOI': 'Bearer ' + microsoftTicket,
            };
        return this.authService.isOauth()
            ? from(this.apiService.getInstance().oauth2Auth.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts))
            : from(this.apiService.getInstance().contentClient.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts));
    }

    endSession(microsoftTicket: string, nodeId: string, isMajor: boolean, comment?: string): Observable<MicrosoftSessionDetails> {
        const uri = this.ooiHost + nodeId + '/end',
            pathParams = {},
            queryParams = { isMajor, comment, ignoreOpenEditors: 'true' },
            postBody = {},
            formParams = {},
            contentTypes = ['application/json'],
            accepts = ['application/json'],
            headerParams = {
                'X-Authorization-MS-OOI': 'Bearer ' + microsoftTicket,
            };
        return this.authService.isOauth()
            ? from(this.apiService.getInstance().oauth2Auth.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts))
            : from(this.apiService.getInstance().contentClient.callCustomApi(uri, 'POST', pathParams, queryParams, headerParams, formParams, postBody, contentTypes, accepts));
    }
}
