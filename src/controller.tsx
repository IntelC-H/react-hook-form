import * as React from 'react';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import getInputValue from './logic/getInputValue';
import skipValidation from './logic/skipValidation';
import { useFormContext } from './useFormContext';
import { EVENTS, VALIDATION_MODE, VALUE } from "./constants";
import { Mode, ValidationOptions } from './types';

export type EventFunction = (args: any) => any;

export type Props = {
  name: string;
  as: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  rules?: ValidationOptions;
  onChange?: EventFunction;
  onBlur?: EventFunction;
  mode?: Mode;
  onChangeName?: string;
  onBlurName?: string;
  valueName?: string;
  defaultValue?: any;
  control?: any;
};

const Controller = ({
  name,
  rules,
  as: InnerComponent,
  onChange,
  onBlur,
  onChangeName = VALIDATION_MODE.onChange,
  onBlurName = VALIDATION_MODE.onBlur,
  valueName,
  defaultValue,
  control,
  ...rest
}: Props) => {
  const methods = useFormContext() || {};
  const {
    defaultValues,
    fields,
    setValue,
    register,
    unregister,
    errors,
    mode: { isOnSubmit, isOnBlur },
    reValidateMode: { isReValidateOnBlur, isReValidateOnSubmit },
    formState: { isSubmitted },
  } = control || methods.control;
  const [value, setInputStateValue] = React.useState(
    isUndefined(defaultValue)
      ? isUndefined(defaultValues[name])
        ? ''
        : defaultValues[name]
      : defaultValue,
  );
  const valueRef = React.useRef(value);
  const isCheckboxInput = isBoolean(value);

  const shouldValidate = (isBlurEvent?: boolean) =>
    !skipValidation({
      hasError: !!errors[name],
      isBlurEvent,
      isOnBlur,
      isOnSubmit,
      isReValidateOnBlur,
      isReValidateOnSubmit,
      isSubmitted,
    });

  const commonTask = (target: any) => {
    const data = getInputValue(target, isCheckboxInput);
    setInputStateValue(data);
    valueRef.current = data;
    return data;
  };

  const eventWrapper = (event: EventFunction, eventName: string) => (
    ...arg: any
  ) => {
    const data = commonTask(event(arg));
    const isBlurEvent = eventName === EVENTS.BLUR;
    setValue(name, data, shouldValidate(isBlurEvent));
  };

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate());
  };

  const handleBlur = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate(true));
  };

  const registerField = () =>
    register(
      Object.defineProperty(
        {
          name,
        },
        VALUE,
        {
          set(data) {
            setInputStateValue(data);
            valueRef.current = data;
          },
          get() {
            return valueRef.current;
          },
        },
      ),
      { ...rules },
    );

  if (!fields[name]) {
    registerField();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => unregister(name), []);

  const props = {
    ...rest,
    ...(onChange
      ? { [onChangeName]: eventWrapper(onChange, EVENTS.CHANGE) }
      : { [onChangeName]: handleChange }),
    ...(isOnBlur || isReValidateOnBlur
      ? onBlur
        ? { [onBlurName]: eventWrapper(onBlur, EVENTS.BLUR) }
        : { [onBlurName]: handleBlur }
      : {}),
    ...{ [valueName || (isCheckboxInput ? 'checked' : VALUE)]: value },
  };

  return React.isValidElement(InnerComponent) ? (
    React.cloneElement(InnerComponent, props)
  ) : (
    <InnerComponent {...props} />
  );
};

export { Controller };
