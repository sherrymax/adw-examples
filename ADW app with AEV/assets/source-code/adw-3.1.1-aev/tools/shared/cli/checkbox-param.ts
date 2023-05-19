/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ParamType } from './params';
import { ParamOptions, CommanderOptionParams, Param } from './param';

export interface ComplexCheckboxChoice {
    name: string;
    value?: any;
    checked?: boolean;
    disabled?: boolean;
    short?: string;
}

export type CheckboxChoices = string[] | number[] | ComplexCheckboxChoice[];
export type CheckboxChoicesCallback = () => CheckboxChoices;

export interface CheckboxParamOptions extends ParamOptions {
    choices: CheckboxChoices | CheckboxChoicesCallback;
    value?: any[];
}

export class CheckboxParam extends Param {
    protected type = ParamType.checkbox;

    constructor(protected options: CheckboxParamOptions) {
        super(options);
    }

    get commanderOption(): CommanderOptionParams {
        const optionParams: CommanderOptionParams = [`-${this.options.alias}, --${this.options.name} <${this.options.name}>`, this.formattedTitle];

        optionParams.push((value, previousValue) => value !== undefined ? value.split(',') : previousValue);

        this.addDefaultParamIfNeeded(optionParams);
        return optionParams;
    }

    get inquirerOption() {
        return {
            type: this.type,
            name: this.options.name,
            message: this.options.title,
            choices: this.options.choices,
            ...(this.options.value !== undefined ? { default: this.options.value } : {})
        };
    }
}
