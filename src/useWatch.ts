import * as React from 'react';

import convertToArrayPayload from './utils/convertToArrayPayload';
import isUndefined from './utils/isUndefined';
import {
  Control,
  DeepPartial,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
  UseWatchProps,
} from './types';
import { useFormContext } from './useFormContext';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TFieldName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[],
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TFieldNames>;
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const { control, name, defaultValue } = props || {};
  const methods = useFormContext();
  const nameRef = React.useRef(name);
  nameRef.current = name;

  const { watchInternal, subjectsRef } = control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? watchInternal(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    watchInternal(name as InternalFieldName);

    const watchSubscription = subjectsRef.current.watch.subscribe({
      next: ({ name: inputName, values }) =>
        (!nameRef.current ||
          !inputName ||
          convertToArrayPayload(nameRef.current).some(
            (fieldName) =>
              inputName &&
              fieldName &&
              (fieldName.startsWith(inputName as InternalFieldName) ||
                inputName.startsWith(fieldName as InternalFieldName)),
          )) &&
        updateValue(
          watchInternal(
            nameRef.current as string,
            defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
            false,
            values,
          ),
        ),
    });

    return () => watchSubscription.unsubscribe();
  }, []);

  return value;
}
