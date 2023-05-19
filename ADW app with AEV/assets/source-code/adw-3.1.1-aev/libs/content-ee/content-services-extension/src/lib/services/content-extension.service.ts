/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ContentExtensionService {
    constructor(private appConfigService: AppConfigService) {
        this.appConfigService.onLoad
            .pipe(
                take(1),
                map(() => true)
            )
            .subscribe((isContentEnabled) => {
                if (isContentEnabled) {
                    this.enablePlugin();
                }
            });
    }

    enablePlugin() {
        if (localStorage && localStorage.getItem('contentServices') === null) {
            localStorage.setItem('contentServices', 'true');
        }
    }
}
