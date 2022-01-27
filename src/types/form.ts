import React from 'react';

import { Subject, Subscription } from '../utils/createSubject';

import { ErrorOption, FieldError, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArray } from './fieldArray';
import {
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import {
  Auto,
  Branded,
  FieldPathSetValue,
  FieldPathValue,
  FieldPathValues,
  PathString,
} from './path';
import { Resolver } from './resolvers';
import { DeepMap, DeepPartial, Noop } from './utils';
import { RegisterOptions } from './validator';

declare const $NestedValue: unique symbol;

export type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never;
} & TValue;

export type UnpackNestedValue<T> = T extends NestedValue<infer U>
  ? U
  : T extends Date | FileList | File
  ? T
  : T extends object
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type DefaultValues<TFieldValues> = UnpackNestedValue<
  DeepPartial<TFieldValues>
>;

export type InternalNameSet = Set<InternalFieldName>;

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  onTouched: 'onTouched';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type CriteriaMode = 'firstError' | 'all';

export type SubmitHandler<TFieldValues extends FieldValues> = (
  data: UnpackNestedValue<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
  errors: FieldErrors<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SetValueConfig = Partial<{
  shouldValidate: boolean;
  shouldDirty: boolean;
  shouldTouch: boolean;
}>;

export type TriggerConfig = Partial<{
  shouldFocus: boolean;
}>;

export type ChangeHandler = (event: {
  target: any;
  type?: any;
}) => Promise<void | boolean>;

export type DelayCallback = (
  name: InternalFieldName,
  error: FieldError,
) => void;

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = Partial<{
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
  defaultValues: DefaultValues<TFieldValues>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  shouldUnregister: boolean;
  shouldUseNativeValidation: boolean;
  criteriaMode: CriteriaMode;
  delayError: number;
}>;

export type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  DeepPartial<TFieldValues>,
  boolean
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  isValidating: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  errors: boolean;
  isValid: boolean;
};

export type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' };

export type FormState<TFieldValues> = {
  isDirty: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  errors: FieldErrors<TFieldValues>;
};

export type KeepStateOptions = Partial<{
  keepErrors: boolean;
  keepDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepTouched: boolean;
  keepSubmitCount: boolean;
}>;

export type SetFieldValue<TFieldValues> = FieldValue<TFieldValues>;

export type RefCallBack = (instance: any) => void;

export type UseFormRegisterReturn = {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  ref: RefCallBack;
  name: InternalFieldName;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
};

export type UseFormRegister<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFormRegisterReturn;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TFieldName extends PathString>(
    name: Auto.FieldPath<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <TFieldNames extends PathString[]>(
    names: readonly [...Auto.FieldPaths<TFieldValues, TFieldNames>],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
};

export type UseFormGetFieldState<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  formState?: FormState<TFieldValues>,
) => {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error: FieldError;
};

export type UseFormWatch<TFieldValues extends FieldValues> = {
  (): UnpackNestedValue<TFieldValues>;
  <TFieldNames extends PathString[]>(
    names: readonly [...Auto.FieldPaths<TFieldValues, TFieldNames>],
    defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): FieldPathValues<TFieldValues, TFieldNames>;
  <TFieldName extends PathString>(
    name: Auto.FieldPath<TFieldValues, TFieldName>,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  (
    callback: WatchObserver<TFieldValues>,
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): Subscription;
};

export type UseFormTrigger<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
  options?: TriggerConfig,
) => Promise<boolean>;

export type UseFormClearErrors<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
) => void;

export type UseFormSetValue<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  value: UnpackNestedValue<FieldPathSetValue<TFieldValues, TFieldName>>,
  options?: SetValueConfig,
) => void;

export type UseFormSetError<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  error: ErrorOption,
  options?: {
    shouldFocus: boolean;
  },
) => void;

export type UseFormUnregister<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
  options?: Omit<
    KeepStateOptions,
    | 'keepIsSubmitted'
    | 'keepSubmitCount'
    | 'keepValues'
    | 'keepDefaultValues'
    | 'keepErrors'
  > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
) => void;

