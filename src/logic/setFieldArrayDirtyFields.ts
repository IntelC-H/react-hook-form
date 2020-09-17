import { get } from '../utils';
import isArray from '../utils/isArray';
import set from '../utils/set';

export default function setFieldArrayDirtyFields<
  T extends U,
  U extends Record<string, unknown>[],
  K extends Record<string, boolean | []>
>(
  values: T,
  defaultValues: U,
  dirtyFields: Record<string, boolean | []>[],
  parentNode?: K,
  parentName?: keyof K,
) {
  let index = -1;

  while (++index < values.length) {
    for (const key in values[index]) {
      if (isArray(values[index][key])) {
        !dirtyFields[index] && (dirtyFields[index] = {});
        dirtyFields[index][key] = [];
        setFieldArrayDirtyFields(
          values[index][key],
          get(defaultValues[index] || {}, key, []),
          dirtyFields[index][key] as [],
          dirtyFields[index],
          key,
        );
      } else {
        get(defaultValues[index] || {}, key) === values[index][key]
          ? set(dirtyFields[index] || {}, key)
          : (dirtyFields[index] = {
              ...dirtyFields[index],
              [key]: true,
            });
      }
    }
    !dirtyFields.length &&
      parentNode &&
      delete parentNode[parentName as keyof K];
  }

  return dirtyFields.length ? dirtyFields : undefined;
}
