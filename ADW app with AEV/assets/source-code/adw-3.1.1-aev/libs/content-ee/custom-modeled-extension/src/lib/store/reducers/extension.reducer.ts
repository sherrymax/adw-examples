/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialiseExtension } from '../actions/extension.actions';
import { initialCustomModeledExtensionExtensionState } from '../states/extension.state';

export const customModeledExtensionExtensionReducer = createReducer(
    initialCustomModeledExtensionExtensionState,
    on(initialiseExtension, (state, { health, application }) => ({
        ...state,
        health,
        application,
    }))
);
