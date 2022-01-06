import { IsNever } from '../../utils';

import { Keys } from './keys';
import { KeyGetValue } from './pathGetValue';
import { AsPathTuple, PathTuple } from './pathTuple';
import { AsKey, Key } from './utils';

/**
 * Type to check whether a key is present in a type.
 * If a union of keys is passed, all keys have to be present in the type.
 * @typeParam T - type which is introspected
 * @typeParam K - key
 * @example
 * ```
 * HasKey<{foo: string}, 'foo'> = true
 * HasKey<{foo: string}, 'bar'> = false
 * HasKey<{foo: string}, 'foo' | 'bar'> = false
 * ```
 * @internal
 */
export type HasKey<T, K extends Key> = IsNever<Exclude<K, Keys<T>>>;

/**
 * Type to implement {@link ValidPathPrefix} tail recursively.
 * @typeParam T   - type which the path should be checked against
 * @typeParam PT  - path which should exist within the given type
 * @typeParam VPT - accumulates the prefix of keys which have been
 *                  confirmed to exist already
 * @internal
 */
type ValidPathPrefixImpl<
  T,
  PT extends PathTuple,
  VPT extends PathTuple,
> = PT extends [infer K, ...infer R]
  ? HasKey<T, AsKey<K>> extends true
    ? ValidPathPrefixImpl<
        KeyGetValue<T, AsKey<K>>,
        AsPathTuple<R>,
        AsPathTuple<[...VPT, K]>
      >
    : VPT
  : VPT;

/**
 * Type to find the longest path prefix which is still valid,
 * i.e. exists within the given type.
 * @typeParam T  - type which the path should be checked against
 * @typeParam PT - path which should exist within the given type
 * @example
 * ```
 * ValidPathPrefix<{foo: {bar: string}}, ['foo', 'bar']> = ['foo', 'bar']
 * ValidPathPrefix<{foo: {bar: string}}, ['foo', 'ba']> = ['foo']
 * ```
 * @internal
 */
export type ValidPathPrefix<T, PT extends PathTuple> = ValidPathPrefixImpl<
  T,
  PT,
  []
>;

/**
 * Type to check whether a path through a type exists.
 * @typeParam T  - type which the path should be checked against
 * @typeParam PT - path which should exist within the given type
 * @example
 * ```
 * HasPath<{foo: {bar: string}}, ['foo', 'bar']> = true
 * HasPath<{foo: {bar: string}}, ['foo', 'ba']> = false
 * ```
 * @internal
 */
export type HasPath<T, PT extends PathTuple> = ValidPathPrefix<T, PT> extends PT
  ? true
  : false;
