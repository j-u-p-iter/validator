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

  constructor(schema: Schema) {
    this._extendExternalValidator();

    this._schema = schema;
  }

  public validate(collectionName: string, data: Data): Error[] {
    var { method, values } = data;

    _.each(this._schema[collectionName], (rules: SchemaRules, attributeName: string) => {
      const currentValue = values[attributeName],
            { required } = rules;

      if (method !== 'PUT' && required && this._controller.isEmpty(currentValue)) {
        this._errors.push(new Error(i18n.t('validationError')));
      }
    });

    return this._errors;
  }
}


export default SchemaValidator;
