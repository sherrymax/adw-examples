/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ReloadDocumentListAction } from '@alfresco-dbp/content-ce/shared/store';

@Injectable({
    providedIn: 'root',
})
export class ReloadDocumentListService {
    refreshDocumentList = new Subject<any>();

    constructor(private store: Store<any>) {
        this.refreshDocumentList.subscribe(() => this.emitReloadEffect());
    }

    emitReloadEffect() {
        this.store.dispatch(new ReloadDocumentListAction());
    }
}
