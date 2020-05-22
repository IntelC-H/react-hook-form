import * as React from 'react';
import { useFormContext } from './useFormContext';
import get from './utils/get';
import { FieldErrors } from './types/form';
import { ErrorMessageProps } from './types/props';

const ErrorMessage = <
  TFieldErrors extends FieldErrors,
  TAs extends
    | undefined
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements = undefined
>({
  as: InnerComponent,
  errors,
  name,
  message,
  children,
  ...rest
}: ErrorMessageProps<TFieldErrors, TAs>) => {
  const methods = useFormContext();
  const error = get(errors || methods.errors, name);

  if (!error) {
    return null;
  }

  const { message: messageFromRegister, types } = error;
  const props = {
    ...(InnerComponent ? rest : {}),
    children: children
      ? children({ message: messageFromRegister || message, messages: types })
      : messageFromRegister || message,
  };

  return InnerComponent ? (
    React.isValidElement(InnerComponent) ? (
      React.cloneElement(InnerComponent, props)
    ) : (
      React.createElement(InnerComponent as string, props)
    )
  ) : (
    <React.Fragment {...props} />
  );
};

export { ErrorMessage };
