import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../../constants';
import { useForm } from '../../useForm';
import isFunction from '../../utils/isFunction';

describe('handleSubmit', () => {
  it('should invoke the callback when validation pass', async () => {
    const { result } = renderHook(() => useForm());
    const callback = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
    expect(callback).toBeCalled();
  });

  it('should pass default value', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; deep: { nested: string; values: string } }>({
        mode: VALIDATION_MODE.onSubmit,
        defaultValues: {
          test: 'data',
          deep: {
            values: '5',
          },
        },
      }),
    );

    result.current.register('test');
    result.current.register('deep.nested');
    result.current.register('deep.values');

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
          deep: {
            nested: undefined,
            values: '5',
          },
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should not pass default value when field is not registered', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; deep: { nested: string; values: string } }>({
        mode: VALIDATION_MODE.onSubmit,
        defaultValues: {
          test: 'data',
          deep: {
            values: '5',
          },
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
          deep: {
            values: '5',
          },
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should not invoke callback when there are errors', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test', { required: true });

    const callback = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
    expect(callback).not.toBeCalled();
  });

  it('should not focus if errors is exist', async () => {
    const focus = jest.fn();
    const { result } = renderHook(() => useForm<{ test: string }>());
    const { ref } = result.current.register('test', { required: true });

    result.current.formState;

    isFunction(ref) &&
      ref({
        focus,
      });

    const callback = jest.fn();
    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(callback).not.toBeCalled();
    expect(focus).toBeCalled();
    expect(result.current.control._formState.errors?.test?.type).toBe(
      'required',
    );
  });

  it('should not focus if shouldFocusError is false', async () => {
    const mockFocus = jest.spyOn(HTMLInputElement.prototype, 'focus');

    const { result } = renderHook(() =>
      useForm<{ test: string }>({ shouldFocusError: false }),
    );

    result.current.register('test', { required: true });
    result.current.formState;

    const callback = jest.fn();
    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(callback).not.toBeCalled();
    expect(mockFocus).not.toBeCalled();
    expect(result.current.control._formState.errors?.test?.type).toBe(
      'required',
    );
  });

  it('should submit form data when inputs are removed', async () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    await act(async () =>
      result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'test',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent),
    );
  });

  it('should invoke onSubmit callback and reset nested errors when submit with valid form values', async () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useForm<{
        test: { firstName: string; lastName: string }[];
      }>(),
    );
    const validate = () => {
      return !!result.current
        .getValues()
        .test.some(({ firstName }) => firstName);
    };

    result.current.register('test.0.firstName', {
      validate,
    });
    result.current.register('test.0.lastName', {
      validate,
    });
    result.current.register('test.1.firstName', {
      validate,
    });
    result.current.register('test.1.lastName', {
      validate,
    });

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(callback).not.toBeCalled();

    result.current.setValue('test.0.firstName', 'test');

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(callback).toBeCalled();
  });

  it('should bubble the error up when an error occurs in the provided handleSubmit function', async () => {
    const errorMsg = 'this is an error';
    const App = () => {
      const [error, setError] = React.useState('');
      const { register, handleSubmit } = useForm();

      const rejectPromiseFn = jest.fn().mockRejectedValue(new Error(errorMsg));

      return (
        <form>
          <input {...register('test')} />
          <p>{error}</p>
          <button
            type={'button'}
            onClick={() =>
              handleSubmit(rejectPromiseFn)().catch((err) =>
                setError(err.message),
              )
            }
          >
            Submit
          </button>
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    screen.getByText(errorMsg);
  });

  describe('with validationSchema', () => {
    it('should invoke callback when error not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register('test', { required: true });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should invoke callback with transformed values', async () => {
      const resolver = async () => {
        return {
          values: { test: 'test' },
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register('test', { required: true });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback.mock.calls[0][0]).toEqual({ test: 'test' });
    });
  });

  describe('with onInvalid callback', () => {
    it('should invoke the onValid callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const onValidCallback = jest.fn();
      const onInvalidCallback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(
          onValidCallback,
          onInvalidCallback,
        )({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(onValidCallback).toBeCalledTimes(1);
      expect(onInvalidCallback).not.toBeCalledTimes(1);
    });

    it('should invoke the onInvalid callback when validation failed', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );
      result.current.register('test', { required: true });
      const onValidCallback = jest.fn();
      const onInvalidCallback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(
          onValidCallback,
          onInvalidCallback,
        )({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(onValidCallback).not.toBeCalledTimes(1);
      expect(onInvalidCallback).toBeCalledTimes(1);
    });
  });
});
