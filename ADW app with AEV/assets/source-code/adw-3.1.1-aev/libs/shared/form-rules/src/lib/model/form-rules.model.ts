/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Predicate } from '@alfresco-dbp/shared-lib';

export const FORM_PREFIX = 'form.';
export const FIELD_PREFIX = 'field.';
export const VARIABLE_PREFIX = 'variable.';
export const VARIABLES_PREFIX = 'variables.';

export interface FormRuleEventPayload {
    filter?: string | Predicate;
    actions: {
        target: string;
        payload: PayloadBody;
    }[];
}

export interface PayloadBody {
    [key: string]: any;
}

export interface FormRules {
    form?: {
        [event: string]: FormRuleEventPayload[];
    };
    fields?: {
        [fieldId: string]: {
            [event: string]: FormRuleEventPayload[];
        };
    };
}

export interface FormRulesContext {
    field?: PayloadBody;
    variable?: PayloadBody;
}

export enum FormActions {
    VALIDATE = 'validate'
}

export enum VariablesInputs {
    VALUE = 'value'
}

export enum FieldInputs {
    DISPLAY = 'display',
    DISABLED = 'disabled',
    REQUIRED = 'required',
    VALUE = 'value'
}

export class FormActionsUtils {
    static getType(action: string, defaultType = 'string'): string {
        switch (action) {
        case FieldInputs.VALUE:
        case VariablesInputs.VALUE:
            return defaultType;
        default:
            return 'boolean';
        }
    }

    static getFieldInputsValues(): string[] {
        return Object.values(FieldInputs);
    }

    static getVariableInputsValues(): string[] {
        return Object.values(VariablesInputs);
    }

    static getFormActionInputs(action: string): string[] {
        switch (action) {
        case FormActions.VALIDATE:
        default:
            return [];
        }
    }
}
