import { FieldValues, InternalFieldName, Ref } from './fields';
import { DeepMap, DeepPartial, LiteralUnion } from './utils';
import { RegisterOptions, ValidateResult } from './validator';

export type Message = string;

export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult;
} & {
  [key: string]: ValidateResult;
};

export type FieldError = {
  type: LiteralUnion<keyof RegisterOptions, string>;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption = {
  message?: Message;
  type?: LiteralUnion<keyof RegisterOptions, string>;
  types?: MultipleFieldErrors;
};

export type FieldErrors<TFieldValues extends FieldValues = FieldValues> =
  DeepMap<DeepPartial<TFieldValues>, FieldError>;

export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
