import * as path from 'path';

import * as externalValidator from 'validator';
import * as _ from 'underscore';
import { mergeDeepRight } from 'ramda';

import I18n from '@j.u.p.iter/i18n';
import { ValidationError } from '@j.u.p.iter/errors';
import JSONParser from '@j.u.p.iter/json-parser';

import validatorExtension from './validatorExtension';
import * as defaultLocales from './locales';

import {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema,
  ValidatorExtension
} from './types';


class SchemaValidator implements SchemaValidatorInterface {

  private _schema: Schema;
  private _i18n: I18n;

  private _getValidationError(localeKey: string, data?: Obj<any>) {
    return new ValidationError({
      message: this._i18n.t(localeKey, data),
      errorAttribute: data.field
    });
  }

  private _validate(methodName: string, value: any, options?: Obj<any>) {
    return externalValidator[methodName] ? externalValidator[methodName](value, options) :
      validatorExtension[methodName](value, options);
  }

  private _checkValidations(validations: Obj<any>, value: any, currentAttribute: string): Error[] {
    return Object.keys(validations).reduce((errors, methodToValidate) => {
      if (this._validate(methodToValidate, value) === validations[methodToValidate]) { return errors; }

      return [...errors, this._getValidationError(`validator.errors.${methodToValidate}`, {
        field: currentAttribute
      })];
    }, []);
  }

  private _getAttributeValidationErrors(value: any, rules: SchemaRules, currentAttribute: string): Error[] {
    let errors: Error[] = [];

    if (rules.required && !value) {
       errors.push(this._getValidationError('validator.errors.emptyValueError', {field: currentAttribute}));
    }

    if (!value) { return errors; }

    if (rules.type) {
      if (rules.type === Number && !this._validate('isNumeric', value)) {
        errors.push(this._getValidationError('validator.errors.numericValueError', {field: currentAttribute}));
      }

      if (rules.type === Boolean && !this._validate('isBoolean', value)) {
        errors.push(this._getValidationError('validator.errors.booleanValueError', {field: currentAttribute}));
      }

      if (rules.type === Date && !this._validate('toDate', value)) {
        errors.push(this._getValidationError('validator.errors.dateValueError', {field: currentAttribute}));
      }
    }

    if (rules.minlength && this._validate('isLength', value, { min: 0, max: rules.minlength - 1 })) {
      errors.push(this._getValidationError('validator.errors.minLengthValueError', {
        field: currentAttribute,
        length: rules.minlength
      }));
    }

    if (rules.maxlength && !this._validate('isLength', value, {min: 0, max: rules.maxlength})) {
      errors.push(this._getValidationError('validator.errors.maxLengthValueError', {
        field: currentAttribute,
        length: rules.maxlength
      }));
    }

    if (rules.validations) {
      errors = [...errors, ...this._checkValidations(rules.validations, value, currentAttribute)];
    }

    return errors;
  }

  private _filterFields(values: Obj<any>, fieldsToExclude: string[]): Obj<any> {
    return Object.keys(values).reduce((result, currentFieldName) => {
      !~fieldsToExclude.indexOf(currentFieldName) &&
        (result[currentFieldName] = values[currentFieldName]);

      return result;
    }, {});
  }

  constructor(schema: Schema, locales: Obj<any> = {}, locale: string = 'ru') {
    this._schema = schema;

    this._i18n = new I18n({ content: mergeDeepRight(defaultLocales, locales), locale });
  }

  public validate(collectionName: string, data: Data): Error[] {
    const { values, fieldsToExclude } = data,
          currentSchema = this._schema[collectionName],
          schemaToValidate = fieldsToExclude ? this._filterFields(currentSchema, fieldsToExclude) : currentSchema;

    const errors = Object.keys(schemaToValidate).reduce((accumulatedErrors, currentAttribute) => {
      const validationErrors = this._getAttributeValidationErrors(
        values[currentAttribute],
        this._schema[collectionName][currentAttribute],
        currentAttribute
      );

      return [...accumulatedErrors, ...validationErrors];
    }, []);

    return errors.length ? errors : null;
  }
}


export default SchemaValidator;
