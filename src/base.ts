import * as path from 'path';

import * as externalValidator from 'validator';
import * as _ from 'underscore';

import I18n from '@j.u.p.iter/i18n';
import errors from '@j.u.p.iter/errors';
import JSONParser from '@j.u.p.iter/json-parser';

import validatorExtension from './validatorExtension';

import {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema,
  ValidatorExtension
} from './types';

const i18n = new I18n({
  directoryPath: path.join(__dirname, 'translations'),
  currentLocale: 'en',
  jsonParser: new JSONParser()
});

class SchemaValidator implements SchemaValidatorInterface {

  private _errors: Error[] = [];
  private _schema: Schema;

  private _getValidationError(localeKey: string) {
    return new Error(i18n.t(localeKey));
  }

  private _validate(methodName: string, value: any) {
    return externalValidator[methodName] ? externalValidator[methodName](value) :
      validatorExtension[methodName](value);
  }

  private _getAttributeValidationErrors(value: any, method: string, rules: SchemaRules): Error[] {
    const errors: Error[] = [];

    if (method !== 'PUT' && rules.required && this._validate('isEmpty', value)) {
       errors.push(this._getValidationError('validationError'));
    }

    if (this._validate('isEmpty', value)) { return errors; }

    if (rules.type) {
      if (rules.type === String && !this._validate('isString', value)) {
         errors.push(this._getValidationError('validationError'));
      }

      if (rules.type === Number && !this._validate('isNumber', value)) {
        errors.push(this._getValidationError('validationError'));
      }
    }

    return errors;
  }

  private _getValidationErrors(collectionName: string, values: Obj<any>, method: string): Error[] {
    Object.keys(this._schema[collectionName]).reduce((accumulatedErrors, currentAttribute) => {
      const validationErrors = this._getAttributeValidationErrors(
        values[currentAttribute],
        method,
        this._schema[collectionName][currentAttribute]
      );

      return [...accumulatedErrors, ...validationErrors];
    }, this._errors);

    return this._errors.length ? this._errors : null;
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
