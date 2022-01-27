import {
  Auto,
  Branded,
  FieldPathSetValue,
  FieldPathValue,
  IsNever,
  IsUnknown,
  PathString,
} from '../types';

/**
 * Function for creating a {@link TypedFieldPath} from a path string.
 * @param path - path string
 * @example
 * ```
 * type FooBar = { foo: { bar: string }}
 *
 * const path: TypedFieldPath<FooBar, string> = of('foo.bar')
 * ```
 */
export default function of<
  TFieldValues,
  TPathString extends PathString,
  TValue = unknown,
  TValueSet = never,
>(
  path: Auto.TypedFieldPath<TFieldValues, TPathString, TValue, TValueSet>,
): Branded.TypedFieldPath<
  TFieldValues,
  IsUnknown<TValue> extends true
    ? FieldPathValue<TFieldValues, TPathString>
    : TValue,
  IsNever<TValueSet> extends true
    ? FieldPathSetValue<TFieldValues, TPathString>
    : TValueSet
> {
  return path as never;
}
