import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import transformToNestObject from './logic/transformToNestObject';
import focusOnErrorField from './logic/focusOnErrorField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldRenderBasedOnError from './logic/shouldRenderBasedOnError';
import validateField from './logic/validateField';
import assignWatchFields from './logic/assignWatchFields';
import skipValidation from './logic/skipValidation';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
import deepEqual from './utils/deepEqual';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isSelectInput from './utils/isSelectInput';
import isFileInput from './utils/isFileInput';
import onDomRemove from './utils/onDomRemove';
import isObject from './utils/isObject';
import { getPath } from './utils/getPath';
import isPrimitive from './utils/isPrimitive';
import isFunction from './utils/isFunction';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import set from './utils/set';
import unset from './utils/unset';
import isKey from './utils/isKey';
import modeChecker from './utils/validationModeChecker';
import isMultipleSelect from './utils/isMultipleSelect';
import filterOutFalsy from './utils/filterOutFalsy';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isHTMLElement from './utils/isHTMLElement';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import {
  UseFormMethods,
  FieldValues,
  UnpackNestedValue,
  FieldName,
  InternalFieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationRules,
  SubmitHandler,
  FieldElement,
  FormStateProxy,
  ReadFormState,
  Ref,
  HandleChange,
  RadioOrCheckboxOption,
  OmitResetState,
  NestedValue,
  SetValueConfig,
  ErrorOption,
  FormState,
  SubmitErrorHandler,
  FieldNamesMarkedBoolean,
  LiteralToPrimitive,
  DeepPartial,
  InternalNameSet,
  DefaultValues,
  FieldError,
} from './types';

const isWindowUndefined = typeof window === UNDEFINED;
const isWeb =
  typeof document !== UNDEFINED &&
  !isWindowUndefined &&
  !isUndefined(window.HTMLElement);
