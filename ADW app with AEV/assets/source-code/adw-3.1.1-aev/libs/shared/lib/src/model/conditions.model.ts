/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum ConditionStatementType {
    Variable = 'VARIABLE',
    Expression = 'EXPRESSION',
    Value = 'VALUE'
}

export interface ConditionStatement {
    type: ConditionStatementType;
    value: any;
    display?: string;
}

export enum ConditionOperator {
    EQ = ' eq ',
    NE = ' ne ',
    GT = ' gt ',
    GE = ' ge ',
    LT = ' lt ',
    LE = ' le '
}

export const reservedWords = ['and', 'or', 'not', 'eq', 'ne', 'lt', 'gt', 'le', 'ge', 'true', 'false', 'null', 'instanceof', 'empty', 'div', 'mod'];
export interface Condition {
    left: ConditionStatement;
    operator: ConditionOperator;
    right: ConditionStatement;
    asHTML?: string;
}

export enum ExpressionParsedOperator {
    Every = ' && ',
    Some = ' || ',
    None = ' && !'
}

export enum PredicateOperator {
    Every = 'every',
    Some = 'some',
    None = 'none'
}

export interface Predicate {
    conditions: Condition[];
    operator: PredicateOperator | ExpressionParsedOperator;
}

export interface ExpressionParsed extends Predicate {
    variables: any[];
    operator: ExpressionParsedOperator;
}

export interface ParsingExpression {
    regexp: RegExp;
    operator: ConditionOperator;
    referenceGroups: {
        left: number;
        right: number;
    };
}
