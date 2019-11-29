import * as React from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import attachNativeValidation from './logic/attachNativeValidation';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import omitValidFields from './logic/omitValidFields';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import isObject from './utils/isObject';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isSameError from './utils/isSameError';
import isUndefined from './utils/isUndefined';
import onDomRemove from './utils/onDomRemove';
import isMultipleSelect from './utils/isMultipleSelect';
import modeChecker from './utils/validationModeChecker';
import isNullOrUndefined from './utils/isNullOrUndefined';
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import {
  FieldValues,
  FieldName,
  FieldValue,
  FieldErrors,
  Field,
  FieldRefs,
  UseFormOptions,
  ValidationOptions,
  SubmitPromiseResult,
  OnSubmit,
  ValidationPayload,
  ElementLike,
  NameProp,
  FormStateProxy,
  ReadFormState,
  ManualFieldError,
  MultipleFieldErrors,
  Ref,
} from './types';

const { useRef, useState, useCallback, useEffect } = React;

export default function useForm<FormValues extends FieldValues = FieldValues>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  validationSchema,
  defaultValues = {},
  nativeValidation = false,
  submitFocusError = true,
  validationSchemaOption = { abortEarly: false },
  validateCriteriaMode,
}: UseFormOptions<FormValues> = {}) {
  const fieldsRef = useRef<FieldRefs<FormValues>>({});
  const validateAllFieldCriteria = validateCriteriaMode === 'all';
  const errorsRef = useRef<FieldErrors<FormValues>>({});
  const schemaErrorsRef = useRef<FieldErrors<FormValues>>({});
  const touchedFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const watchFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const dirtyFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const fieldsWithValidationRef = useRef(new Set<FieldName<FormValues>>());
  const validFieldsRef = useRef(new Set<FieldName<FormValues>>());
  const defaultInputValuesRef = useRef<
    Partial<Record<FieldName<FormValues>, FieldValue<FormValues>>>
  >({} as Record<FieldName<FormValues>, FieldValue<FormValues>>);
  const defaultValuesRef = useRef<FieldValue<FormValues> | Partial<FormValues>>(
    defaultValues,
  );
  const isUnMount = useRef(false);
  const isWatchAllRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const submitCountRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const isSchemaValidateTriggeredRef = useRef(false);
  const validateAndUpdateStateRef = useRef<Function>();
  const [, _render] = useState();
  const { isOnBlur, isOnSubmit } = useRef(modeChecker(mode)).current;
  const isWindowUndefined = typeof window === UNDEFINED;
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);
  const isProxyEnabled = !isWindowUndefined && 'Proxy' in window;
  const readFormState = useRef<ReadFormState>({
    dirty: !isProxyEnabled,
    isSubmitted: isOnSubmit,
    submitCount: !isProxyEnabled,
    touched: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled,
  });
  const {
    isOnBlur: isReValidateOnBlur,
    isOnSubmit: isReValidateOnSubmit,
  } = useRef(modeChecker(reValidateMode)).current;
  const validationSchemaOptionRef = useRef(validationSchemaOption);
  defaultValuesRef.current = defaultValues;

  const combineErrorsRef = (data: FieldErrors<FormValues>) => ({
    ...errorsRef.current,
    ...data,
  });

  const render = useCallback(() => {
    if (!isUnMount.current) {
      _render({});
    }
  }, []);

  const validateFieldCurry = useCallback(
    validateField.bind(
      null,
      fieldsRef.current,
      nativeValidation,
      validateAllFieldCriteria,
    ),
    [],
  );

  const validateWithSchemaCurry = useCallback(
    validateWithSchema.bind(
      null,
      validationSchema,
      validationSchemaOptionRef.current,
      validateAllFieldCriteria,
    ),
    [validationSchema],
  );

  const renderBaseOnError = useCallback(
    (
      name: FieldName<FormValues>,
      error: FieldErrors<FormValues>,
      shouldRender?,
    ): boolean | void => {
      let reRender =
        shouldRender ||
        shouldUpdateWithError<FormValues>({
          errors: errorsRef.current,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
          schemaErrors:
            isSchemaValidateTriggeredRef.current && schemaErrorsRef.current,
        });

      if (isEmptyObject(error)) {
        if (fieldsWithValidationRef.current.has(name) || validationSchema) {
          validFieldsRef.current.add(name);
          reRender = reRender || errorsRef.current[name];
        }

        delete errorsRef.current[name];
      } else {
        validFieldsRef.current.delete(name);
        reRender = reRender || !errorsRef.current[name];
      }

      errorsRef.current = combineErrorsRef(error);

      if (reRender) {
        render();
        return true;
      }
    },
    [render, validationSchema],
  );

  const setFieldValue = useCallback(
    (
      name: FieldName<FormValues>,
      rawValue: FieldValue<FormValues> | Partial<FormValues> | undefined,
    ): boolean => {
      const field = fieldsRef.current[name];

      if (!field) {
        return false;
      }

      const ref = field.ref;
      const { type } = ref;
      const options = field.options;
      const value =
        isWeb &&
        ref instanceof window.HTMLElement &&
        isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(type) && options) {
        options.forEach(
          ({ ref: radioRef }) => (radioRef.checked = radioRef.value === value),
        );
      } else if (isMultipleSelect(type)) {
        [...ref.options].forEach(
          selectRef =>
            (selectRef.selected = (value as string[]).includes(
              selectRef.value,
            )),
        );
      } else if (isCheckBoxInput(type) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = (value as string[]).includes(
                  checkboxRef.value,
                )),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
      }

      return type;
    },
    [isWeb],
  );

  const setDirty = (name: FieldName<FormValues>): boolean => {
    if (!fieldsRef.current[name]) {
      return false;
    }

    const isDirty =
      defaultInputValuesRef.current[name] !==
      getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
    const isDirtyChanged = dirtyFieldsRef.current.has(name) !== isDirty;

    if (isDirty) {
      dirtyFieldsRef.current.add(name);
    } else {
      dirtyFieldsRef.current.delete(name);
    }

    isDirtyRef.current = !!dirtyFieldsRef.current.size;
    return isDirtyChanged && readFormState.current.dirty;
  };

  const setInternalValue = useCallback(
    (
      name: FieldName<FormValues>,
      value: FieldValue<FormValues>,
    ): boolean | void => {
      setFieldValue(name, value);

      if (
        setDirty(name) ||
        (!touchedFieldsRef.current.has(name) && readFormState.current.touched)
      ) {
        return !!touchedFieldsRef.current.add(name);
      }
    },
    [setFieldValue],
  );

  const executeValidation = useCallback(
    async (
      {
        name,
        value,
      }: {
        name: FieldName<FormValues>;
        value?: FormValues[FieldName<FormValues>];
      },
      shouldRender,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;

      if (!field) {
        return false;
      }

      if (!isUndefined(value)) {
        setInternalValue(name, value);
      }

      if (shouldRender) {
        render();
      }

      const error = await validateFieldCurry(field);
      renderBaseOnError(name, error);

      return isEmptyObject(error);
    },
    [render, renderBaseOnError, setInternalValue, validateFieldCurry],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const { fieldErrors } = await validateWithSchemaCurry(
        combineFieldValues(getFieldsValues(fieldsRef.current)),
      );
      const isMultipleFields = isArray(payload);
      const names = isArray(payload)
        ? payload.map(({ name }) => name)
        : [payload.name];
      const validFieldNames = names.filter(
        name => !(fieldErrors as FieldErrors<FormValues>)[name],
      );
      const firstFieldName = names[0];
      const hasError = fieldErrors[firstFieldName];
      schemaErrorsRef.current = isMultipleFields
        ? fieldErrors
        : hasError
        ? {
            ...schemaErrorsRef.current,
            [firstFieldName]: fieldErrors[firstFieldName],
          }
        : omitValidFields(schemaErrorsRef.current, names);
      isSchemaValidateTriggeredRef.current = true;

      if (isMultipleFields) {
        errorsRef.current = omitValidFields<FormValues>(
          combineErrorsRef(
            Object.entries(fieldErrors)
              .filter(([key]) => names.includes(key))
              .reduce(
                (previous, [name, error]) => ({ ...previous, [name]: error }),
                {},
              ),
          ),
          validFieldNames,
        );
        render();
      } else {
        renderBaseOnError(
          firstFieldName,
          hasError ? schemaErrorsRef.current : {},
          shouldRender,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [render, renderBaseOnError, validateWithSchemaCurry],
  );

  const triggerValidation = useCallback(
    async (
      payload?:
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>
        | ValidationPayload<FieldName<FormValues>, FieldValue<FormValues>>[],
      shouldRender?: boolean,
    ): Promise<boolean> => {
      const fields =
        payload || Object.keys(fieldsRef.current).map(name => ({ name }));

      if (validationSchema) {
        return executeSchemaValidation(fields, shouldRender);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, false)),
        );
        render();
        return result.every(Boolean);
      }

      return await executeValidation(fields, shouldRender);
    },
    [executeSchemaValidation, executeValidation, render, validationSchema],
  );

  const setValue = useCallback<
    <Name extends FieldName<FormValues>>(
      name: Name,
      value: FormValues[Name],
      shouldValidate?: boolean,
    ) => void | Promise<boolean>
  >(
    (name, value, shouldValidate) => {
      const shouldRender =
        setInternalValue(name, value) ||
        isWatchAllRef.current ||
        watchFieldsRef.current.has(name);

      if (shouldValidate) {
        return triggerValidation({ name }, shouldRender);
      }

      if (shouldRender) {
        render();
      }
      return;
    },
    [render, setInternalValue, triggerValidation],
  );

  validateAndUpdateStateRef.current = validateAndUpdateStateRef.current
    ? validateAndUpdateStateRef.current
    : async ({ type, target }: MouseEvent): Promise<void | boolean> => {
        const name = target ? (target as Ref).name : '';
        const fields = fieldsRef.current;
        const errors = errorsRef.current;
        const field = fields[name];
        const currentError = errors[name];
        let error;

        if (!field) {
          return;
        }

        const isBlurEvent = type === EVENTS.BLUR;
        const shouldSkipValidation =
          (isOnSubmit && !isSubmittedRef.current) ||
          (isOnBlur && !isBlurEvent && !currentError) ||
          (isReValidateOnBlur && !isBlurEvent && currentError) ||
          (isReValidateOnSubmit && currentError);
        const shouldUpdateDirty = setDirty(name);
        let shouldUpdateState =
          isWatchAllRef.current ||
          watchFieldsRef.current.has(name) ||
          shouldUpdateDirty;

        if (
          isBlurEvent &&
          !touchedFieldsRef.current.has(name) &&
          readFormState.current.touched
        ) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (shouldSkipValidation) {
          return shouldUpdateState && render();
        }

        if (validationSchema) {
          const { fieldErrors } = await validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          );
          Object.keys(fieldErrors).forEach(name =>
            validFieldsRef.current.delete(name),
          );
          schemaErrorsRef.current = fieldErrors;
          isSchemaValidateTriggeredRef.current = true;
          error = fieldErrors[name] ? { [name]: fieldErrors[name] } : {};
        } else {
          error = await validateFieldCurry(field);
        }

        if (!renderBaseOnError(name, error) && shouldUpdateState) {
          render();
        }
      };

  const resetFieldRef = useCallback(
    (name: FieldName<FormValues>) => {
      delete errorsRef.current[name];
      delete fieldsRef.current[name];
      delete defaultInputValuesRef.current[name];
      [
        touchedFieldsRef,
        dirtyFieldsRef,
        fieldsWithValidationRef,
        validFieldsRef,
        watchFieldsRef,
      ].forEach(data => data.current.delete(name));

      if (readFormState.current.isValid || readFormState.current.touched) {
        render();
      }
    },
    [render],
  );

  const removeEventListenerAndRef = useCallback(
    (field: Field | undefined, forceDelete?: boolean) => {
      if (!field) {
        return;
      }

      findRemovedFieldAndRemoveListener(
        fieldsRef.current,
        validateAndUpdateStateRef.current,
        field,
        forceDelete,
      );
      resetFieldRef(field.ref.name);
    },
    [resetFieldRef],
  );

  function clearError(): void;
  function clearError(name: FieldName<FormValues>): void;
  function clearError(names: FieldName<FormValues>[]): void;
  function clearError(
    name?: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (isUndefined(name)) {
      errorsRef.current = {};
    } else {
      (isArray(name) ? name : [name]).forEach(
        fieldName => delete errorsRef.current[fieldName],
      );
    }

    render();
  }

  const setInternalError = ({
    name,
    type,
    types,
    message,
    preventRender,
  }: {
    name: FieldName<FormValues>;
    type: string;
    types?: MultipleFieldErrors;
    message?: string;
    preventRender?: boolean;
  }) => {
    const errors = errorsRef.current;

    if (!isSameError(errors[name], type, message)) {
      errors[name] = {
        type,
        types,
        message,
        ref: {},
        isManual: true,
      };
      if (!preventRender) {
        render();
      }
    }
  };

  function setError(name: ManualFieldError<FormValues>[]): void;
  function setError(
    name: FieldName<FormValues>,
    type: MultipleFieldErrors,
  ): void;
  function setError(
    name: FieldName<FormValues>,
    type: string,
    message?: string,
  ): void;
  function setError(
    name: FieldName<FormValues> | ManualFieldError<FormValues>[],
    type: string | MultipleFieldErrors = '',
    message?: string,
  ): void {
    if (isString(name)) {
      setInternalError({
        name,
        ...(isObject(type)
          ? {
              types: type,
              type: '',
            }
          : {
              type,
              message,
            }),
      });
    } else if (isArray(name)) {
      name.forEach(error =>
        setInternalError({ ...error, preventRender: true }),
      );
      render();
    }
  }

  function watch(): FormValues;
  function watch<T extends FieldName<FormValues>>(
    field: T,
    defaultValue?: string,
  ): FormValues[T];
  function watch(
    fields: FieldName<FormValues>[],
    defaultValues?: Partial<FormValues>,
  ): Partial<FormValues>;
  function watch(
    fieldNames?: FieldName<FormValues> | FieldName<FormValues>[],
    defaultValue?: string | Partial<FormValues>,
  ): FieldValue<FormValues> | Partial<FormValues> | string | undefined {
    const combinedDefaultValues = isUndefined(defaultValue)
      ? isUndefined(defaultValues)
        ? {}
        : defaultValues
      : defaultValue;
    const fieldValues = getFieldsValues<FormValues>(fieldsRef.current);
    const watchFields = watchFieldsRef.current;

    if (isProxyEnabled) {
      readFormState.current.dirty = true;
    }

    if (isString(fieldNames)) {
      return assignWatchFields<FormValues>(
        fieldValues,
        fieldNames,
        watchFields,
        combinedDefaultValues,
      );
    }

    if (isArray(fieldNames)) {
      return fieldNames.reduce((previous, name) => {
        let value = null;

        if (
          isEmptyObject(fieldsRef.current) &&
          isObject(combinedDefaultValues)
        ) {
          value = getDefaultValue(combinedDefaultValues, name);
        } else {
          value = assignWatchFields<FormValues>(
            fieldValues,
            name,
            watchFields,
            combinedDefaultValues,
          );
        }

        return {
          ...previous,
          [name]: value,
        };
      }, {});
    }

    isWatchAllRef.current = true;

    return (
      (!isEmptyObject(fieldValues) && fieldValues) ||
      defaultValue ||
      defaultValues
    );
  }

  function unregister(name: FieldName<FormValues>): void;
  function unregister(names: FieldName<FormValues>[]): void;
  function unregister(
    names: FieldName<FormValues> | FieldName<FormValues>[],
  ): void {
    if (!isEmptyObject(fieldsRef.current)) {
      (isArray(names) ? names : [names]).forEach(fieldName =>
        removeEventListenerAndRef(fieldsRef.current[fieldName], true),
      );
    }
  }

  function registerIntoFieldsRef<Element extends ElementLike>(
    ref: Element,
    validateOptions: ValidationOptions = {},
  ): ((name: FieldName<FormValues>) => void) | void {
    if (!ref.name) {
      return console.warn('Missing name at', ref);
    }

    const { name, type, value } = ref;
    const fieldAttributes = {
      ref,
      ...validateOptions,
    };
    const fields = fieldsRef.current;
    const isRadioOrCheckbox = isRadioInput(type) || isCheckBoxInput(type);
    let currentField = fields[name] as Field;

    if (
      isRadioOrCheckbox
        ? currentField &&
          isArray(currentField.options) &&
          currentField.options.find(({ ref }: Field) => value === ref.value)
        : currentField
    ) {
      fields[name as FieldName<FormValues>] = {
        ...currentField,
        ...validateOptions,
      };
      return;
    }

    if (type) {
      const mutationWatcher = onDomRemove(ref, () =>
        removeEventListenerAndRef(fieldAttributes),
      );

      if (isRadioOrCheckbox) {
        currentField = {
          options: [
            ...((currentField && currentField.options) || []),
            {
              ref,
              mutationWatcher,
            },
          ],
          ref: { type, name },
          ...validateOptions,
        };
      } else {
        currentField = {
          ...fieldAttributes,
          mutationWatcher,
        };
      }
    } else {
      currentField = fieldAttributes;
    }

    fields[name as FieldName<FormValues>] = currentField;

    if (!isEmptyObject(defaultValuesRef.current)) {
      const defaultValue = getDefaultValue(defaultValuesRef.current, name);

      if (!isUndefined(defaultValue)) {
        setFieldValue(name, defaultValue);
      }
    }

    if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.current.add(name);

      if (!isOnSubmit && readFormState.current.isValid) {
        if (validationSchema) {
          isSchemaValidateTriggeredRef.current = true;
          validateWithSchemaCurry(
            combineFieldValues(getFieldsValues(fields)),
          ).then(({ fieldErrors }) => {
            schemaErrorsRef.current = fieldErrors;
            if (isEmptyObject(schemaErrorsRef.current)) {
              render();
            }
          });
        } else {
          validateFieldCurry(currentField).then(error => {
            if (isEmptyObject(error)) {
              validFieldsRef.current.add(name);
            }

            if (
              validFieldsRef.current.size <=
              fieldsWithValidationRef.current.size
            ) {
              render();
            }
          });
        }
      }
    }

    if (!defaultInputValuesRef.current[name]) {
      defaultInputValuesRef.current[
        name as FieldName<FormValues>
      ] = getFieldValue(fields, currentField.ref);
    }

    if (!type) {
      return;
    }

    const fieldToAttachListener =
      isRadioOrCheckbox && currentField.options
        ? currentField.options[currentField.options.length - 1]
        : currentField;

    if (nativeValidation && validateOptions) {
      attachNativeValidation(ref, validateOptions);
    } else {
      attachEventListeners({
        field: fieldToAttachListener,
        isRadioOrCheckbox,
        validateAndStateUpdate: validateAndUpdateStateRef.current,
      });
    }
  }

  // React-Native: Element has no name prop, so it must be passed in on the validateRule
  function register<Element>(
    validateRule: ValidationOptions & NameProp,
  ): (ref: Element | null) => void;
  // Web model: name is on the element prop
  function register<Element extends ElementLike = ElementLike>(
    validateRule: ValidationOptions,
  ): (ref: Element | null) => void;
  // React-Native: Element has no name prop,
  // this case also allows a manual web-based register call to override the name prop
  function register<Element>(
    ref: Element | null,
    validateRule: ValidationOptions & NameProp,
  ): void;
  // Web model: name is on the prop for the ref passed in
  function register<Element extends ElementLike = ElementLike>(
    ref: Element | null,
    validationOptions?: ValidationOptions,
  ): void;
  function register<Element extends ElementLike = ElementLike>(
    refOrValidateRule: ValidationOptions | Element | null,
    validationOptions?: ValidationOptions & Partial<NameProp>,
  ): ((ref: Element | null) => void) | void {
    if (isWindowUndefined || !refOrValidateRule) {
      return;
    }

    if (validationOptions && isString(validationOptions.name)) {
      registerIntoFieldsRef(
        { name: validationOptions.name },
        validationOptions,
      );
      return;
    }

    if (isObject(refOrValidateRule) && 'name' in refOrValidateRule) {
      registerIntoFieldsRef(refOrValidateRule, validationOptions);
      return;
    }

    return (ref: Element | null) =>
      ref && registerIntoFieldsRef(ref, refOrValidateRule);
  }

  const handleSubmit = useCallback(
    (callback: OnSubmit<FormValues>) => async (
      e: React.BaseSyntheticEvent,
    ): Promise<void> => {
      if (e) {
        e.preventDefault();
        e.persist();
      }
      let fieldErrors;
      let fieldValues;
      const fields = fieldsRef.current;

      if (readFormState.current.isSubmitting) {
        isSubmittingRef.current = true;
        render();
      }

      try {
        if (validationSchema) {
          fieldValues = getFieldsValues(fields);
          const output = await validateWithSchemaCurry(
            combineFieldValues(fieldValues),
          );
          schemaErrorsRef.current = output.fieldErrors;
          fieldErrors = output.fieldErrors;
          fieldValues = output.result;
        } else {
          const {
            errors,
            values,
          }: SubmitPromiseResult<FormValues> = await Object.values(
            fields,
          ).reduce(
            async (
              previous: Promise<SubmitPromiseResult<FormValues>>,
              field: Field | undefined,
            ): Promise<SubmitPromiseResult<FormValues>> => {
              if (!field) {
                return previous;
              }

              const resolvedPrevious = await previous;
              const {
                ref,
                ref: { name },
              } = field;

              if (!fields[name]) {
                return Promise.resolve(resolvedPrevious);
              }

              const fieldError = await validateFieldCurry(field);

              if (fieldError[name]) {
                resolvedPrevious.errors = {
                  ...resolvedPrevious.errors,
                  ...fieldError,
                };

                validFieldsRef.current.delete(name);

                return Promise.resolve(resolvedPrevious);
              }

              if (fieldsWithValidationRef.current.has(name)) {
                validFieldsRef.current.add(name);
              }
              resolvedPrevious.values[
                name as FieldName<FormValues>
              ] = getFieldValue(fields, ref);
              return Promise.resolve(resolvedPrevious);
            },
            Promise.resolve<SubmitPromiseResult<FormValues>>({
              errors: {},
              values: {} as FormValues,
            }),
          );

          fieldErrors = errors;
          fieldValues = values;
        }

        if (isEmptyObject(fieldErrors)) {
          errorsRef.current = {};
          await callback(combineFieldValues(fieldValues), e);
        } else {
          if (submitFocusError) {
            Object.keys(fieldErrors).reduce((previous, current) => {
              const field = fields[current];
              if (field && previous) {
                if (field.ref.focus) {
                  field.ref.focus();
                  return false;
                } else if (field.options) {
                  field.options[0].ref.focus();
                  return false;
                }
              }
              return previous;
            }, true);
          }

          errorsRef.current = fieldErrors;
        }
      } finally {
        isSubmittedRef.current = true;
        isSubmittingRef.current = false;
        submitCountRef.current = submitCountRef.current + 1;
        render();
      }
    },
    [
      render,
      submitFocusError,
      validateFieldCurry,
      validateWithSchemaCurry,
      validationSchema,
    ],
  );

  const resetRefs = () => {
    errorsRef.current = {};
    defaultInputValuesRef.current = {};
    schemaErrorsRef.current = {};
    touchedFieldsRef.current = new Set();
    watchFieldsRef.current = new Set();
    dirtyFieldsRef.current = new Set();
    validFieldsRef.current = new Set();
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    isSchemaValidateTriggeredRef.current = false;
    submitCountRef.current = 0;
  };

  const reset = useCallback(
    (values?: Partial<FormValues>): void => {
      const fieldsKeyValue = Object.entries(fieldsRef.current);

      for (const [, value] of fieldsKeyValue) {
        if (value && value.ref && value.ref.closest) {
          try {
            value.ref.closest('form').reset();
            break;
          } catch {}
        }
      }

      resetRefs();

      if (values) {
        fieldsKeyValue.forEach(([key]) =>
          setFieldValue(key, getDefaultValue(values, key)),
        );
        defaultInputValuesRef.current = { ...values };
        if (readFormState.current.isValid) {
          triggerValidation();
        }
      }

      render();
    },
    [render, setFieldValue, triggerValidation],
  );

  const getValues = useCallback(
    (payload?: { nest: boolean }): FormValues => {
      const fieldValues = getFieldsValues(fieldsRef.current);
      const outputValues = isEmptyObject(fieldValues)
        ? defaultValues
        : fieldValues;
      return payload && payload.nest
        ? combineFieldValues(outputValues)
        : outputValues;
    },
    [defaultValues],
  );

  useEffect(
    () => () => {
      isUnMount.current = true;
      fieldsRef.current &&
        Object.values(
          fieldsRef.current,
        ).forEach((field: Field | undefined): void =>
          removeEventListenerAndRef(field, true),
        );
    },
    [removeEventListenerAndRef],
  );

  const formState = {
    dirty: isDirtyRef.current,
    isSubmitted: isSubmittedRef.current,
    submitCount: submitCountRef.current,
    touched: [...touchedFieldsRef.current],
    isSubmitting: isSubmittingRef.current,
    ...(isOnSubmit
      ? {
          isValid: isSubmittedRef.current && isEmptyObject(errorsRef.current),
        }
      : {
          isValid: validationSchema
            ? isSchemaValidateTriggeredRef.current &&
              isEmptyObject(schemaErrorsRef.current)
            : fieldsWithValidationRef.current.size
            ? !isEmptyObject(fieldsRef.current) &&
              validFieldsRef.current.size >=
                fieldsWithValidationRef.current.size
            : !isEmptyObject(fieldsRef.current),
        }),
  };

  return {
    register: useCallback(register, []),
    unregister: useCallback(unregister, [removeEventListenerAndRef]),
    handleSubmit,
    watch,
    reset,
    clearError: useCallback(clearError, []),
    setError: useCallback(setError, []),
    setValue,
    triggerValidation,
    getValues,
    errors: errorsRef.current,
    formState: isProxyEnabled
      ? new Proxy<FormStateProxy<FormValues>>(formState, {
          get: (obj, prop: keyof FormStateProxy) => {
            if (prop in obj) {
              readFormState.current[prop] = true;
              return obj[prop];
            }

            return {};
          },
        })
      : formState,
  };
}
