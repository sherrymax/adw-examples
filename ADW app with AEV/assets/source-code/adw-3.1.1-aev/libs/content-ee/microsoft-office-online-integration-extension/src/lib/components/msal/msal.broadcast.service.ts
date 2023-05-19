/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MsalBroadcastEvent } from './constants';
import { AuthenticationResult, AuthError } from '@azure/msal-browser';

export interface MsalBroadcastMessage {
    type: MsalBroadcastEvent;
    payload: AuthenticationResult | AuthError;
}

@Injectable({ providedIn: 'root' })
export class MsalBroadcastService {
    private msalSubject: Subject<any>;
    public msalSubject$: Observable<any>;

    constructor() {
        this.msalSubject = new Subject<MsalBroadcastMessage>();
        this.msalSubject$ = this.msalSubject.asObservable();
    }

    broadcast(type: MsalBroadcastEvent, payload: AuthenticationResult | AuthError) {
        this.msalSubject.next({ type, payload });
    }
}
