import * as _ from 'underscore';


const validatorExtension = {
  isEmpty(value): boolean { return _.isEmpty(value); },

  isString(value): boolean { return _.isString(value); },

  inArray(array: any[], value): boolean { return !!~array.indexOf(value); }
};


export default validatorExtension;
