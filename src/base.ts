import * as path from 'path';

import * as externalValidator from 'validator';
import * as _ from 'underscore';

import I18n from '@j.u.p.iter/i18n';
import errors from '@j.u.p.iter/errors';
import JSONParser from '@j.u.p.iter/json-parser';

import ValidatorExtender from './ValidatorExtender';
import validatorExtension from './validatorExtension';

import {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema
} from './types';

const i18n = new I18n({
  directoryPath: path.join(__dirname, 'translations'),
  currentLocale: 'en',
  jsonParser: new JSONParser()
});

class SchemaValidator implements SchemaValidatorInterface {

  private _errors: Error[] = [];
  private _schema: Schema;
  private _controller = externalValidator;

  private _extendExternalValidator(): void {
    const validatorExtender = new ValidatorExtender(this._controller);

    validatorExtender.extend(validatorExtension);
  }

  private _getValidationError(value: any, method: string, rules: SchemaRules): Error {
    if (method !== 'PUT' && rules.required && this._controller.isEmpty(value)) {
      return new Error(i18n.t('validationError'));
    }
  }

  private _getValidationErrors(collectionName: string, values: Obj<any>, method: string): Error[] {
    Object.keys(this._schema[collectionName]).reduce((accumulatedErrors, currentAttribute) => {
      const validationError = this._getValidationError(
        values[currentAttribute],
        method,
        this._schema[collectionName][currentAttribute]
      );

      validationError && accumulatedErrors.push(validationError);

      return accumulatedErrors;
    }, this._errors);

    return this._errors.length ? this._errors : null;
  }

  constructor(schema: Schema) {
    this._extendExternalValidator();

    this._schema = schema;
  }

  public validate(collectionName: string, data: Data): Error[] {
    var { method, values } = data;

    return this._getValidationErrors(collectionName, values, method);
  }
}


export default SchemaValidator;
