import React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFocusFieldName from './logic/getFocusFieldName';
import isWatched from './logic/isWatched';
import mapCurrentIds from './logic/mapCurrentIds';
import appendAt from './utils/append';
import cloneObject from './utils/cloneObject';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import moveArrayAt from './utils/move';
import omitKeys from './utils/omitKeys';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import updateAt from './utils/update';
import {
  FieldArray,
  FieldArrayMethodProps,
  FieldArrayPath,
  FieldArrayWithId,
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const _shouldKeepKeyName = React.useRef(
    get(control._getFieldArray(name)[0], keyName),
  );
  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(mapCurrentIds(control._getFieldArray(name), keyName));
  const _fieldIds = React.useRef(fields);
  const _name = React.useRef(name);
  const _actioned = React.useRef(false);

  _name.current = name;
  _fieldIds.current = fields;
  control._names.array.add(name);

  useSubscribe({
    callback: ({ values, name: fieldArrayName }) => {
      if (fieldArrayName === _name.current || !fieldArrayName) {
        setFields(mapCurrentIds(get(values, _name.current, []), keyName));
      }
    },
    subject: control._subjects.array,
  });

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    >(
      updatedFieldArrayValuesWithKey: T,
      hasKey: boolean = _shouldKeepKeyName.current,
    ) => {
      const updatedFieldArrayValues = hasKey
        ? updatedFieldArrayValuesWithKey
        : omitKeys(updatedFieldArrayValuesWithKey, keyName);
      hasKey && (_shouldKeepKeyName.current = true);
      _actioned.current = true;
      set(control._formValues, name, updatedFieldArrayValues);
      return updatedFieldArrayValues;
    },
    [control, name, keyName],
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValuesWithKey = appendAt(
      mapCurrentIds(control._getFieldArray(name), keyName, _fieldIds),
      mapCurrentIds(appendValue, keyName),
    );
    const fieldArrayValues = updateValues(
      updatedFieldArrayValuesWithKey,
      appendValue[0][keyName],
    );
    control._names.focus = getFocusFieldName(
      name,
      fieldArrayValues.length - 1,
      options,
    );

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const prependValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValuesWithKey = prependAt(
      mapCurrentIds(control._getFieldArray(name), keyName, _fieldIds),
      mapCurrentIds(prependValue, keyName),
    );
    const fieldArrayValues = updateValues(
      updatedFieldArrayValuesWithKey,
      prependValue[0][keyName],
    );
    control._names.focus = getFocusFieldName(name, 0, options);

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(
      mapCurrentIds(control._getFieldArray(name), keyName, _fieldIds),
      index,
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      removeArrayAt,
      {
        argA: index,
      },
      fieldArrayValues,
    );
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const insertValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValuesWithKey = insertAt(
      mapCurrentIds(control._getFieldArray(name), keyName, _fieldIds),
      index,
      mapCurrentIds(insertValue, keyName),
    );
    const fieldArrayValues = updateValues(
      updatedFieldArrayValuesWithKey,
      insertValue[0][keyName],
    );
    control._names.focus = getFocusFieldName(name, index, options);

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      keyName,
      _fieldIds,
    );
    swapArrayAt(updatedFieldArrayValuesWithKey, indexA, indexB);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      fieldArrayValues,
      false,
    );
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      keyName,
      _fieldIds,
    );
    moveArrayAt(updatedFieldArrayValuesWithKey, from, to);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    setFields(updatedFieldArrayValuesWithKey);

    control._updateFieldArray(
      name,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      fieldArrayValues,
      false,
    );
  };

  const update = (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      keyName,
      _fieldIds,
    );
    const updatedFieldArrayValues = updateAt(
      updatedFieldArrayValuesWithKey,
      index,
      value,
    );
    _fieldIds.current = mapCurrentIds(updatedFieldArrayValues, keyName);
    const fieldArrayValues = updateValues(
      _fieldIds.current,
      get(value, keyName),
    );

    setFields(_fieldIds.current);
    control._updateFieldArray(
      name,
      updateAt,
      {
        argA: index,
        argB: value,
      },
      fieldArrayValues,
      true,
      false,
      false,
    );
  };

  const replace = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  ) => {
    const updateValue = convertToArrayPayload(value) as Partial<TFieldValues>[];
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      updateValue,
      keyName,
    ) as Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[];
    const fieldArrayValues = updateValues(
      updatedFieldArrayValuesWithKey,
      updateValue[0][keyName],
    );

    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      () => updatedFieldArrayValuesWithKey,
      {},
      fieldArrayValues,
      true,
      false,
      false,
    );
  };

  React.useEffect(() => {
    control._stateFlags.action = false;

    isWatched(name, control._names) && control._subjects.state.next({});

    if (_actioned.current) {
      control._executeSchema([name]).then((result) => {
        const error = get(result.errors, name);

        if (error && error.type && !get(control._formState.errors, name)) {
          set(control._formState.errors, name, error);
          control._subjects.state.next({
            errors: control._formState.errors as FieldErrors<TFieldValues>,
          });
        }
      });
    }

    control._subjects.watch.next({
      name,
      values: control._formValues,
    });

    control._names.focus &&
      focusFieldBy(control._fields, (key: string) =>
        key.startsWith(control._names.focus),
      );

    control._names.focus = '';

    control._proxyFormState.isValid && control._updateValid();
  }, [fields, name, control, keyName]);

  React.useEffect(() => {
    !get(control._formValues, name) && set(control._formValues, name, []);

    return () => {
      if (control._options.shouldUnregister || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
      }
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [updateValues, name, control, keyName]),
    move: React.useCallback(move, [updateValues, name, control, keyName]),
    prepend: React.useCallback(prepend, [updateValues, name, control, keyName]),
    append: React.useCallback(append, [updateValues, name, control, keyName]),
    remove: React.useCallback(remove, [updateValues, name, control, keyName]),
    insert: React.useCallback(insert, [updateValues, name, control, keyName]),
    update: React.useCallback(update, [updateValues, name, control, keyName]),
    replace: React.useCallback(replace, [updateValues, name, control, keyName]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
