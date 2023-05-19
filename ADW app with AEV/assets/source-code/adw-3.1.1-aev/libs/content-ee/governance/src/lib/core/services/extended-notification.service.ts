/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { TranslationService, NotificationService } from '@alfresco/adf-core';

@Injectable({
    providedIn: 'root',
})
export class ExtendedNotificationService {
    constructor(private notificationService: NotificationService, private translationService: TranslationService) {}

    public sendNotificationMessage(messageKey, messageArgs?: any) {
        const message = this.translationService.instant(messageKey, messageArgs);
        this.notificationService.openSnackMessage(message, 3000);
    }
}