const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {},
  shouldFocusError = true,
  shouldUnregister = true,
  criteriaMode,
}: UseFormOptions<TFieldValues, TContext> = {}): UseFormMethods<TFieldValues> {
  const fieldsRef = React.useRef<FieldRefs<TFieldValues>>({});
  const fieldArrayDefaultValuesRef = React.useRef<
    Record<InternalFieldName<FieldValues>, unknown[]>
  >({});
  const watchFieldsRef = React.useRef<InternalNameSet<TFieldValues>>(new Set());
  const useWatchFieldsRef = React.useRef<
    Record<string, InternalNameSet<TFieldValues>>
  >({});
  const useWatchRenderFunctionsRef = React.useRef<Record<string, () => void>>(
    {},
  );
  const fieldsWithValidationRef = React.useRef<
    FieldNamesMarkedBoolean<TFieldValues>
  >({});
  const validFieldsRef = React.useRef<FieldNamesMarkedBoolean<TFieldValues>>(
    {},
  );
  const defaultValuesRef = React.useRef<DefaultValues<TFieldValues>>(
    defaultValues,
  );
  const defaultValuesAtRenderRef = React.useRef<
    Partial<DefaultValues<TFieldValues>>
  >({});
  const isUnMount = React.useRef(false);
  const isWatchAllRef = React.useRef(false);
  const handleChangeRef = React.useRef<HandleChange>();
  const shallowFieldsStateRef = React.useRef(
    shouldUnregister ? {} : { ...defaultValues },
  );
  const resetFieldArrayFunctionRef = React.useRef<
    Record<
      InternalFieldName<FieldValues>,
      (data?: UnpackNestedValue<DeepPartial<TFieldValues>>) => void
    >
  >({});
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<InternalNameSet<TFieldValues>>(
    new Set(),
  );
  const modeRef = React.useRef(modeChecker(mode));
  const { isOnSubmit, isOnTouch } = modeRef.current;
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  const [formState, setFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    dirtyFields: {},
    isSubmitted: false,
    submitCount: 0,
    touched: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: !isOnSubmit,
    errors: {},
  });
  const readFormStateRef = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    touched: !isProxyEnabled || isOnTouch,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
  });
  const formStateRef = React.useRef(formState);
  const observerRef = React.useRef<MutationObserver | undefined>();
  const {
    isOnBlur: isReValidateOnBlur,
    isOnChange: isReValidateOnChange,
  } = React.useRef(modeChecker(reValidateMode)).current;

  contextRef.current = context;
  resolverRef.current = resolver;
  formStateRef.current = formState;

  const updateFormState = React.useCallback(
    (state: Partial<FormState<TFieldValues>> = {}) =>
      !isUnMount.current &&
      setFormState({
        ...formStateRef.current,
        ...state,
      }),
    [],
  );

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      error: FieldError | undefined,
      shouldRender: boolean | null = false,
      state: {
        dirtyFields?: FieldNamesMarkedBoolean<TFieldValues>;
        isDirty?: boolean;
        touched?: FieldNamesMarkedBoolean<TFieldValues>;
      } = {},
      isValid?: boolean,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        shouldRenderBasedOnError<TFieldValues>({
          errors: formStateRef.current.errors,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });
      const previousError = get(formStateRef.current.errors, name);

      if (error) {
        unset(validFieldsRef.current, name);
        shouldReRender =
          shouldReRender ||
          !previousError ||
          !deepEqual(previousError, error, true);
        set(formStateRef.current.errors, name, error);
      } else {
        if (get(fieldsWithValidationRef.current, name) || resolverRef.current) {
          set(validFieldsRef.current, name, true);
          shouldReRender = shouldReRender || previousError;
        }
        unset(formStateRef.current.errors, name);
      }

      if (
        (shouldReRender && !isNullOrUndefined(shouldRender)) ||
        !isEmptyObject(state)
      ) {
        updateFormState({
          ...state,
          errors: formStateRef.current.errors,
          ...(resolverRef.current ? { isValid: !!isValid } : {}),
        });
      }
    },
    [],
  );

  const setFieldValue = React.useCallback(
    (
      name: string,
      rawValue:
        | FieldValue<TFieldValues>
        | UnpackNestedValue<DeepPartial<TFieldValues>>
        | string[]
        | undefined
        | null
        | boolean,
    ) => {
      const { ref, options } = fieldsRef.current[name] as Field;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(ref) && options) {
        options.forEach(
          ({ ref: radioRef }: { ref: HTMLInputElement }) =>
            (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref) && !isString(value)) {
        ref.files = value as FileList;
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          (selectRef) =>
            (selectRef.selected = (value as string[]).includes(
              selectRef.value,
            )),
        );
      } else if (isCheckBoxInput(ref) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = isArray(value)
                  ? !!(value as []).find(
                      (data: string) => data === checkboxRef.value,
                    )
                  : value === checkboxRef.value),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
      }
    },
    [],
  );

  const isFormDirty = () =>
    !deepEqual(
      getValues(),
      isEmptyObject(defaultValuesRef.current)
        ? defaultValuesAtRenderRef.current
        : defaultValuesRef.current,
    ) || !isEmptyObject(formStateRef.current.dirtyFields);

  const updateAndGetDirtyState = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      shouldRender = true,
    ): {
      dirtyFields?: FieldNamesMarkedBoolean<TFieldValues>;
      isDirty?: boolean;
      touched?: FieldNamesMarkedBoolean<TFieldValues>;
    } => {
      if (
        !fieldsRef.current[name] ||
        (!readFormStateRef.current.isDirty &&
          !readFormStateRef.current.dirtyFields)
      ) {
        return {};
      }

      const isFieldDirty =
        get(defaultValuesAtRenderRef.current, name) !==
        getFieldValue(fieldsRef, name, shallowFieldsStateRef);
      const isDirtyFieldExist = get(formStateRef.current.dirtyFields, name);
      const previousIsDirty = formStateRef.current.isDirty;

      isFieldDirty
        ? set(formStateRef.current.dirtyFields, name, true)
        : unset(formStateRef.current.dirtyFields, name);

      const state = {
        isDirty: isFormDirty(),
        dirtyFields: formStateRef.current.dirtyFields,
      };

      const isChanged =
        (readFormStateRef.current.isDirty &&
          previousIsDirty !== state.isDirty) ||
        (readFormStateRef.current.dirtyFields &&
          isDirtyFieldExist !== get(formStateRef.current.dirtyFields, name));

      if (isChanged && shouldRender) {
        formStateRef.current = {
          ...formStateRef.current,
          ...state,
        };
        updateFormState({
          ...state,
        });
      }

      return isChanged ? state : {};
    },
    [],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName<TFieldValues>,
      skipReRender?: boolean | null,
    ): Promise<boolean> => {
      if (fieldsRef.current[name]) {
        const error = (
          await validateField<TFieldValues>(
            fieldsRef,
            isValidateAllFieldCriteria,
            fieldsRef.current[name] as Field,
            shallowFieldsStateRef,
          )
        )[name];

        shouldRenderBaseOnError(name, error, skipReRender);

        return isUndefined(error);
      }

      return false;
    },
    [shouldRenderBaseOnError, isValidateAllFieldCriteria],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (
      names:
        | InternalFieldName<TFieldValues>
        | InternalFieldName<TFieldValues>[],
    ) => {
      const { errors } = await resolverRef.current!(
        getValues(),
        contextRef.current,
        isValidateAllFieldCriteria,
      );
      const previousFormIsValid = formStateRef.current.isValid;

      if (isArray(names)) {
        const isInputsValid = names
          .map((name) => {
            const error = get(errors, name);

            error
              ? set(formStateRef.current.errors, name, error)
              : unset(formStateRef.current.errors, name);

            return !error;
          })
          .every(Boolean);

        updateFormState({
          isValid: isEmptyObject(errors),
          errors: formStateRef.current.errors,
        });

        return isInputsValid;
      } else {
        const error = get(errors, names);

        shouldRenderBaseOnError(
          names,
          error,
          previousFormIsValid !== isEmptyObject(errors),
          {},
          isEmptyObject(errors),
        );

        return !error;
      }
    },
    [shouldRenderBaseOnError, isValidateAllFieldCriteria],
  );

  const trigger = React.useCallback(
    async (
      name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
    ): Promise<boolean> => {
      const fields = name || Object.keys(fieldsRef.current);

      if (resolverRef.current) {
        return executeSchemaOrResolverValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async (data) => await executeValidation(data, null)),
        );
        updateFormState();
        return result.every(Boolean);
      }

      return await executeValidation(fields, readFormStateRef.current.isValid);
    },
    [executeSchemaOrResolverValidation, executeValidation],
  );

  const setInternalValues = React.useCallback(
    <T extends string, U extends object | unknown[]>(
      name: T,
      value: U,
      { shouldDirty, shouldValidate }: SetValueConfig,
    ) => {
      getPath(name, value).forEach((fieldName) => {
        const data = {};
        const field = fieldsRef.current[fieldName];

        if (field) {
          set(data, name, value);
          setFieldValue(fieldName, get(data, fieldName));

          if (shouldDirty) {
            updateAndGetDirtyState(fieldName);
          }

          if (shouldValidate) {
            trigger(fieldName as FieldName<TFieldValues>);
          }
        }
      });
    },
    [trigger, setFieldValue, updateAndGetDirtyState],
  );

  const setInternalValue = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      value: FieldValue<TFieldValues> | null | undefined | boolean,
      config: SetValueConfig = {},
    ) => {
      if (fieldsRef.current[name]) {
        setFieldValue(name, value);
        config.shouldDirty && updateAndGetDirtyState(name);
      } else if (!isPrimitive(value)) {
        setInternalValues(name, value, config);

        if (fieldArrayNamesRef.current.has(name)) {
          fieldArrayDefaultValuesRef.current[name] = value;
          resetFieldArrayFunctionRef.current[name]({
            [name]: value,
          } as UnpackNestedValue<DeepPartial<TFieldValues>>);

          if (
            readFormStateRef.current.isDirty ||
            readFormStateRef.current.dirtyFields
          ) {
            set(
              formStateRef.current.dirtyFields,
              name,
              setFieldArrayDirtyFields(
                value,
                get(defaultValuesRef.current, name, []),
                get(formStateRef.current.dirtyFields, name, []),
              ),
            );

            updateFormState({
              isDirty: !deepEqual(
                { ...getValues(), [name]: value },
                defaultValuesRef.current,
              ),
              dirtyFields: formStateRef.current.dirtyFields,
            });
          }
        }
      }

      !shouldUnregister && set(shallowFieldsStateRef.current, name, value);
    },
    [updateAndGetDirtyState, setFieldValue, setInternalValues],
  );

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  const renderWatchedInputs = (name: string, found = true): boolean => {
    if (!isEmptyObject(useWatchFieldsRef.current)) {
      for (const key in useWatchFieldsRef.current) {
        if (
          !name ||
          useWatchFieldsRef.current[key].has(name) ||
          useWatchFieldsRef.current[key].has(getFieldArrayParentName(name)) ||
          !useWatchFieldsRef.current[key].size
        ) {
          useWatchRenderFunctionsRef.current[key]();
          found = false;
        }
      }
    }

    return found;
  };

  function setValue<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    value: TFieldValue extends NestedValue<infer U>
      ? U
      : UnpackNestedValue<DeepPartial<LiteralToPrimitive<TFieldValue>>>,
    config?: SetValueConfig,
  ): void {
    setInternalValue(name, value as TFieldValues[string], config);

    if (isFieldWatched(name)) {
      updateFormState();
    }

    renderWatchedInputs(name);

    if ((config || {}).shouldValidate) {
      trigger(name as any);
    }
  }

  handleChangeRef.current = handleChangeRef.current
    ? handleChangeRef.current
    : async ({ type, target }: Event): Promise<void | boolean> => {
        const name = (target as Ref)!.name;
        const field = fieldsRef.current[name];
        let error;
        let isValid;

        if (field) {
          const isBlurEvent = type === EVENTS.BLUR;
          const shouldSkipValidation = skipValidation({
            isBlurEvent,
            isReValidateOnChange,
            isReValidateOnBlur,
            isTouched: !!get(formStateRef.current.touched, name),
            isSubmitted: formStateRef.current.isSubmitted,
            ...modeRef.current,
          });
          let state = updateAndGetDirtyState(name, false);
          let shouldRender = !isEmptyObject(state) || isFieldWatched(name);

          if (
            isBlurEvent &&
            !get(formStateRef.current.touched, name) &&
            readFormStateRef.current.touched
          ) {
            set(formStateRef.current.touched, name, true);
            state = {
              ...state,
              touched: formStateRef.current.touched,
            };
          }

          if (shouldSkipValidation) {
            renderWatchedInputs(name);
            return (
              (!isEmptyObject(state) ||
                (shouldRender && isEmptyObject(state))) &&
              updateFormState(state)
            );
          }

          if (resolverRef.current) {
            const { errors } = await resolverRef.current(
              getValues(),
              contextRef.current,
              isValidateAllFieldCriteria,
            );
            const previousFormIsValid = formStateRef.current.isValid;

            error = get(errors, name);

            isValid = isEmptyObject(errors);

            if (previousFormIsValid !== isValid) {
              shouldRender = true;
            }
          } else {
            error = (
              await validateField<TFieldValues>(
                fieldsRef,
                isValidateAllFieldCriteria,
                field,
                shallowFieldsStateRef,
              )
            )[name];
          }

          renderWatchedInputs(name);
          shouldRenderBaseOnError(name, error, shouldRender, state, isValid);
        }
      };

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  function getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function getValues(payload?: string | string[]): unknown {
    if (isString(payload)) {
      return getFieldValue(fieldsRef, payload, shallowFieldsStateRef);
    }

    if (isArray(payload)) {
      const data = {};

      for (const name of payload) {
        set(data, name, getFieldValue(fieldsRef, name, shallowFieldsStateRef));
      }

      return data;
    }

    return getFieldsValues(fieldsRef, shallowFieldsStateRef);
  }

  const validateResolver = React.useCallback(
    async (values = {}) => {
      const { errors } = await resolverRef.current!(
        {
          ...defaultValuesRef.current,
          ...getValues(),
          ...values,
        },
        contextRef.current,
        isValidateAllFieldCriteria,
      );
      const previousFormIsValid = formStateRef.current.isValid;
      const isValid = isEmptyObject(errors);

      if (previousFormIsValid !== isValid) {
        updateFormState({
          isValid,
        });
      }
    },
    [isValidateAllFieldCriteria],
  );

  const removeFieldEventListener = React.useCallback(
    (field: Field, forceDelete?: boolean) =>
      findRemovedFieldAndRemoveListener(
        fieldsRef,
        handleChangeRef.current!,
        field,
        shallowFieldsStateRef,
        shouldUnregister,
        forceDelete,
      ),
    [shouldUnregister],
  );

  const removeFieldEventListenerAndRef = React.useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (field) {
        removeFieldEventListener(field, forceDelete);

        if (shouldUnregister && !filterOutFalsy(field.options || []).length) {
          unset(defaultValuesAtRenderRef.current, field.ref.name);
          unset(validFieldsRef.current, field.ref.name);
          unset(fieldsWithValidationRef.current, field.ref.name);
          unset(formStateRef.current.errors, field.ref.name);
          set(formStateRef.current.dirtyFields, field.ref.name, true);

          updateFormState({
            errors: formStateRef.current.errors,
            isDirty: isFormDirty(),
            dirtyFields: formStateRef.current.dirtyFields,
          });

          resolverRef.current && validateResolver();
        }
      }
    },
    [validateResolver, removeFieldEventListener],
  );

  function clearErrors(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    name &&
      (isArray(name) ? name : [name]).forEach((inputName) =>
        fieldsRef.current[inputName]
          ? isKey(inputName)
            ? delete formStateRef.current.errors[inputName]
            : set(formStateRef.current.errors, inputName, undefined)
          : unset(formStateRef.current.errors, inputName),
      );

    updateFormState({
      errors: name ? formStateRef.current.errors : {},
    });
  }

  function setError(name: FieldName<TFieldValues>, error: ErrorOption): void {
    const ref = (fieldsRef.current[name] || {})!.ref;

    set(formStateRef.current.errors, name, {
      ...error,
      ref,
    });

    updateFormState({
      isValid: false,
      errors: formStateRef.current.errors,
    });

    error.shouldFocus && ref && ref.focus && ref.focus();
  }

  const watchInternal = React.useCallback(
    (
      fieldNames?: string | string[],
      defaultValue?: unknown,
      watchId?: string,
    ) => {
      const watchFields = watchId
        ? useWatchFieldsRef.current[watchId]
        : watchFieldsRef.current;
      const combinedDefaultValues = isUndefined(defaultValue)
        ? defaultValuesRef.current
        : defaultValue;
      const fieldValues = getFieldsValues<TFieldValues>(
        fieldsRef,
        shallowFieldsStateRef,
        false,
        fieldNames,
      );

      if (isString(fieldNames)) {
        return assignWatchFields<TFieldValues>(
          fieldValues,
          fieldNames,
          watchFields,
          isUndefined(defaultValue)
            ? get(combinedDefaultValues, fieldNames)
            : (defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>),
          true,
        );
      }

      if (isArray(fieldNames)) {
        return fieldNames.reduce(
          (previous, name) => ({
            ...previous,
            [name]: assignWatchFields<TFieldValues>(
              fieldValues,
              name,
              watchFields,
              combinedDefaultValues as UnpackNestedValue<
                DeepPartial<TFieldValues>
              >,
            ),
          }),
          {},
        );
      }

      if (isUndefined(watchId)) {
        isWatchAllRef.current = true;
      }

      return transformToNestObject(
        (!isEmptyObject(fieldValues) && fieldValues) ||
          (combinedDefaultValues as FieldValues),
      );
    },
    [],
  );

  function watch(): UnpackNestedValue<TFieldValues>;
  function watch<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    defaultValue?: UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
  function watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function watch(
    names: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  function watch(
    fieldNames?: string | string[],
    defaultValue?: unknown,
  ): unknown {
    return watchInternal(fieldNames, defaultValue);
  }

  function unregister(
    name: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): void {
    (isArray(name) ? name : [name]).forEach((fieldName) =>
      removeFieldEventListenerAndRef(fieldsRef.current[fieldName], true),
    );
  }

  function registerFieldRef<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement & Ref,
    validateOptions: ValidationRules | null = {},
  ): ((name: InternalFieldName<TFieldValues>) => void) | void {
    if (process.env.NODE_ENV !== 'production') {
      if (!ref.name) {
        return console.warn(
          '📋 Field is missing `name` attribute',
          ref,
          `https://react-hook-form.com/api#useForm`,
        );
      }

      if (
        fieldArrayNamesRef.current.has(ref.name.split(/\[\d+\]$/)[0]) &&
        !RegExp(
          `^${ref.name.split(/\[\d+\]$/)[0]}[\\d+].\\w+`
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]'),
        ).test(ref.name)
      ) {
        return console.warn(
          '📋 `name` prop should be in object shape: name="test[index].name"',
          ref,
          'https://react-hook-form.com/api#useFieldArray',
        );
      }
    }

    const { name, type, value } = ref;
    const fieldRefAndValidationOptions = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
    const compareRef = (currentRef: Ref) =>
      isWeb && (!isHTMLElement(ref) || currentRef === ref);
    let field = fields[name] as Field;
    let isEmptyDefaultValue = true;
    let defaultValue;

    if (
      field &&
      (isRadioOrCheckbox
        ? isArray(field.options) &&
          filterOutFalsy(field.options).find((option) => {
            return value === option.ref.value && compareRef(option.ref);
          })
        : compareRef(field.ref))
    ) {
      fields[name] = {
        ...field,
        ...validateOptions,
      };
      return;
    }

    if (type) {
      field = isRadioOrCheckbox
        ? {
            options: [
              ...filterOutFalsy((field && field.options) || []),
              {
                ref,
              } as RadioOrCheckboxOption,
            ],
            ref: { type, name },
            ...validateOptions,
          }
        : {
            ...fieldRefAndValidationOptions,
          };
    } else {
      field = fieldRefAndValidationOptions;
    }

    fields[name] = field;

    const isEmptyUnmountFields = isUndefined(
      get(shallowFieldsStateRef.current, name),
    );

    if (!isEmptyObject(defaultValuesRef.current) || !isEmptyUnmountFields) {
      defaultValue = get(
        isEmptyUnmountFields
          ? defaultValuesRef.current
          : shallowFieldsStateRef.current,
        name,
      );
      isEmptyDefaultValue = isUndefined(defaultValue);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(name, defaultValue);
      }
    }

    if (resolver && !isFieldArray && readFormStateRef.current.isValid) {
      validateResolver();
    } else if (!isEmptyObject(validateOptions)) {
      set(fieldsWithValidationRef.current, name, true);

      if (!isOnSubmit && readFormStateRef.current.isValid) {
        validateField(
          fieldsRef,
          isValidateAllFieldCriteria,
          field,
          shallowFieldsStateRef,
        ).then((error: FieldErrors) => {
          const previousFormIsValid = formStateRef.current.isValid;

          isEmptyObject(error)
            ? set(validFieldsRef.current, name, true)
            : unset(validFieldsRef.current, name);

          if (previousFormIsValid !== isEmptyObject(error)) {
            updateFormState();
          }
        });
      }
    }

    if (
      !defaultValuesAtRenderRef.current[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      const fieldValue = getFieldValue(fieldsRef, name, shallowFieldsStateRef);
      set(
        defaultValuesAtRenderRef.current,
        name,
        isEmptyDefaultValue
          ? isObject(fieldValue)
            ? { ...fieldValue }
            : fieldValue
          : defaultValue,
      );
      !isFieldArray && unset(formStateRef.current.dirtyFields, name);
    }

    if (type) {
      attachEventListeners(
        isRadioOrCheckbox && field.options
          ? field.options[field.options.length - 1]
          : field,
        isRadioOrCheckbox || isSelectInput(ref),
        handleChangeRef.current,
      );
    }
  }

  function register<TFieldElement extends FieldElement<TFieldValues>>(
    rules?: ValidationRules,
  ): (ref: (TFieldElement & Ref) | null) => void;
  function register(
    name: FieldName<TFieldValues>,
    rules?: ValidationRules,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: (TFieldElement & Ref) | null,
    rules?: ValidationRules,
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    refOrValidationOptions?:
      | FieldName<TFieldValues>
      | ValidationRules
      | (TFieldElement & Ref)
      | null,
    rules?: ValidationRules,
  ): ((ref: (TFieldElement & Ref) | null) => void) | void {
    if (!isWindowUndefined) {
      if (isString(refOrValidationOptions)) {
        registerFieldRef({ name: refOrValidationOptions }, rules);
      } else if (
        isObject(refOrValidationOptions) &&
        'name' in refOrValidationOptions
      ) {
        registerFieldRef(refOrValidationOptions, rules);
      } else {
        return (ref: (TFieldElement & Ref) | null) =>
          ref && registerFieldRef(ref, refOrValidationOptions);
      }
    }
  }

  const handleSubmit = React.useCallback(
    <TSubmitFieldValues extends FieldValues = TFieldValues>(
      onValid: SubmitHandler<TSubmitFieldValues>,
      onInvalid?: SubmitErrorHandler<TFieldValues>,
    ) => async (e?: React.BaseSyntheticEvent): Promise<void> => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors: FieldErrors<TFieldValues> = {};
      let fieldValues = getFieldsValues(fieldsRef, shallowFieldsStateRef, true);

      if (readFormStateRef.current.isSubmitting) {
        updateFormState({
          isSubmitting: true,
        });
      }

      try {
        if (resolverRef.current) {
          const { errors, values } = await resolverRef.current(
            fieldValues,
            contextRef.current,
            isValidateAllFieldCriteria,
          );
          formStateRef.current.errors = errors;
          fieldErrors = errors;
          fieldValues = values;
        } else {
          for (const field of Object.values(fieldsRef.current)) {
            if (field) {
              const {
                ref: { name },
              } = field;

              const fieldError = await validateField(
                fieldsRef,
                isValidateAllFieldCriteria,
                field,
                shallowFieldsStateRef,
              );

              if (fieldError[name]) {
                set(fieldErrors, name, fieldError[name]);
                unset(validFieldsRef.current, name);
              } else if (get(fieldsWithValidationRef.current, name)) {
                unset(formStateRef.current.errors, name);
                set(validFieldsRef.current, name, true);
              }
            }
          }
        }

        if (
          isEmptyObject(fieldErrors) &&
          Object.keys(formStateRef.current.errors).every(
            (name) => name in fieldsRef.current,
          )
        ) {
          updateFormState({
            errors: {},
            isSubmitting: true,
          });
          await onValid(
            fieldValues as UnpackNestedValue<TSubmitFieldValues>,
            e,
          );
        } else {
          formStateRef.current.errors = {
            ...formStateRef.current.errors,
            ...fieldErrors,
          };
          if (onInvalid) {
            await onInvalid(fieldErrors, e);
          }
          if (shouldFocusError) {
            focusOnErrorField(fieldsRef.current, fieldErrors);
          }
        }
      } finally {
        updateFormState({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful: isEmptyObject(formStateRef.current.errors),
          errors: formStateRef.current.errors,
          submitCount: formStateRef.current.submitCount + 1,
        });
      }
    },
    [shouldFocusError, isValidateAllFieldCriteria],
  );

  const resetRefs = ({
    errors,
    isDirty,
    isSubmitted,
    touched,
    isValid,
    submitCount,
    dirtyFields,
  }: OmitResetState) => {
    if (!isValid) {
      validFieldsRef.current = {};
      fieldsWithValidationRef.current = {};
    }

    defaultValuesAtRenderRef.current = {};
    fieldArrayDefaultValuesRef.current = {};
    watchFieldsRef.current = new Set();
    isWatchAllRef.current = false;

    updateFormState({
      isDirty: isDirty ? formStateRef.current.isDirty : false,
      isSubmitted: isSubmitted ? formStateRef.current.isSubmitted : false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      submitCount: submitCount ? formStateRef.current.submitCount : 0,
      isValid: isValid ? formStateRef.current.isValid : true,
      dirtyFields: dirtyFields ? formStateRef.current.dirtyFields : {},
      touched: touched ? formStateRef.current.touched : {},
      errors: errors ? formStateRef.current.errors : {},
    });
  };

  const reset = (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState: OmitResetState = {},
  ): void => {
    if (isWeb) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field) {
          const { ref, options } = field;
          const inputRef =
            isRadioOrCheckboxFunction(ref) && isArray(options)
              ? options[0].ref
              : ref;

          if (isHTMLElement(inputRef)) {
            try {
              inputRef.closest('form')!.reset();
              break;
            } catch {}
          }
        }
      }
    }

    fieldsRef.current = {};

    defaultValuesRef.current = { ...(values || defaultValuesRef.current) };

    if (values) {
      renderWatchedInputs('');
    }

    shallowFieldsStateRef.current = shouldUnregister ? {} : { ...values } || {};

    Object.values(resetFieldArrayFunctionRef.current).forEach(
      (resetFieldArray) => isFunction(resetFieldArray) && resetFieldArray(),
    );

    resetRefs(omitResetState);
  };

  observerRef.current =
    observerRef.current || !isWeb
      ? observerRef.current
      : onDomRemove(fieldsRef, removeFieldEventListenerAndRef);

  React.useEffect(() => {
    isUnMount.current = false;

    return () => {
      isUnMount.current = true;
      observerRef.current && observerRef.current.disconnect();
      shallowFieldsStateRef.current = {};

      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      fieldsRef.current &&
        Object.values(fieldsRef.current).forEach((field) =>
          removeFieldEventListenerAndRef(field, true),
        );
    };
  }, [removeFieldEventListenerAndRef]);

  if (!resolver && readFormStateRef.current.isValid) {
    formState.isValid =
      deepEqual(validFieldsRef.current, fieldsWithValidationRef.current) &&
      isEmptyObject(formStateRef.current.errors);
  }

  const commonProps = {
    trigger,
    setValue: React.useCallback(setValue, [setInternalValue, trigger]),
    getValues: React.useCallback(getValues, []),
    register: React.useCallback(register, [defaultValuesRef.current]),
    unregister: React.useCallback(unregister, []),
  };

  const control = {
    removeFieldEventListener,
    renderWatchedInputs,
    watchInternal,
    mode: modeRef.current,
    reValidateMode: {
      isReValidateOnBlur,
      isReValidateOnChange,
    },
    fieldsRef,
    isWatchAllRef,
    watchFieldsRef,
    resetFieldArrayFunctionRef,
    useWatchFieldsRef,
    useWatchRenderFunctionsRef,
    fieldArrayDefaultValuesRef,
    validFieldsRef,
    fieldsWithValidationRef,
    fieldArrayNamesRef,
    readFormStateRef,
    formStateRef,
    defaultValuesRef,
    shallowFieldsStateRef,
    updateFormState,
    shouldUnregister,
    validateResolver: resolver ? validateResolver : undefined,
    ...commonProps,
  };

  return {
    watch,
    control,
    formState: isProxyEnabled
      ? new Proxy(formState, {
          get: (obj, prop: keyof FormStateProxy) => {
            if (
              process.env.NODE_ENV !== 'production' &&
              prop === 'isValid' &&
              isOnSubmit
            ) {
              console.warn(
                '📋 `formState.isValid` is applicable with `onTouched`, `onChange` or `onBlur` mode. https://react-hook-form.com/api#formState',
              );
            }

            if (prop in obj) {
              readFormStateRef.current[prop] = true;
              return obj[prop];
            }

            return undefined;
          },
        })
      : formState,
    handleSubmit,
    reset: React.useCallback(reset, []),
    clearErrors: React.useCallback(clearErrors, []),
    setError: React.useCallback(setError, []),
    errors: formState.errors,
    ...commonProps,
  };
}
