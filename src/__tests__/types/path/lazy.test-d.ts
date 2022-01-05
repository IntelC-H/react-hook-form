import { expectType } from 'tsd';

import { LazyArrayPath, PathString } from '../../../types';
import { AccessPattern } from '../../../types/path/common';
import {
  AutoCompletePath,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPaths,
} from '../../../types/path/lazy';
import { _, InfiniteType, NullableInfiniteType } from '../__fixtures__';

/** {@link SuggestParentPath} */ {
  /** it should evaluate to the parent path */ {
    const actual = _ as SuggestParentPath<['foo', 'bar', 'baz']>;
    expectType<'foo.bar'>(actual);
  }

  /** it should evaluate to never if there is no parent path */ {
    const actual = _ as SuggestParentPath<['foo']>;
    expectType<never>(actual);
  }

  /** it should be distributive on path unions */ {
    const actual = _ as SuggestParentPath<
      ['foo', 'bar', 'baz'] | ['foo', 'baz', 'bar', '42']
    >;
    expectType<'foo.bar' | 'foo.baz.bar'>(actual);
  }
}

/** {@link SuggestChildPaths} */ {
  /** it should suggest paths when the current path is empty */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, []>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest paths when the current path is not empty */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['foo', 'foo']>;
    expectType<'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'>(
      actual,
    );
  }

  /** it should suggest paths when the path is optional */ {
    const actual = _ as SuggestChildPaths<
      NullableInfiniteType<string>,
      ['foo', 'foo']
    >;
    expectType<'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'>(
      actual,
    );
  }

  /** it should suggest only matching or traversable paths */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['foo'],
      AccessPattern<number>
    >;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz'>(actual);
  }

  /** it should suggest paths into a tuple */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['bar']>;
    expectType<`bar.0`>(actual);
  }

  /** it should suggest paths into an array */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['baz']>;
    expectType<`baz.${number}`>(actual);
  }

  /** it should evaluate to never if the path does not exist */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['foobar']>;
    expectType<never>(actual);
  }

  /** it should be distributive on path unions */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['foo', 'foo'] | ['foo', 'bar']
    >;
    expectType<
      | 'foo.foo.foo'
      | 'foo.foo.bar'
      | 'foo.foo.baz'
      | 'foo.foo.value'
      | 'foo.bar.0'
    >(actual);
  }
}

/** {@link SuggestPaths} */ {
  /** it should suggest all top level paths when the path is empty */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, []>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the sibling paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['fo']>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the child paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['foo']>;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the parent path */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['foo', 'value']>;
    expectType<'foo'>(actual);
  }

  /** it should not suggest paths which point to the wrong type */ {
    const actual = _ as SuggestPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      AccessPattern<number>
    >;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(actual);
  }

  /** it should not suggest paths which point don't include null or undefined */ {
    const actual = _ as SuggestPaths<
      NullableInfiniteType<string>,
      ['foo', 'foo'],
      AccessPattern<string>
    >;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(actual);
  }

  /** it should be distributive on path unions */ {
    const actual = _ as SuggestPaths<
      InfiniteType<string>,
      ['bar', '0'] | ['foo', 'foo']
    >;
    expectType<
      | 'bar'
      | 'foo'
      | 'bar.0.foo'
      | 'bar.0.bar'
      | 'bar.0.baz'
      | 'bar.0.value'
      | 'foo.foo.foo'
      | 'foo.foo.bar'
      | 'foo.foo.baz'
      | 'foo.foo.value'
    >(actual);
  }
}

