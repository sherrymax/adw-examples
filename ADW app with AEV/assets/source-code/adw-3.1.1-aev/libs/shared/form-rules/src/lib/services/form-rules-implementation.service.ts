/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable max-lines */
import { Condition, ConditionOperator, ConditionStatement, ConditionStatementType, Predicate, PredicateOperator } from '@alfresco-dbp/shared-lib';
import { FormService, FormRulesEvent, FormRulesManager, FormModel, FormFieldTypes, FormVariableModel, ProcessVariableModel } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import {
    FieldInputs,
    FIELD_PREFIX,
    FormActions,
    FormActionsUtils,
    FormRuleEventPayload,
    FormRules,
    FormRulesContext,
    FORM_PREFIX,
    PayloadBody,
    VariablesInputs,
    VARIABLES_PREFIX,
    VARIABLE_PREFIX
} from '../model/form-rules.model';

@Injectable({
    providedIn: 'root'
})
export class FormRulesImplementationService extends FormRulesManager<FormRules> {

    private readonly EXPRESSION_REGEX = /\$\{(\s|\S)+?\}/m;
    private readonly GLOBAL_EXPRESSION_REGEX = /\$\{(\s|\S)+?\}/gm;
    private context: FormRulesContext | null = null;

    constructor(formService: FormService) {
        super(formService);
    }

    protected getRules(): FormRules {
        return this.formModel?.json?.rules;
    }

    protected handleRuleEvent(event: FormRulesEvent, rules: FormRules): void {
        this.context = null;
        const eventType = event.type;
        let payload: FormRuleEventPayload[];
        if (eventType) {
            if (event.field) {
                payload = rules?.fields?.[event.field?.id]?.[eventType] || [];
            } else {
                payload = rules?.form?.[eventType] || [];
            }
            payload.forEach(rule => {
                this.executeActions(event, rule.actions, this.eventMatchesRule(event, rule.filter));
            });
        }
    }

    private eventMatchesRule(event: FormRulesEvent, filter: string | Predicate | undefined) {
        if (filter) {
            if (typeof filter === 'string') {
                return this.testExpression(filter, event);
            } else if (filter.conditions && filter.conditions.length > 0) {
                switch (filter.operator) {
                case PredicateOperator.None:
                    return !filter.conditions.some(condition => this.testCondition(condition, event));
                case PredicateOperator.Some:
                    return filter.conditions.some(condition => this.testCondition(condition, event));
                case PredicateOperator.Every:
                default:
                    return filter.conditions.every(condition => this.testCondition(condition, event));
                }
            }
        }
        return true;
    }

    private testExpression(expression: string, event: FormRulesEvent): boolean {
        return !!this.resolveExpressionString(expression, event);
    }

    private resolveExpressionString(expression: string, event: FormRulesEvent): any {
        let result = expression || '';

        const matches = result.match(this.GLOBAL_EXPRESSION_REGEX);

        if (matches) {
            matches.forEach(match => {
                let expressionResult = this.resolveExpression(match, event);
                if (typeof expressionResult !== 'string') {
                    expressionResult = JSON.stringify(expressionResult);
                }
                result = result.replace(match, expressionResult);
            });
        }

        try {
            result = JSON.parse(result);
        } catch { }

        return result;
    }

    private buildContext(event: FormRulesEvent): FormRulesContext {
        const form = (<FormModel> event.form);
        const context: FormRulesContext = {
            field: {},
            variable: {}
        };
        form.getFormFields()?.forEach(field => {
            context.field = { ...context.field, [field.id]: field.value };
        });
        form.variables?.forEach(variable => {
            const value = this.getVariableValue(variable, form.processVariables);
            context.variable = { ...context.variable, [variable.id]: value, [variable.name]: value };
        });
        return context;
    }

    private getVariableValue(variable: FormVariableModel, processVariables: ProcessVariableModel[]): any {
        if (processVariables && processVariables.length > 0) {
            const processVar = processVariables.find(processVariable => processVariable.name === VARIABLES_PREFIX + variable.name);
            if (processVar) {
                return processVar.value;
            }
        }
        return variable.value;
    }

    private resolveExpression(match: string, event: FormRulesEvent, allowNull?: boolean): any {

        if (typeof match !== 'string') {
            return match;
        }

        if (!this.context) {
            this.context = this.buildContext(event);
        }

        let expression = match?.trim() || '';

        if (this.EXPRESSION_REGEX.test(expression)) {
            expression = expression.substring(2, match?.length - 1);
        }

        if (expression.startsWith(FIELD_PREFIX)) {

            const field = expression.substring(FIELD_PREFIX.length);
            return allowNull ? this.context?.field?.[field] : (this.context?.field?.[field] || match);

        } else if (expression.startsWith(VARIABLE_PREFIX)) {

            const variable = expression.substring(VARIABLE_PREFIX.length);
            return allowNull ? this.context?.variable?.[variable] : (this.context?.variable?.[variable] || match);

        } else {
            return match;
        }
    }

