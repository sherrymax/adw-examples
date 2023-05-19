/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CoreModule, FormEvent, FormFieldEvent, FormModel, FormRulesEvent, FormService, TranslationMock, TranslationService } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { formDefinitionMock, formRepresentationConditionLeftOnly } from '../mocks/form-rules.mock';
import { FormRulesImplementationService } from './form-rules-implementation.service';
import { getTestScheduler } from 'jasmine-marbles';

describe('FormRulesService', () => {
    let service: FormRulesImplementationService;
    let formService: FormService;
    let formModel: FormModel;
    let event: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CoreModule],
            providers: [{ provide: TranslationService, useClass: TranslationMock }]
        });
        service = TestBed.inject(FormRulesImplementationService);
        formService = TestBed.inject(FormService);
        formModel = new FormModel(formDefinitionMock);
        service.initialize(formModel);
    });

    it('should handle formLoaded event when it has no filter', () => {
        event = 'formLoaded';

        formService.formLoaded.next(new FormEvent(formModel));
        getTestScheduler().flush();

        expect(formModel.getFieldById('text').value).toEqual(event);
    });

    it('should handle click event when filter based on every operator over field and variables equal to values is met', () => {
        event = 'click';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));
        getTestScheduler().flush();

        expect(formModel.getFieldById('text').value).toEqual(event);
    });

    it('should handle select event when filter based on none operator and none condition is met', () => {
        event = 'select';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        expect(formModel.getFieldById('text').value).toEqual(event);
    });

    it('should handle change event when no filter and apply disabled and required', () => {
        event = 'change';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        expect(formModel.getFieldById('text').readOnly).toBeTruthy();
        expect(formModel.getFieldById('text').required).toBeTruthy();
    });

    it('should handle focusout event when no filter and apply display', () => {
        event = 'focusin';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        expect(formModel.getFieldById('text').isVisible).toBeFalsy();
    });

    it('should handle focusout event when no filter and update variable value with field value', () => {
        event = 'focusout';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        const fieldValue = formModel.getFieldById('text').value;
        expect(formModel.getFormVariableValue('be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b')).toEqual(fieldValue);
    });

    it('should handle input event when no filter and update field value with variable value', () => {
        event = 'input';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        const varValue = formModel.getFormVariableValue('be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b');
        expect(formModel.getFieldById('text').value).toEqual(varValue);
    });

    it('should handle input event when no filter and update variable value with static value', () => {
        event = 'invalid';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        expect(formModel.getFormVariableValue('be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b')).toEqual('updatedValue');
    });

    it('should handle focus event when no filter is met but it has boolean field actions', () => {
        event = 'focus';

        formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));

        getTestScheduler().flush();
        expect(formModel.getFieldById('text').value).toEqual('formLoaded');
        expect(formModel.getFieldById('text').isVisible).toBeFalsy();
        expect(formModel.getFieldById('text').required).toBeTruthy();
    });

    describe('formRepresentationConditionLeftOnly', () => {

        beforeEach(() => {
            formModel = new FormModel(formRepresentationConditionLeftOnly);
            service.initialize(formModel);
        });

        it('should set the value of the variable when text field is clicked', () => {
            event = 'click';

            formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));
            getTestScheduler().flush();

            expect(formModel.getFieldById('multiline').value).toEqual('initialValue');
        });

        it('should set the value of the multiline field when text field input has value', () => {
            event = 'input';
            formModel.getFieldById('multiline').value = 'someValue';
            formModel.getFieldById('text').value = 'mock';

            formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));
            getTestScheduler().flush();

            expect(formModel.getFieldById('multiline').value).toEqual('mock');
        });

        it('should not set the value of the multiline field when text field input has no value', () => {
            event = 'input';
            formModel.getFieldById('multiline').value = 'someValue';
            formModel.getFieldById('text').value = null;

            formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));
            getTestScheduler().flush();

            expect(formModel.getFieldById('multiline').value).toEqual('someValue');
        });

    });

    describe('process variables', () => {
        beforeEach(() => {
            formModel = new FormModel(formRepresentationConditionLeftOnly);
            formModel.processVariables = [{
                id: 'variables.strVar' as unknown as number,
                name: 'variables.strVar',
                value: 'processVariableValue'
            }];
            service.initialize(formModel);
        });

        it('should set the value of the variable when text field is clicked', () => {
            event = 'click';

            formService.formRulesEvent.next(new FormRulesEvent(event, new FormFieldEvent(formModel, formModel.getFieldById('text'))));
            getTestScheduler().flush();

            expect(formModel.getFieldById('multiline').value).toEqual('processVariableValue');
        });
    });
});
