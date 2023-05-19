/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { BREAKPOINT, ShowHideDirective, ShowHideStyleBuilder, StyleUtils, MediaMarshaller, LayoutConfigOptions, LAYOUT_CONFIG, SERVER_TOKEN } from '@angular/flex-layout';

const CUSTOM_BREAKPOINT = {
    alias: 'gt-lg',
    suffix: 'gt-lg',
    mediaQuery: 'screen and (min-width: 960px) and (max-width: 1500px)',
    overlapping: false,
};

export const CUSTOM_BREAKPOINT_PROVIDER = {
    provide: BREAKPOINT,
    useValue: [CUSTOM_BREAKPOINT],
    multi: true,
};

const inputs = ['fxHide', 'fxHide.gt-lg', 'fxShow', 'fxShow.gt-lg'];
const selector = `[fxHide], [fxHide.gt-lg], [fxShow], [fxShow.gt-lg]`;

// TODO: review and remove this directive as it heavily relies on flex-layout internals
// eslint-disable-next-line
@Directive({ selector, inputs })
export class CustomShowHideDirective extends ShowHideDirective {
    protected inputs = inputs;

    constructor(
        elementRef: ElementRef,
        styleBuilder: ShowHideStyleBuilder,
        styler: StyleUtils,
        marshal: MediaMarshaller,
        @Inject(LAYOUT_CONFIG) protected layoutConfig: LayoutConfigOptions,
        @Inject(PLATFORM_ID) protected platformId: any,
        @Inject(SERVER_TOKEN) protected serverModuleLoaded: boolean
    ) {
        super(elementRef, styleBuilder, styler, marshal, layoutConfig, platformId, serverModuleLoaded);
    }
}
