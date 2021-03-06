import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import { get } from '../utils';
import { FieldRefs, InternalFieldName } from '../types';
import omit from '../utils/omit';

const focusFieldBy = (
  fields: FieldRefs,
  callback: (name: string) => boolean,
  fieldsNames?: Set<InternalFieldName>,
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const _f = field._f;
      const current = omit(field, '_f');

      if (_f && callback(_f.name)) {
        if (_f.ref.focus && isUndefined(_f.ref.focus())) {
          break;
        } else if (_f.refs) {
          _f.refs[0].focus();
          break;
        }
      } else if (isObject(current)) {
        focusFieldBy(current, callback);
      }
    }
  }
};

export default focusFieldBy;