/** {@link AutoCompletePath} */ {
  /** it should suggest all top level paths when the path is empty */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, ''>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should not suggest the current path if it is invalid */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo.foobar'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path if it is valid */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path and the parent path */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo.value'>;
    expectType<'foo' | 'foo.value'>(actual);
  }

  /** it should not suggest the current path if it has the wrong value */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.value',
      AccessPattern<number>
    >;
    expectType<'foo'>(actual);
  }

  /** it should not accept trailing dots */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo.'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should not accept leading dots */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, '.foo'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should not accept repeated dots */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo..foo'>;
    expectType<
      | 'foo'
      | 'foo.foo'
      | 'foo.foo.foo'
      | 'foo.foo.bar'
      | 'foo.foo.baz'
      | 'foo.foo.value'
    >(actual);
  }

  /** it should suggest the current path if it has the correct value */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.value',
      AccessPattern<string>
    >;
    expectType<'foo' | 'foo.value'>(actual);
  }

  /** it should accept string when any is encountered */ {
    const actual = _ as AutoCompletePath<
      { foo: any },
      'foo.bar.baz',
      AccessPattern<string>
    >;
    expectType<'foo.bar' | 'foo.bar.baz' | `foo.bar.baz.${string}`>(actual);
  }

  /** it should accept string when the type is any */ {
    const actual = _ as AutoCompletePath<any, string, AccessPattern<string>>;
    expectType<string>(actual);
  }

  /** it should evaluate to any when the path is any */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      any,
      AccessPattern<string>
    >;
    expectType<any>(actual);
  }

  /** it should evaluate to never when the path is never */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      never,
      AccessPattern<string>
    >;
    expectType<never>(actual);
  }

  /** it should not suggest the current path if null and undefined are excluded */ {
    const actual = _ as AutoCompletePath<
      NullableInfiniteType<string>,
      'foo.value',
      AccessPattern<string>
    >;
    expectType<'foo'>(actual);
  }

  /** it should not suggest the current path if null and undefined are included */ {
    const actual = _ as AutoCompletePath<
      NullableInfiniteType<string>,
      'foo.value',
      AccessPattern<string | null | undefined>
    >;
    expectType<'foo' | 'foo.value'>(actual);
  }

  /** it should suggest paths which point to the correct type */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.foo',
      AccessPattern<string>
    >;
    expectType<
      'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'
    >(actual);
  }

  /** it should not suggest paths which point to the wrong type */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.foo',
      AccessPattern<number>
    >;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(actual);
  }

  /** it should not suggest any child or parent paths for path unions */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'bar.0' | 'foo.foo'
    >;
    expectType<'bar.0' | 'foo.foo'>(actual);
  }

  /** it should not suggest invalid paths for path unions */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'bar.0' | 'foo.foobar'
    >;
    expectType<'bar.0'>(actual);
  }

  /** TS should be able to infer the generic */ {
    const fn = <P extends PathString>(
      path: AutoCompletePath<InfiniteType<string>, P>,
    ) => path;

    const actual = fn('foo.bar');
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from an object property */ {
    interface FnProps<P extends PathString> {
      path: AutoCompletePath<InfiniteType<string>, P>;
    }
    const fn = <P extends PathString>({ path }: FnProps<P>) => path;

    const actual = fn({ path: 'foo.bar' });
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from a nested object property */ {
    interface FnProps<P extends PathString> {
      nested: { path: AutoCompletePath<InfiniteType<string>, P> };
    }
    const fn = <P extends PathString>({ nested: { path } }: FnProps<P>) => path;

    const actual = fn({ nested: { path: 'foo.bar' } });
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** it should not suggest keys containing dots */ {
    const actual = _ as AutoCompletePath<{ foo: { 'foo.bar': string } }, 'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should not suggest blank keys */ {
    const actual = _ as AutoCompletePath<{ foo: { '': string } }, 'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should suggest index signatures */ {
    const actual = _ as AutoCompletePath<
      { foo: Record<string, { bar: string }> },
      `foo.${string}`
    >;
    expectType<'foo' | `foo.${string}` | `foo.${string}.bar`>(actual);
  }

  /** it should suggest the exact path through the index signature */ {
    const actual = _ as AutoCompletePath<
      { foo: Record<string, { bar: string }> },
      'foo.42'
    >;
    expectType<'foo' | `foo.42` | `foo.42.bar`>(actual);
  }

  /** it should suggest numeric index signatures */ {
    const actual = _ as AutoCompletePath<
      { foo: Record<number, { bar: string }> },
      `foo.${number}`
    >;
    expectType<'foo' | `foo.${number}` | `foo.${number}.bar`>(actual);
  }

  /** it should suggest the exact path through the numeric index signature */ {
    const actual = _ as AutoCompletePath<
      { foo: Record<number, { bar: string }> },
      'foo.42'
    >;
    expectType<'foo' | `foo.42` | `foo.42.bar`>(actual);
  }

  /** it should not accept non-overlapping paths */ {
    const actual = _ as AutoCompletePath<
      { foo: { baz: string } } | { bar: { baz: string } },
      'foo.baz'
    >;
    expectType<never>(actual);
  }

  /** it should suggest/accept only overlapping paths */ {
    const actual = _ as AutoCompletePath<
      { foo: { bar: string } } | { foo: { baz: string } },
      'foo'
    >;
    expectType<'foo'>(actual);
  }
}

/** {@link LazyArrayPath} */ {
  /** it should not accept primitive arrays */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.value'>;
    expectType<'foo'>(actual);
  }

  /** it should accept non-primitive arrays */ {
    const actual = _ as LazyArrayPath<{ foo: { bar: object[] } }, 'foo.bar'>;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive readonly arrays */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: readonly object[] } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept tuples */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.bar'>;
    expectType<'foo' | 'foo.bar.0'>(actual);
  }

  /** it should accept non-primitive nullable arrays */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: object[] | null | undefined } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive arrays with nullable values */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: Array<object | null | undefined> } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar.${number}`>(actual);
  }
}
