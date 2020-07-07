import * as React from 'react';
import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, FieldValues, InternalFieldName } from '../types/form';

export default function getFieldValue<TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  name: InternalFieldName<TFieldValues>,
  unmountFieldsStateRef?: React.MutableRefObject<Record<string, any>>,
) {
  const field = fieldsRef.current[name]!;

  if (field) {
    const {
      ref: { value },
      ref,
    } = field;

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return field ? getRadioValue(field.options).value : '';
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return field ? getCheckboxValue(field.options).value : false;
    }

    return value;
  }

  if (unmountFieldsStateRef) {
    return unmountFieldsStateRef.current[name];
  }
}
