import * as path from 'path';

import * as externalValidator from 'validator';
import * as _ from 'underscore';

import I18n from '@j.u.p.iter/i18n';
import errors from '@j.u.p.iter/errors';
import JSONParser from '@j.u.p.iter/json-parser';

import validatorExtension from './validatorExtension';
import * as translations from './translations';

import {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema,
  ValidatorExtension
} from './types';

const i18n = new I18n({
  content: translations
});

class SchemaValidator implements SchemaValidatorInterface {

  private _schema: Schema;

  private _getValidationError(localeKey: string) {
    return new Error(i18n.t(localeKey));
  }

  private _validate(methodName: string, value: any, options?: Obj<any>) {
    return externalValidator[methodName] ? externalValidator[methodName](value) :
      validatorExtension[methodName](value);
  }

  private _checkValidations(validations: Obj<any>, value: any): Error[] {
    return Object.keys(validations).reduce((errors, methodToValidate) => {
      if (this._validate(methodToValidate, value) === validations[methodToValidate]) { return errors; }

      return [...errors, this._getValidationError('validationError')];
    }, []);
  }

  private _getAttributeValidationErrors(value: any, method: string, rules: SchemaRules): Error[] {
    let errors: Error[] = [];

    if (method !== 'PUT' && rules.required && this._validate('isEmpty', value)) {
       errors.push(this._getValidationError('validationError'));
    }

    if (this._validate('isEmpty', value)) { return errors; }

    if (rules.type) {
      if (rules.type === Number && !this._validate('isNumeric', value)) {
        errors.push(this._getValidationError('validationError'));
      }

      if (rules.type === Boolean && !this._validate('isBoolean', value)) {
        errors.push(this._getValidationError('validationError'));
      }

      if (rules.type === Date && !this._validate('isDate', value)) {
        errors.push(this._getValidationError('validationError'));
      }
    }

    if (rules.minlength && this._validate('isLength', value, {min: 0, max: rules.minlength - 1})) {
      errors.push(this._getValidationError('validationError'));
    }

    if (rules.maxlength && !this._validate('isLength', value, {min: 0, max: rules.maxlength})) {
      errors.push(this._getValidationError('validationError'));
    }

    if (rules.validations) {
      errors = [...errors, ...this._checkValidations(rules.validations, value)];
    }

    return errors;
  }

  private _getValidationErrors(collectionName: string, values: Obj<any>, method: string): Error[] {
    const errors = Object.keys(this._schema[collectionName]).reduce((accumulatedErrors, currentAttribute) => {
      const validationErrors = this._getAttributeValidationErrors(
        values[currentAttribute],
        method,
        this._schema[collectionName][currentAttribute]
      );

      return [...accumulatedErrors, ...validationErrors];
    }, []);

    return errors.length ? errors : null;
  }

  constructor(schema: Schema) {
    this._schema = schema;
  }

  public validate(collectionName: string, data: Data): Error[] {
    var { method, values } = data;

    return this._getValidationErrors(collectionName, values, method);
  }
}


export default SchemaValidator;
