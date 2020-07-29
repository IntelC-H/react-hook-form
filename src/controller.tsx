import * as React from 'react';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import set from './utils/set';
import getInputValue from './logic/getInputValue';
import skipValidation from './logic/skipValidation';
import isNameInFieldArray from './logic/isNameInFieldArray';
import { useFormContext } from './useFormContext';
import { VALUE } from './constants';
import { Control } from './types/form';
import { ControllerProps } from './types/props';

const Controller = <
  TAs extends
    | React.ReactElement
    | React.ComponentType<any>
    | 'input'
    | 'select'
    | 'textarea',
  TControl extends Control = Control
>({
  name,
  rules,
  as,
  render,
  defaultValue,
  control,
  onFocus,
  ...rest
}: ControllerProps<TAs, TControl>) => {
  const methods = useFormContext();
  const {
    defaultValuesRef,
    setValue,
    register,
    unregister,
    trigger,
    mode,
    reValidateMode: { isReValidateOnBlur, isReValidateOnChange },
    isSubmittedRef,
    touchedFieldsRef,
    readFormStateRef,
    reRender,
    fieldsRef,
    fieldArrayNamesRef,
    unmountFieldsStateRef,
  } = control || methods.control;
  const isNotFieldArray = !isNameInFieldArray(fieldArrayNamesRef.current, name);
  const getInitialValue = () =>
    !isUndefined(get(unmountFieldsStateRef.current, name)) && isNotFieldArray
      ? unmountFieldsStateRef.current[name]
      : isUndefined(defaultValue)
      ? get(defaultValuesRef.current, name)
      : defaultValue;
  const [value, setInputStateValue] = React.useState(getInitialValue());
  const valueRef = React.useRef(value);
  const onFocusRef = React.useRef(onFocus);
  const isSubmitted = isSubmittedRef.current;

  const shouldValidate = (isBlurEvent?: boolean) =>
    !skipValidation({
      isBlurEvent,
      isReValidateOnBlur,
      isReValidateOnChange,
      isSubmitted,
      ...mode,
    });

  const commonTask = ([event]: any[]) => {
    const data = getInputValue(event);
    setInputStateValue(data);
    valueRef.current = data;
    return data;
  };

  const registerField = React.useCallback(() => {
    if (fieldsRef.current[name]) {
      fieldsRef.current[name] = {
        ref: fieldsRef.current[name]!.ref,
        ...rules,
      };
    } else {
      register(
        Object.defineProperty({ name, focus: onFocusRef.current }, VALUE, {
          set(data) {
            setInputStateValue(data);
            valueRef.current = data;
          },
          get() {
            return valueRef.current;
          },
        }),
        rules,
      );
    }
  }, [fieldsRef, rules, name, onFocusRef, register]);

  React.useEffect(
    () => () => {
      !isNameInFieldArray(fieldArrayNamesRef.current, name) && unregister(name);
    },
    [unregister, name, fieldArrayNamesRef],
  );

  React.useEffect(() => {
    registerField();
  }, [registerField]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!fieldsRef.current[name]) {
      registerField();
      if (isNotFieldArray) {
        setInputStateValue(getInitialValue());
      }
    }
  });

  const onBlur = () => {
    if (
      readFormStateRef.current.touched &&
      !get(touchedFieldsRef.current, name)
    ) {
      set(touchedFieldsRef.current, name, true);
      reRender();
    }

    if (shouldValidate(true)) {
      trigger(name);
    }
  };

  const onChange = (...event: any[]) =>
    setValue(name, commonTask(event), {
      shouldValidate: shouldValidate(),
      shouldDirty: true,
    });

  const props = {
    ...rest,
    onChange,
    onBlur,
    name,
    value,
  };

  return as
    ? React.isValidElement(as)
      ? React.cloneElement(as, props)
      : React.createElement(as as string, props)
    : render
    ? render({
        onChange,
        onBlur,
        value,
      })
    : null;
};

export { Controller };
