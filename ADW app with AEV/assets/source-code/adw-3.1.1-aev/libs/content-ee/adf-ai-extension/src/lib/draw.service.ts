/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { NotificationService } from '@alfresco/adf-core';

@Injectable()
export class DrawService {
    constructor(private notificationService: NotificationService) {}

    drawPolygon(point, width, height, parenElement, label) {
        const w = point.width * width;
        const h = point.height * height;
        const left = point.left * width;
        const top = point.top * height;

        const box = document.createElement('div');
        box.setAttribute(
            'style',
            `position: absolute; top: ${top}px; left: ${left}px; height: ${h}px; width: ${w}px; border: 1.45576px solid rgba(255, 255, 255, 0.69); border-radius: 3%;`
        );
        box.setAttribute('class', 'adf-ai-box-shadow');

        const tooltip = document.createElement('div');
        tooltip.setAttribute('class', 'adf-ai-tooltip hidden');
        tooltip.innerText = label;
        box.appendChild(tooltip);

        box.addEventListener('dblclick', () => this.copyClipboard(tooltip));

        parenElement.appendChild(box);
    }

    copyClipboard(copyText: any) {
        const textArea = document.createElement('textarea');
        textArea.value = copyText.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('Copy');
        textArea.remove();

        this.notificationService.openSnackMessage('Content Copied in the clipboard');
    }
}
