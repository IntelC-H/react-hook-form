import React, { useRef, useState, useCallback, useEffect } from 'react';
import attachEventListeners from './logic/attachEventListeners';
import combineFieldValues from './logic/combineFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import attachNativeValidation from './logic/attachNativeValidation';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isRadioInput from './utils/isRadioInput';
import onDomRemove from './utils/onDomRemove';
import modeChecker from './utils/validationModeChecker';
import warnMessage from './utils/warnMessage';
import get from './utils/get';
import getDefaultValue from './logic/getDefaultValue';
import assignWatchFields from './logic/assignWatchFields';
import isString from './utils/isString';
import {
  DataType,
  ErrorMessages,
  Field,
  FieldsObject,
  FieldValue,
  Props,
  Ref,
  RegisterInput,
  SubmitPromiseResult,
  VoidFunction,
  OnSubmit,
} from './types';
import isUndefined from './utils/isUndefined';

export default function useForm<
  Data extends DataType,
  Name extends keyof Data = keyof Data
>(
  {
    mode,
    validationSchema,
    defaultValues,
    validationFields,
    nativeValidation,
    submitFocusError,
  }: Props<Data> = {
    mode: 'onSubmit',
    defaultValues: {},
    nativeValidation: false,
    submitFocusError: true,
  },
) {
  const fieldsRef = useRef<FieldsObject<Data>>({});
  const errorsRef = useRef<ErrorMessages<Data>>({});
  const submitCountRef = useRef<number>(0);
  const touchedFieldsRef = useRef(new Set());
  const watchFieldsRef = useRef<{ [key in keyof Data]?: boolean }>({});
  const isUnMount = useRef<boolean>(false);
  const isWatchAllRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const isSchemaValidateTriggeredRef = useRef<boolean>(false);
  const validateAndStateUpdateRef = useRef<Function>();
  const fieldsWithValidationRef = useRef(new Set());
  const validFieldsRef = useRef(new Set());
  const [_unused, reRenderForm] = useState({});
  const { isOnChange, isOnBlur, isOnSubmit } = useRef(
    modeChecker(mode),
  ).current;

  const combineErrorsRef = (data: any) => ({
    ...errorsRef.current,
    ...data,
  });

  const renderBaseOnError = useCallback(
    (
      name: keyof Data,
      errorsFromRef: ErrorMessages<Data>,
      error: ErrorMessages<Data>,
      shouldRender: boolean = true,
    ): boolean => {
      if (errorsFromRef[name] && !error[name]) {
        delete errorsRef.current[name];
        validFieldsRef.current.add(name);
        if (shouldRender) reRenderForm({});
        return true;
      } else if (error[name]) {
        validFieldsRef.current.delete(name);
        if (shouldRender) reRenderForm({});
        return true;
      }

      if (!isOnSubmit && !validFieldsRef.current.has(name)) {
        validFieldsRef.current.add(name);
        if (shouldRender) reRenderForm({});
        return true;
      }
      return false;
    },
    [isOnSubmit],
  );

  const setFieldValue = (
    name: Name,
    value: Record<string, any> | undefined,
  ): void => {
    const field = fieldsRef.current[name];
    if (!field) return;
    const ref = field.ref;
    const options = field.options;

    if (isRadioInput(ref.type) && options) {
      options.forEach(({ ref: radioRef }): void => {
        if (radioRef.value === value) radioRef.checked = true;
      });
    } else {
      ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
    }
  };

  const setValueInternal = useCallback(
    (name: Name, value: Data[Name]): void => {
      setFieldValue(name, value);
      touchedFieldsRef.current.add(name);
      isDirtyRef.current = true;

      reRenderForm({});
    },
    [],
  );

  const executeValidation = useCallback(
    async (
      {
        name,
        value,
      }: {
        name: Name;
        value?: Data[Name];
      },
      shouldRender: boolean = true,
    ): Promise<boolean> => {
      const field = fieldsRef.current[name]!;
      const errors = errorsRef.current;

      if (!field) return false;
      if (value !== undefined) setValueInternal(name, value);

      const error = await validateField(field, fieldsRef.current);
      errorsRef.current = combineErrorsRef(error);
      renderBaseOnError(name, errors, error, shouldRender);
      return isEmptyObject(error);
    },
    [renderBaseOnError, setValueInternal],
  );

  const executeSchemaValidation = useCallback(
    async (
      payload:
        | {
            name: Name;
            value?: Data[Name];
          }
        | {
            name: Name;
            value?: Data[Name];
          }[],
    ): Promise<boolean> => {
      const fieldValues = getFieldsValues(fieldsRef.current);
      const fieldErrors = await validateWithSchema(
        validationSchema,
        fieldValues,
      );
      let result: boolean;
      let errors: ErrorMessages<Data>;

      if (Array.isArray(payload)) {
        const names = payload.map(({ name }) => name as string);
        errors = combineErrorsRef(
          Object.entries(fieldErrors).reduce(
            (previous: { [key: string]: any }, [key, value]) =>
              names.includes(key) ? { ...previous, [key]: value } : previous,
            {},
          ),
        );
        result = isEmptyObject(fieldErrors);
      } else {
        const payloadName = payload.name as string;
        errors = combineErrorsRef(
          fieldErrors[payloadName] ? { name: fieldErrors[payloadName] } : null,
        );
        result = !fieldErrors[payloadName];
      }

      errorsRef.current = errors;
      isSchemaValidateTriggeredRef.current = true;
      reRenderForm({});
      return result;
    },
    [validationSchema],
  );

  const triggerValidation = useCallback(
    async (
      payload?:
        | {
            name: Name;
            value?: Data[Name];
          }
        | {
            name: Name;
            value?: Data[Name];
          }[],
    ): Promise<boolean> => {
      let fields: any = payload;

      if (!payload)
        fields = Object.keys(fieldsRef.current).map(name => ({ name }));
      if (validationSchema) return executeSchemaValidation(fields);

      if (Array.isArray(fields)) {
        const result = await Promise.all(
          fields.map(async data => await executeValidation(data, false)),
        );
        reRenderForm({});
        return result.every(Boolean);
      }
      return executeValidation(fields);
    },
    [executeSchemaValidation, executeValidation, validationSchema],
  );

  const setValue = useCallback(
    (name: Name, value: Data[Name], shouldValidate: boolean = false): void => {
      setValueInternal(name, value);
      if (shouldValidate) triggerValidation({ name });
    },
    [setValueInternal, triggerValidation],
  );

  validateAndStateUpdateRef.current = validateAndStateUpdateRef.current
    ? validateAndStateUpdateRef.current
    : async ({ target: { name }, type }: Ref): Promise<void> => {
        if (Array.isArray(validationFields) && !validationFields.includes(name))
          return;
        const fields = fieldsRef.current;
        const errorsFromRef = errorsRef.current;
        const ref = fields[name];
        if (!ref) return;
        const isBlurType = type === 'blur';
        const isValidateDisabled = !isSubmittedRef.current && isOnSubmit;
        const shouldUpdateValidateMode = isOnChange || (isOnBlur && isBlurType);
        let shouldUpdateState =
          isWatchAllRef.current || watchFieldsRef.current[name];

        if (!isDirtyRef.current) {
          isDirtyRef.current = true;
          shouldUpdateState = true;
        }

        if (!touchedFieldsRef.current.has(name)) {
          touchedFieldsRef.current.add(name);
          shouldUpdateState = true;
        }

        if (isValidateDisabled && shouldUpdateState) return reRenderForm({});

        if (validationSchema) {
          const result = getFieldsValues(fields);
          const fieldsErrors = await validateWithSchema(
            validationSchema,
            result,
          );
          isSchemaValidateTriggeredRef.current = true;
          const error = fieldsErrors[name];
          const shouldUpdate =
            ((!error && errorsFromRef[name]) || error) &&
            (shouldUpdateValidateMode || isSubmittedRef.current);

          if (shouldUpdate) {
            errorsRef.current = { ...errorsFromRef, ...{ [name]: error } };
            if (!error) delete errorsRef.current[name];
            return reRenderForm({});
          }
        } else {
          const error = await validateField<Data>(
            ref,
            fields,
            nativeValidation,
          );
          const shouldUpdate = shouldUpdateWithError({
            errors: errorsFromRef,
            error,
            isValidateDisabled,
            isOnBlur,
            isBlurType,
            name,
          });

          if (shouldUpdate || shouldUpdateValidateMode) {
            errorsRef.current = combineErrorsRef(error);
            if (renderBaseOnError(name, errorsRef.current, error)) return;
          }
        }

        if (shouldUpdateState) reRenderForm({});
      };

  const removeEventListener: Function = useCallback(
    findRemovedFieldAndRemoveListener.bind(
      null,
      fieldsRef.current,
      touchedFieldsRef,
      fieldsWithValidationRef,
      validateAndStateUpdateRef.current,
    ),
    [],
  );

  const clearError = (name?: Name | Name[]): void => {
    if (name === undefined) {
      errorsRef.current = {};
    } else if (isString(name)) {
      delete errorsRef.current[name];
    } else if (Array.isArray(name)) {
      name.forEach(item => {
        delete errorsRef.current[item];
      });
    }
    reRenderForm({});
  };

  const setError = (
    name: Name,
    type: string,
    message?: string,
    ref?: Ref,
  ): void => {
    const errorsFromRef = errorsRef.current;
    const error = errorsFromRef[name];
    const isSameError =
      error &&
      !isString(error) &&
      (error.type === type && error.message === message);

    if (!isSameError) {
      errorsFromRef[name] = {
        type,
        message,
        ref,
        isManual: true,
      };
      reRenderForm({});
    }
  };

  const registerIntoFieldsRef = useCallback(
    (elementRef: Ref, data: RegisterInput | undefined): void => {
      if (elementRef && !elementRef.name)
        return warnMessage(`⚠ Missing field name: ${elementRef}`);
      const { name, type, value } = elementRef;

      if (!isOnSubmit && data && !isEmptyObject(data)) {
        fieldsWithValidationRef.current.add(name);
      }

      const { required = false, validate = undefined } = data || {};
      const inputData = {
        ...data,
        ref: elementRef,
      };
      const fields: any = fieldsRef.current;
      const isRadio = isRadioInput(type);
      const field = fields[name];
      const existRadioOptionIndex =
        isRadio && field && Array.isArray(field.options)
          ? field.options.findIndex(
              ({ ref }: { ref: Ref }): boolean => value === ref.value,
            )
          : -1;

      if ((!isRadio && field) || (isRadio && existRadioOptionIndex > -1))
        return;

      if (!type) {
        fields[name] = { ref: { name }, ...data };
      } else {
        if (isRadio) {
          if (!field)
            fields[name] = {
              options: [],
              required,
              validate,
              ref: { type: 'radio', name },
            };
          if (validate) fields[name]!.validate = validate;

          (fields[name]!.options || []).push({
            ...inputData,
            mutationWatcher: onDomRemove(
              elementRef,
              (): Function => removeEventListener(inputData, true),
            ),
          });
        } else {
          fields[name] = {
            ...inputData,
            mutationWatcher: onDomRemove(
              elementRef,
              (): Function => removeEventListener(inputData, true),
            ),
          };
        }
      }

      if (defaultValues) {
        const defaultValue = defaultValues[name] || get(defaultValues, name);
        if (defaultValue !== undefined) setFieldValue(name, defaultValue);
      }

      if (!type) return;

      const fieldData = isRadio
        ? (fields[name]!.options || [])[
            (fields[name]!.options || []).length - 1
          ]
        : fields[name];

      if (!fieldData) return;

      if (nativeValidation && data) {
        attachNativeValidation(elementRef, data);
      } else {
        attachEventListeners({
          field: fieldData,
          isRadio,
          validateAndStateUpdate: validateAndStateUpdateRef.current,
        });
      }
    },
    [defaultValues, isOnSubmit, nativeValidation, removeEventListener],
  );

  function watch(
    fieldNames?: Name | string | (Name | string)[] | undefined,
    defaultValue?: string | Partial<Data> | undefined,
  ): FieldValue | Partial<Data> | void {
    const fieldValues = getFieldsValues(fieldsRef.current);
    const watchFields: any = watchFieldsRef.current;

    if (isString(fieldNames)) {
      const value = assignWatchFields(fieldValues, fieldNames, watchFields);
      if (!isUndefined(value)) {
        return value;
      } else if (!isUndefined(defaultValue)) {
        return defaultValue;
      }
      return getDefaultValue(defaultValues, fieldNames);
    }

    if (Array.isArray(fieldNames)) {
      return isEmptyObject(fieldsRef.current)
        ? fieldNames.reduce(
            (previous, name) => ({ ...previous, [name]: undefined }),
            {},
          )
        : fieldNames.reduce(
            (previous, name) => ({
              ...previous,
              [name]:
                assignWatchFields(fieldValues, name as string, watchFields) ||
                getDefaultValue(defaultValues, name as string),
            }),
            {},
          );
    }

    return fieldValues || defaultValue || defaultValues;
  }

  const register = useCallback(
    (refOrValidateRule: RegisterInput | Ref, validateRule?: RegisterInput) => {
      if (!refOrValidateRule || isUndefined(window)) return;

      if (validateRule && !refOrValidateRule.name) {
        warnMessage(refOrValidateRule);
        return;
      }

      if (refOrValidateRule.name) {
        registerIntoFieldsRef(refOrValidateRule, validateRule);
      }

      return (ref: Ref): void =>
        ref && registerIntoFieldsRef(ref, refOrValidateRule);
    },
    [registerIntoFieldsRef],
  );

  const resetField = (name: Name | string) => {
    const field = fieldsRef.current[name as string];
    if (!field) return;
    const { ref, options } = field;
    isRadioInput(ref.type) && Array.isArray(options)
      ? options.forEach((input): void => removeEventListener(input, true))
      : removeEventListener(ref, true);

    delete watchFieldsRef.current[name];
    delete errorsRef.current[name];
    delete fieldsRef.current[name];
    touchedFieldsRef.current.delete(name);
    fieldsWithValidationRef.current.delete(name);
    validFieldsRef.current.delete(name);
  };

  const unregister = (name: Name | string | (Name | string)[]): void => {
    Array.isArray(name) ? name.forEach(resetField) : resetField(name);
  };

  const handleSubmit = (callback: OnSubmit<Data>) => async (
    e: React.SyntheticEvent,
  ): Promise<void> => {
    if (e && !nativeValidation) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    let firstFocusError = true;
    const fields = fieldsRef.current;
    const currentFieldValues = validationFields
      ? (validationFields.map(name => fieldsRef.current[name]) as [])
      : Object.values(fields);
    isSubmittingRef.current = true;
    reRenderForm({});

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);
    } else {
      const {
        errors,
        values,
      }: SubmitPromiseResult<Data> = await currentFieldValues.reduce(
        async (
          previous: Promise<SubmitPromiseResult<Data>>,
          field: Field | undefined,
        ): Promise<SubmitPromiseResult<Data>> => {
          if (!field) return previous;
          const resolvedPrevious: any = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(
            field,
            fields,
            nativeValidation,
          );

          if (fieldError[name]) {
            if (submitFocusError && firstFocusError && ref.focus) {
              ref.focus();
              firstFocusError = false;
            }
            resolvedPrevious.errors = {
              ...(resolvedPrevious.errors || {}),
              ...fieldError,
            };
            return Promise.resolve(resolvedPrevious);
          }

          resolvedPrevious.values[name] = getFieldValue(fields, ref);
          return Promise.resolve(resolvedPrevious);
        },
        Promise.resolve<SubmitPromiseResult<Data>>({
          errors: {},
          values: {},
        } as any),
      );

      fieldErrors = errors;
      fieldValues = values;
    }

    if (isEmptyObject(fieldErrors)) {
      errorsRef.current = {};
      await callback(combineFieldValues(fieldValues), e);
    } else {
      errorsRef.current = fieldErrors as any;
    }

    if (isUnMount.current) return;

    isSubmittedRef.current = true;
    submitCountRef.current += 1;
    isSubmittingRef.current = false;
    reRenderForm({});
  };

  const resetRefs = () => {
    watchFieldsRef.current = {};
    errorsRef.current = {};
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    touchedFieldsRef.current = new Set();
    fieldsWithValidationRef.current = new Set();
    validFieldsRef.current = new Set();
    submitCountRef.current = 0;
    isSchemaValidateTriggeredRef.current = false;
  };

  const unSubscribe = useCallback((): void => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach(
        (field: Field | undefined): void => {
          if (!field) return;
          const { ref, options } = field;
          isRadioInput(ref.type) && Array.isArray(options)
            ? options.forEach((fieldRef): void =>
                removeEventListener(fieldRef, true),
              )
            : removeEventListener(field, true);
        },
      );
    fieldsRef.current = {};
    resetRefs();
  }, [removeEventListener]);

  const reset = useCallback((values?: DataType): void => {
    const fields = Object.values(fieldsRef.current);
    for (let field of fields) {
      if (field && field.ref.closest) {
        field.ref.closest('form').reset();
        break;
      }
    }
    resetRefs();

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        setFieldValue(key as Name, value);
      });
    }

    reRenderForm({});
  }, []);

  const getValues = (payload?: { nest: boolean }): Data => {
    const data = getFieldsValues<Data>(fieldsRef.current);
    return payload && payload.nest ? combineFieldValues(data) : data;
  };

  useEffect((): VoidFunction => {
    return () => {
      isUnMount.current = true;
      unSubscribe();
    };
  }, [unSubscribe]);

  const isEmptyErrors = isEmptyObject(errorsRef.current);

  return {
    register,
    unregister,
    handleSubmit,
    watch,
    unSubscribe,
    reset,
    clearError,
    setError,
    setValue,
    triggerValidation,
    getValues,
    errors: errorsRef.current,
    formState: {
      dirty: isDirtyRef.current,
      isSubmitted: isSubmittedRef.current,
      submitCount: submitCountRef.current,
      touched: [...touchedFieldsRef.current],
      isSubmitting: isSubmittingRef.current,
      ...(isOnSubmit
        ? {
            isValid: isEmptyErrors,
          }
        : {
            isValid: validationSchema
              ? isSchemaValidateTriggeredRef.current && isEmptyErrors
              : fieldsWithValidationRef.current.size
              ? !isEmptyObject(fieldsRef.current) &&
                validFieldsRef.current.size >=
                  fieldsWithValidationRef.current.size
              : !isEmptyObject(fieldsRef.current),
          }),
    },
  };
}
