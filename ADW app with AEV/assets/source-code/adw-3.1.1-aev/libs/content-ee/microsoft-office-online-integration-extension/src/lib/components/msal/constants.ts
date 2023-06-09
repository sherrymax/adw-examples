/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken } from '@angular/core';

export const MSAL_INSTANCE = new InjectionToken<string>('MSAL_INSTANCE');

export const MSAL_GUARD_CONFIG = new InjectionToken<string>('MSAL_GUARD_CONFIG');

export const MSAL_INTERCEPTOR_CONFIG = new InjectionToken<string>('MSAL_INTERCEPTOR_CONFIG');

export enum InteractionType {
    REDIRECT = 'redirect',
    POPUP = 'popup',
    SILENT = 'silent',
}

export enum MsalBroadcastEvent {
    LOGIN_SUCCESS = 'msal:loginSuccess',
    LOGIN_FAILURE = 'msal:loginFailure',
    ACQUIRE_TOKEN_SUCCESS = 'msal:acquireTokenSuccess',
    ACQUIRE_TOKEN_FAILURE = 'msal:acquireTokenFailure',
    SSO_SILENT_SUCCESS = 'msal:ssoSilentSuccess',
    SSO_SILENT_FAILURE = 'msal:ssoSilentFailure',
}
