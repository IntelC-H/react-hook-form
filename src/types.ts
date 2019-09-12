import * as React from 'react';

export type DefaultFieldValues = Record<string, unknown>;

export type FieldValue = any;

export type FieldValues = Record<string, FieldValue>;

export type Ref = any;

type Mode = keyof ValidationMode;

export type OnSubmit<Data extends FieldValues> = (
  data: Data,
  e: React.SyntheticEvent,
) => void | Promise<void>;

export interface ValidationMode {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
}

export type SchemaValidateOptions = Partial<{
  strict: boolean;
  abortEarly: boolean;
  stripUnknown: boolean;
  recursive: boolean;
  context: object;
}>;

export interface Schema<Data> {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<Data>;
}

export type Options<
  FormValues extends FieldValues = DefaultFieldValues,
  FieldName extends keyof FormValues = keyof FormValues
> = Partial<{
  mode: Mode;
  defaultValues: Partial<FormValues>;
  validationSchemaOption: SchemaValidateOptions;
  validationFields: FieldName[];
  validationSchema: any;
  nativeValidation: boolean;
  submitFocusError: boolean;
}>;

export interface MutationWatcher {
  disconnect: VoidFunction;
  observe?: any;
}

type ValidationOptionObject<Value> = Value | { value: Value; message: string };

export type ValidationTypes = number | string | RegExp;

export type Validate = (data: FieldValue) => string | boolean | void;

export type ValidationOptions = Partial<{
  required: boolean | string;
  min: ValidationOptionObject<number | string>;
  max: ValidationOptionObject<number | string>;
  maxLength: ValidationOptionObject<number | string>;
  minLength: ValidationOptionObject<number | string>;
  pattern: ValidationOptionObject<RegExp>;
  validate:
    | Validate
    | Record<string, Validate>
    | { value: Validate | Record<string, Validate>; message: string };
}>;

export type ValidatePromiseResult =
  | {}
  | void
  | {
      type: string;
      message: string | number | boolean | Date;
    };

export interface Field extends ValidationOptions {
  ref: Ref;
  watch?: boolean;
  mutationWatcher?: MutationWatcher;
  options?: {
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }[];
}

export type FieldsRefs<Data extends FieldValues> = Partial<
  Record<keyof Data, Field>
>;

export interface FieldError {
  ref: Ref;
  type: string;
  message?: string;
  isManual?: boolean;
}

export type FieldErrors<Data extends FieldValues> = Partial<
  Record<keyof Data, FieldError>
>;

export interface SubmitPromiseResult<Data extends FieldValues> {
  errors: FieldErrors<Data>;
  values: Data;
}

export interface SchemaValidationResult<FormValues> {
  fieldErrors: FieldErrors<FormValues>;
  result: FieldValues;
}

export interface ValidationPayload<Name, Value> {
  name: Name;
  value?: Value;
}

export interface FormState<
  Data extends FieldValues = FieldValues,
  Name extends keyof Data = keyof Data
> {
  dirty: boolean;
  isSubmitted: boolean;
  submitCount: number;
  touched: Name[];
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ElementLike {
  name: string;
  type?: string;
  value?: string;
  checked?: boolean;
  options?: any;
}
