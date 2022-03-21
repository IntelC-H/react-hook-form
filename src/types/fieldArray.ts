import { FieldValues } from './fields';
import { Control } from './form';
import { Auto, FieldPathValue, PathString } from './path';

export type UseFieldArrayProps<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = {
  name: Auto.FieldArrayPath<TFieldValues, TFieldArrayName>;
  control?: Control<TFieldValues>;
  shouldUnregister?: boolean;
};

/**
 * `useFieldArray` returned `fields` with unique id
 */
export type FieldArrayWithId<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends PathString = never,
> = FieldArray<TFieldValues, TFieldArrayName> & Record<'id', string>;

export type FieldArray<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = FieldPathValue<TFieldValues, TFieldArrayName> extends
  | ReadonlyArray<infer U>
  | null
  | undefined
  ? U
  : never;

/**
 * `useFieldArray` focus option, ability to toggle focus on and off with `shouldFocus` and setting focus by either field index or name.
 */
export type FieldArrayMethodProps = {
  shouldFocus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

/**
 * Swap field array by supplying from and to index
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param indexA - from index
 * @param indexB - to index
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => swap(0, 1)}>swap</button>
 * ```
 */
export type UseFieldArraySwap = (indexA: number, indexB: number) => void;

/**
 * Move field array by supplying from and to index
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param indexA - from index
 * @param indexB - to index
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => move(0, 1)}>swap</button>
 * ```
 */
export type UseFieldArrayMove = (indexA: number, indexB: number) => void;

/**
 * Prepend field/fields to the start of the fields and optionally focus. The input value will be registered during this action.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - prepend items or items
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => prepend({ name: "data" })}>Prepend</button>
 * <button type="button" onClick={() => prepend({ name: "data" }, { shouldFocus: false })}>Prepend</button>
 * <button
 *   type="button"
 *   onClick={() => prepend([{ name: "data" }, { name: "data" }])}
 * >
 *   Prepend
 * </button>
 * ```
 */
export type UseFieldArrayPrepend<
  TFieldValues,
  TFieldArrayName extends PathString,
> = (
  value:
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Append field/fields to the end of your fields and focus. The input value will be registered during this action.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - append items or items.
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => prepend({ name: "data" })}>Append</button>
 * <button type="button" onClick={() => prepend({ name: "data" }, { shouldFocus: false })}>Append</button>
 * <button
 *   type="button"
 *   onClick={() => append([{ name: "data" }, { name: "data" }])}
 * >
 *   Append
 * </button>
 * ```
 */
export type UseFieldArrayAppend<
  TFieldValues,
  TFieldArrayName extends PathString,
> = (
  value:
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Remove field/fields at particular position.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - index to remove at, or remove all when no index provided.
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => remove(0)}>Remove</button>
 * <button
 *   type="button"
 *   onClick={() => remove()}
 * >
 *   Remove all
 * </button>
 * ```
 */
export type UseFieldArrayRemove = (index?: number | number[]) => void;

/**
 * Insert field/fields at particular position and focus.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - insert position
 * @param value - insert field or fields
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => insert(1, { name: "data" })}>Insert</button>
 * <button type="button" onClick={() => insert(1, { name: "data" }, { shouldFocus: false })}>Insert</button>
 * <button
 *   type="button"
 *   onClick={() => insert(1, [{ name: "data" }, { name: "data" }])}
 * >
 *   Insert
 * </button>
 * ```
 */
export type UseFieldArrayInsert<
  TFieldValues,
  TFieldArrayName extends PathString,
> = (
  index: number,
  value:
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Update field/fields at particular position.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - insert position
 * @param value - insert field or fields
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => update(1, { name: "data" })}>Update</button>
 * <button
 *   type="button"
 *   onClick={() => update(1, [{ name: "data" }, { name: "data" }])}
 * >
 *   Update
 * </button>
 * ```
 */
type UseFieldArrayUpdate<TFieldValues, TFieldArrayName extends PathString> = (
  index: number,
  value: FieldArray<TFieldValues, TFieldArrayName>,
) => void;

/**
 * Replace the entire field array values.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - the entire field values.
 *
 * @example
 * ```tsx
 * <button
 *   type="button"
 *   onClick={() => update([{ name: "data" }, { name: "data" }])}
 * >
 *   Replace
 * </button>
 * ```
 */
type UseFieldArrayReplace<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = (
  value:
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>
    | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
) => void;

export type UseFieldArrayReturn<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = {
  swap: UseFieldArraySwap;
  move: UseFieldArrayMove;
  prepend: UseFieldArrayPrepend<TFieldValues, TFieldArrayName>;
  append: UseFieldArrayAppend<TFieldValues, TFieldArrayName>;
  remove: UseFieldArrayRemove;
  insert: UseFieldArrayInsert<TFieldValues, TFieldArrayName>;
  update: UseFieldArrayUpdate<TFieldValues, TFieldArrayName>;
  replace: UseFieldArrayReplace<TFieldValues, TFieldArrayName>;
  fields: FieldArrayWithId<TFieldValues, TFieldArrayName>[];
};
