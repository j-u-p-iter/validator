type Obj<T> = {
  [key: string]: T;
}

type Data = {
  action: string;
  values: Obj<any>;
}

type ValidatorExtension = {
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
  validations?: Obj<any>;
  default?: any;
};

interface SchemaValidatorInterface {
  validate(collectionName: string, data: Data, fieldsToExclude?: string[]): Error[];
}

export {
  Obj,
  Data,
  SchemaValidatorInterface,
  SchemaRules,
  Schema,
  ValidatorExtension
};
