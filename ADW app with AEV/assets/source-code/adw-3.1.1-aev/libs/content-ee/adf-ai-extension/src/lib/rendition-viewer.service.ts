/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, Input } from '@angular/core';
import { RenditionEntry, RenditionPaging, RenditionsApi } from '@alfresco/js-api';
import { AlfrescoApiService, LogService } from '@alfresco/adf-core';

@Injectable()
export class RenditionViewerService {
    _renditionsApi: RenditionsApi;
    get renditionsApi(): RenditionsApi {
        this._renditionsApi = this._renditionsApi ?? new RenditionsApi(this.apiService.getInstance());
        return this._renditionsApi;
    }

    /** Number of times the Viewer will retry fetching content Rendition.
     * There is a delay of at least one second between attempts.
     */
    @Input()
    maxRetries = 10;

    statusRendition: string = null;

    constructor(private logService: LogService, private apiService: AlfrescoApiService) {
    }

    async getRendition(nodeId: string, renditionType: string): Promise<any> {
        try {
            return await this.resolveRendition(nodeId, renditionType);
        } catch (err) {
            this.logService.error(err);
        }
    }

    private async resolveRendition(nodeId: string, renditionId: string): Promise<any> {
        const supportedRendition: RenditionPaging = await this.renditionsApi.listRenditions(nodeId);
        this.logService.log(supportedRendition);

        const rendition: RenditionEntry = supportedRendition.list.entries.find((renditionEntry: RenditionEntry) => renditionEntry.entry.id === renditionId);

        let renditionContent;
        if (rendition) {
            const status: string = rendition.entry.status.toString();

            if (status === 'NOT_CREATED') {
                try {
                    await this.renditionsApi.createRendition(nodeId, { id: renditionId }).then(() => {
                        this.statusRendition = 'in_creation';
                    });
                    renditionContent = await this.waitRendition(nodeId, renditionId);
                } catch (err) {
                    this.logService.error(err);
                }
            } else if (status === 'CREATED') {
                renditionContent = await this.renditionsApi.getRenditionContent(nodeId, renditionId);
            }
        }

        return renditionContent;
    }

    async waitRendition(nodeId: string, renditionId: string): Promise<any> {
        let currentRetry = 0;
        return new Promise<any>((resolve, reject) => {
            const intervalId = setInterval(() => {
                currentRetry++;
                if (this.maxRetries >= currentRetry) {
                    this.renditionsApi.getRendition(nodeId, renditionId).then(
                        async (rendition: RenditionEntry) => {
                            const status: string = rendition.entry.status.toString();
                            if (status === 'CREATED') {
                                const renditionContent = await this.renditionsApi.getRenditionContent(nodeId, renditionId);

                                clearInterval(intervalId);
                                return resolve(renditionContent);
                            }
                        },
                        () => {
                            this.statusRendition = 'error_in_creation';
                            return reject();
                        }
                    );
                }
            }, 1000);
        });
    }
}