export type UseFormHandleSubmit<TFieldValues extends FieldValues> = (
  onValid: SubmitHandler<TFieldValues>,
  onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;

export type UseFormResetField<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  options?: Partial<{
    keepDirty: boolean;
    keepTouched: boolean;
    keepError: boolean;
    defaultValue: any;
  }>,
) => void;

export type UseFormReset<TFieldValues extends FieldValues> = (
  values?: DefaultValues<TFieldValues> | UnpackNestedValue<TFieldValues>,
  keepStateOptions?: KeepStateOptions,
) => void;

export type WatchInternal<TFieldValues> = (
  fieldNames?: InternalFieldName | InternalFieldName[],
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  isMounted?: boolean,
  isGlobal?: boolean,
) =>
  | FieldPathValue<FieldValues, InternalFieldName>
  | FieldPathValues<FieldValues, InternalFieldName[]>;

export type GetIsDirty = <TName extends InternalFieldName, TData>(
  name?: TName,
  data?: TData,
) => boolean;

export type FormStateSubjectRef<TFieldValues> = Subject<
  Partial<FormState<TFieldValues>> & { name?: InternalFieldName }
>;

export type Subjects<TFieldValues extends FieldValues = FieldValues> = {
  watch: Subject<{
    name?: InternalFieldName;
    type?: EventType;
    values?: FieldValues;
  }>;
  array: Subject<{
    name?: InternalFieldName;
    values?: FieldValues;
  }>;
  state: FormStateSubjectRef<TFieldValues>;
};

export type Names = {
  mount: InternalNameSet;
  unMount: InternalNameSet;
  array: InternalNameSet;
  watch: InternalNameSet;
  focus: InternalFieldName;
  watchAll: boolean;
};

export type BatchFieldArrayUpdate = <
  T extends Function,
  TFieldValues,
  TFieldArrayName extends PathString,
>(
  name: Auto.FieldArrayPath<TFieldValues, TFieldArrayName>,
  updatedFieldArrayValues?: Partial<
    FieldArray<TFieldValues, TFieldArrayName>
  >[],
  method?: T,
  args?: Partial<{
    argA: unknown;
    argB: unknown;
  }>,
  shouldSetValue?: boolean,
  shouldUpdateFieldsAndErrors?: boolean,
) => void;

export type Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  _subjects: Subjects<TFieldValues>;
  _removeUnmounted: Noop;
  _names: Names;
  _stateFlags: {
    mount: boolean;
    action: boolean;
    watch: boolean;
  };
  _options: UseFormProps<TFieldValues, TContext>;
  _getDirty: GetIsDirty;
  _formState: FormState<TFieldValues>;
  _updateValid: Noop;
  _fields: FieldRefs;
  _formValues: FieldValues;
  _proxyFormState: ReadFormState;
  _defaultValues: Partial<DefaultValues<TFieldValues>>;
  _getWatch: WatchInternal<TFieldValues>;
  _updateFieldArray: BatchFieldArrayUpdate;
  _getFieldArray: <TFieldArrayValues>(
    name: InternalFieldName,
  ) => Partial<TFieldArrayValues>[];
  _executeSchema: (
    names: InternalFieldName[],
  ) => Promise<{ errors: FieldErrors }>;
  register: UseFormRegister<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
};

export type WatchObserver<TFieldValues> = (
  value: UnpackNestedValue<DeepPartial<TFieldValues>>,
  info: {
    name?: Branded.FieldPath<TFieldValues>;
    type?: EventType;
    value?: unknown;
  },
) => void;

export type UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  watch: UseFormWatch<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  formState: FormState<TFieldValues>;
  resetField: UseFormResetField<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  control: Control<TFieldValues, TContext>;
  register: UseFormRegister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
};

export type UseFormStateProps<TFieldValues, TFieldName extends PathString> = {
  control?: Control<TFieldValues>;
  disabled?: boolean;
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[];
  exact?: boolean;
};

export type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<
  TFieldValues extends FieldValues,
  TFieldName extends PathString,
> = {
  defaultValue?: unknown;
  disabled?: boolean;
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[];
  control?: Control<TFieldValues>;
  exact?: boolean;
};

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues, TContext>;