    private testCondition(condition: Condition, event: FormRulesEvent): boolean {
        let leftValue = this.getConditionStatementValue(condition?.left, event);

        if (event?.field?.type === FormFieldTypes.DROPDOWN && leftValue === 'empty') {
            leftValue = null;
        }

        const rightValue = this.getConditionStatementValue(condition?.right, event);

        switch (condition.operator) {
        case ConditionOperator.EQ:
            return leftValue === rightValue;
        case ConditionOperator.GE:
            return leftValue >= rightValue;
        case ConditionOperator.GT:
            return leftValue > rightValue;
        case ConditionOperator.LE:
            return leftValue <= rightValue;
        case ConditionOperator.LT:
            return leftValue < rightValue;
        case ConditionOperator.NE:
            return leftValue !== rightValue;
        default:
            return !!leftValue;
        }
    }

    private getConditionStatementValue(conditionStatement: ConditionStatement, event: FormRulesEvent): any {
        if (!conditionStatement) {
            return conditionStatement;
        }
        switch (conditionStatement.type) {
        case ConditionStatementType.Expression:
            return this.resolveExpressionString(conditionStatement.value, event);
        case ConditionStatementType.Variable:
            return this.resolveExpression(conditionStatement.value.id, event, true);
        case ConditionStatementType.Value:
        default:
            return conditionStatement.value;
        }
    }

    private executeActions(event: FormRulesEvent, actions: { target: string; payload: PayloadBody }[], filterMatched: boolean) {
        if (actions) {
            actions.forEach(action => {
                if (action.target.startsWith(FORM_PREFIX) && filterMatched) {
                    this.executeFormAction(action, event.form);
                } else if (action.target.startsWith(VARIABLE_PREFIX) && filterMatched) {
                    this.executeVariableAction(action, event);
                } else if (action.target.startsWith(FIELD_PREFIX)) {
                    this.executeFieldActions(action, event, filterMatched);
                }
            });
        }
    }

    private executeVariableAction(action: { target: string; payload: PayloadBody }, event: FormRulesEvent) {
        const variableId = action?.target?.substring(VARIABLE_PREFIX.length);
        if (!!variableId && !!action?.payload) {
            Object.keys(action.payload).forEach(variableAction => {
                switch (variableAction) {
                case VariablesInputs.VALUE: {
                    const resolvedValue = this.resolveExpression(action.payload[variableAction], event);

                    event.form.changeVariableValue(variableId, resolvedValue, event);

                    (<FormModel> event.form).getFormFields()
                        .filter(field => field.type === FormFieldTypes.DISPLAY_VALUE
                                && field.params?.responseVariable
                                && field.params?.field?.id === variableId)
                        .forEach(field => field.value = resolvedValue);
                    break;
                }
                default:
                    break;
                }
            });
        }
    }

    private executeFieldActions(action: { target: string; payload: PayloadBody }, event: FormRulesEvent, filterMatched: boolean) {
        const fieldId = action?.target?.substring(FIELD_PREFIX.length);
        if (!!fieldId && !!action?.payload) {
            Object.keys(action.payload).forEach(fieldAction => {
                const isBooleanActionType = FormActionsUtils.getType(fieldAction) === 'boolean';
                const value = isBooleanActionType && !filterMatched ? !action.payload[fieldAction] : action.payload[fieldAction];
                switch (fieldAction) {
                case FieldInputs.DISABLED:
                    event.form.changeFieldDisabled(fieldId, value);
                    break;
                case FieldInputs.DISPLAY:
                    event.form.changeFieldVisibility(fieldId, value);
                    break;
                case FieldInputs.REQUIRED:
                    event.form.changeFieldRequired(fieldId, value);
                    break;
                case FieldInputs.VALUE:
                    if (filterMatched) {
                        event.form.changeFieldValue(fieldId, this.resolveExpression(value, event));
                    }
                    break;
                default:
                    break;
                }
            });
        }
    }

    private executeFormAction(action: { target: string; payload: PayloadBody }, form: FormModel) {
        const actionType = action.target.substring(FORM_PREFIX.length);

        switch (actionType) {
        case FormActions.VALIDATE:
            form.validateForm();
            break;

        default:
            break;
        }
    }
}
