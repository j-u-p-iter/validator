import * as _ from 'underscore';

import {
  ValidatorExtension
} from './types';


const validatorExtension: ValidatorExtension = {
  isString(value: any): boolean { return _.isString(value); },
  inArray(array: any[], value: any): boolean { return !!~array.indexOf(value); }
};


export default validatorExtension;
