import {
  Obj
} from './types';


class ValidatorExtender {

  private _validator;

  constructor(validator) {
    this._validator = validator;
  }

  public extend(extension: Obj<Function>): Obj<Function> {
    Object.keys(extension).forEach((methodName: string) => {
      this._validator[methodName] = extension[methodName];
    });

    return this._validator;
  }
}


export default ValidatorExtender;
