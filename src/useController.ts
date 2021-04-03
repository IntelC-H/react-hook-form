import * as React from 'react';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import { EVENTS } from './constants';
import {
  FieldValues,
  UseControllerProps,
  UseControllerReturn,
  InternalFieldName,
  FieldPath,
} from './types';

export function useController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  rules,
  defaultValue,
  control,
}: UseControllerProps<TFieldValues, TName>): UseControllerReturn<
  TFieldValues,
  TName
> {
  const methods = useFormContext<TFieldValues>();
  const {
    defaultValuesRef,
    register,
    fieldsRef,
    fieldArrayNamesRef,
    controllerSubjectRef,
  } = control || methods.control;

  const { onChange, onBlur, ref } = register(name, rules);
  const [value, setInputStateValue] = React.useState(
    isUndefined(get(fieldsRef.current, name)._f.value) ||
      isNameInFieldArray(fieldArrayNamesRef.current, name)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : get(fieldsRef.current, name)._f.value,
  );
  const formState = useFormState({
    control: control || methods.control,
  });
  get(fieldsRef.current, name)._f.value = value;

  React.useEffect(() => {
    const controllerSubscription = controllerSubjectRef.current.subscribe({
      next: (data) =>
        (!data.name || name === data.name) &&
        setInputStateValue(get(data.values, name)),
    });

    (ref as (instance: any) => void)({
      target: value,
    });

    return () => controllerSubscription.unsubscribe();
  }, [name]);

  return {
    field: {
      onChange: (event: any) => {
        const value = getControllerValue(event);
        setInputStateValue(value);

        onChange({
          target: {
            value,
            name: name as InternalFieldName,
          },
          type: EVENTS.CHANGE,
        });
      },
      onBlur: () => {
        onBlur({
          target: {
            name: name as InternalFieldName,
          },
          type: EVENTS.BLUR,
        });
      },
      name,
      value,
      ref,
    },
    formState,
    fieldState: Object.defineProperties(
      {},
      {
        invalid: {
          get() {
            return !!get(formState.errors, name);
          },
        },
        isDirty: {
          get() {
            return !!get(formState.dirtyFields, name);
          },
        },
        isTouched: {
          get() {
            return !!get(formState.touchedFields, name);
          },
        },
        error: {
          get() {
            return get(formState.errors, name);
          },
        },
      },
    ),
  };
}
