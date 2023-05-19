/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { switchMap, take } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { WINDOW } from '../providers/window-provider';
import * as CryptoJS from 'crypto-js';

/* eslint-disable prefer-const */
export interface PendoWindow extends Window {
    pendo: any;
}

const sanitizePaths = ['search'];

@Injectable({
    providedIn: 'root',
})
export class PendoService {
    constructor(
        private authenticationService: AuthenticationService,
        private appConfigService: AppConfigService,
        @Inject(WINDOW) private window: PendoWindow
    ) {
        this.appConfigService
            .select('analytics')
            .pipe(
                switchMap((pendoEnabled) => {
                    const isPendoEnabled = this.isPendoEnabled(pendoEnabled);
                    if (isPendoEnabled) {
                        this.injectPendoJS();
                    }
                    return forkJoin({
                        loginPipe: this.authenticationService.onLogin.pipe(
                            take(1)
                        ),
                        isPendoEnabled: of(isPendoEnabled),
                    });
                })
            )
            .subscribe((login) => {
                if (login.isPendoEnabled) {
                    const username =
                        authenticationService.getEcmUsername() ||
                        authenticationService.getBpmUsername();
                    const hiddenUserName = this.hideUserName(username);
                    const accountId = this.getAccountId();
                    const disableGuides = this.appConfigService.get<boolean>(
                        'analytics.pendo.disableGuides'
                    );
                    const excludeAllText = this.appConfigService.get<boolean>(
                        'analytics.pendo.excludeAllText'
                    );
                    this.window.pendo.initialize({
                        sanitizeUrl: (url) => this.sanitize(url, sanitizePaths),

                        visitor: {
                            id: hiddenUserName,
                        },
                        account: {
                            id: accountId,
                            host: this.window.location.hostname,
                        },
                        disableGuides: disableGuides,
                        excludeAllText: excludeAllText,
                    });
                }
            });
    }

    getAccountId() {
        const titleAppKebabCase = this.appConfigService
            .get<string>('application.name')
            ?.replace(/\s+/g, '-')
            .toLowerCase();

        const customerName = this.appConfigService.get<boolean>(
            'customer.name'
        );
        return customerName || titleAppKebabCase;
    }

    isPendoEnabled(pendoEnabled) {
        return pendoEnabled?.pendo?.enabled === 'true';
    }

    hideUserName(username) {
        return CryptoJS.MD5(username).toString();
    }

    sanitize(url: string, paths: string[]): string {
        let sanitizeUrl = url;
        const index = url.indexOf('?');
        if (index > -1) {
            sanitizeUrl = url.slice(0, index);
        }
        paths.forEach((searchKey) => {
            const searchIndex = url.indexOf(searchKey);
            if (searchIndex > -1) {
                sanitizeUrl = url.slice(0, searchIndex + searchKey.length);
            }
        });
        return sanitizeUrl;
    }

    injectPendoJS() {
        const analyticsKey = this.appConfigService.get<boolean>('analytics.pendo.key');
        (function (apiKey) {
            (function (p, e, n, d, o) {
                let v, w, x, y, z;
                o = p[d] = p[d] || {};
                o._q = o._q || [];
                v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
                for (w = 0, x = v.length; w < x; ++w) {
                    (function (m) {
                        o[m] = o[m] || function () {
                            // eslint-disable-next-line prefer-rest-params
                            o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0)));
                        };
                    })(v[w]);
                }
                y = e.createElement(n);
                y.async = !0;
                y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
                z = e.getElementsByTagName(n)[0];
                z.parentNode.insertBefore(y, z);
            })(this.window, document, 'script', 'pendo');
        }).bind(this)(analyticsKey);
    }
}
