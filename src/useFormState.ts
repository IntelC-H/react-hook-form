import * as React from 'react';
import { useFormContext } from './useFormContext';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isProxyEnabled from './utils/isProxyEnabled';
import cloneObject from './utils/cloneObject';
import {
  FieldValues,
  FormState,
  UseFormStateMethods,
  UseFormStateProps,
} from './types';

function useFormState<TFieldValues extends FieldValues = FieldValues>({
  control,
}: UseFormStateProps<TFieldValues>): UseFormStateMethods<TFieldValues> {
  const methods = useFormContext();

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 useWatch is missing `control` prop. https://react-hook-form.com/api#useWatch',
      );
    }
  }

  const { formStateRef, formStateSubjectRef, readFormStateRef } =
    control || methods.control;

  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>(
    formStateRef.current,
  );
  const readFormState = React.useRef(cloneObject(readFormStateRef.current));

  React.useEffect(() => {
    const tearDown = formStateSubjectRef.current.subscribe({
      next: (formState: Partial<FormState<TFieldValues>>) => {
        if (shouldRenderFormState(formState, readFormState.current)) {
          updateFormState({
            ...formStateRef.current,
            ...formState,
          });
        }
      },
    });

    return () => tearDown.unsubscribe();
  }, []);

  return getProxyFormState<TFieldValues>(
    isProxyEnabled,
    formState,
    readFormStateRef,
    readFormState,
    false,
  );
}

export { useFormState };
