import * as React from 'react';
import {
  FieldValues,
  Control,
  FieldPath,
  FieldError,
  UseFormStateReturn,
} from './';
import { RegisterOptions } from './validator';

export type ControllerFieldState = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: any;
  name: FieldPath<TFieldValues>;
  ref: React.Ref<any>;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues
> = {
  name: FieldPath<TFieldValues>;
  rules?: Exclude<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >;
  defaultValue?: unknown;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues
> = {
  field: ControllerRenderProps<TFieldValues>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

export type ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues>;
