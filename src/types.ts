type Obj<T> = {
  [key: string]: T;
}

type Data = {
  method: string;
  values: Obj<any>;
}

type ValidatorExtension = {
  isEmpty(value: any): boolean;
  isString(value: any): boolean;
  inArray(array: any[], value: any): boolean;
};

type Schema = {
  [key: string]: {
    [key: string]: SchemaRules;
  };
}

type SchemaRules = {
  type: Function;
  required?: boolean;
  unique?: boolean;
  minlength?: number;
  maxlength?: number;
  default?: any;
};

interface SchemaValidatorInterface {
  validate(collectionName: string, data: Data): Error[];
}

export {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema,
  ValidatorExtension
};
