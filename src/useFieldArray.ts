import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import { appendId, mapIds } from './logic/mapIds';
import isUndefined from './utils/isUndefined';
import { FieldValues, UseFieldArrayProps, WithFieldId } from './types';

export function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues
>({ control, name }: UseFieldArrayProps) {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fields: globalFields,
    defaultValues,
    unregister,
  } = control || methods.control;

  const [fields, setField] = React.useState<WithFieldId<FormArrayValues>[]>(
    mapIds(defaultValues[name]),
  );

  const resetFields = () => {
    for (const key in globalFields) {
      if (isMatchFieldArrayName(key, name)) {
        unregister(key);
      }
    }
  };

  const prepend = (value: WithFieldId<FormArrayValues>) => {
    resetFields();
    setField([appendId(value), ...fields]);
  };

  const append = (value: WithFieldId<FormArrayValues>) =>
    setField([...fields, appendId(value)]);

  const remove = (index?: number) => {
    resetFields();
    setField(
      isUndefined(index)
        ? []
        : [...fields.slice(0, index), ...fields.slice(index + 1)],
    );
  };

  const insert = (index: number, value: WithFieldId<FormArrayValues>) => {
    resetFields();
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    resetFields();
    [fields[indexA], fields[indexB]] = [fields[indexB], fields[indexA]];
    setField([...fields]);
  };

  const move = (from: number, to: number) => {
    resetFields();
    fields.splice(to, 0, fields.splice(from, 1)[0]);
    setField([...fields]);
  };

  const reset = (values: any) => {
    resetFields();
    setField(mapIds(values[name]));
  };

  React.useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;
    fieldArrayNames.add(name);
    resetFunctions[name] = reset;

    return () => {
      resetFields();
      delete resetFunctions[name];
      fieldArrayNames.delete(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return {
    swap,
    move,
    prepend,
    append,
    remove,
    insert,
    fields,
  };
}
