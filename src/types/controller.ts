import * as React from 'react';

import { RegisterOptions } from './validator';
import {
  Control,
  FieldError,
  FieldPathValue,
  FieldPathWithValue,
  FieldValues,
  IsAny,
  Noop,
  RefCallBack,
  UnpackNestedValue,
  UseFormStateReturn,
} from './';

export type ControllerFieldState = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: IsAny<TResult> extends true
    ? UnpackNestedValue<FieldPathValue<TFieldValues, TName>>
    : UnpackNestedValue<TResult>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: IsAny<TResult> extends true
    ? UnpackNestedValue<FieldPathValue<TFieldValues, TName>>
    : UnpackNestedValue<TResult>;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  field: ControllerRenderProps<TFieldValues, TResult, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TResult, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TResult, TName>;
