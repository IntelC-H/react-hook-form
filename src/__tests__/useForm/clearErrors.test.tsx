import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { useForm } from '../../useForm';

describe('clearErrors', () => {
  it('should remove error', () => {
    const { result } = renderHook(() => useForm<{ input: string }>());
    act(() => {
      result.current.register('input');
      result.current.setError('input', {
        type: 'test',
        message: 'message',
      });
    });

    act(() => result.current.clearErrors('input'));

    expect(result.current.formState.errors).toEqual({});
  });

  it('should remove nested error', () => {
    const { result } = renderHook(() =>
      useForm<{ input: { nested: string } }>(),
    );
    result.current.formState.errors;
    act(() =>
      result.current.setError('input.nested', {
        type: 'test',
      }),
    );
    expect(result.current.formState.errors.input?.nested).toBeDefined();
    act(() => result.current.clearErrors('input.nested'));
    expect(result.current.formState.errors.input?.nested).toBeUndefined();
  });

  it('should remove deep nested error and set it to undefined', async () => {
    let currentErrors = {};

    const Component = () => {
      const {
        register,
        formState: { errors },
        trigger,
        clearErrors,
      } = useForm<{
        test: { data: string };
      }>();

      currentErrors = errors;
      return (
        <div>
          <input type="text" {...register('test.data', { required: true })} />
          <button type={'button'} onClick={() => trigger()}>
            submit
          </button>
          <button type={'button'} onClick={() => clearErrors(['test.data'])}>
            clear
          </button>
        </div>
      );
    };

    await actComponent(async () => {
      render(<Component />);
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(currentErrors).toMatchSnapshot();

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    });

    expect(currentErrors).toEqual({});
  });

  it('should remove specified errors', () => {
    const { result } = renderHook(() =>
      useForm<{
        input: string;
        input1: string;
        input2: string;
        nest: { data: string; data1: string };
      }>(),
    );

    result.current.formState.errors;

    const error = {
      type: 'test',
      message: 'message',
    };

    act(() => {
      result.current.register('input');
      result.current.register('input1');
      result.current.register('input2');
      result.current.setError('input', error);
      result.current.setError('input1', error);
      result.current.setError('input2', error);

      result.current.register('nest.data');
      result.current.register('nest.data1');
      result.current.setError('nest.data', error);
      result.current.setError('nest.data1', error);
    });

    const errors = {
      input: {
        ...error,
        ref: {
          name: 'input',
        },
      },
      input1: {
        ...error,
        ref: {
          name: 'input1',
        },
      },
      input2: {
        ...error,
        ref: {
          name: 'input2',
        },
      },
      nest: {
        data: {
          ...error,
          ref: {
            name: 'nest.data',
          },
        },
        data1: {
          ...error,
          ref: {
            name: 'nest.data1',
          },
        },
      },
    };
    expect(result.current.formState.errors).toEqual(errors);

    act(() => result.current.clearErrors(['input', 'input1', 'nest.data']));
    expect(result.current.formState.errors).toEqual({
      input2: errors.input2,
      nest: {
        data1: errors.nest.data1,
      },
    });
  });

  it('should remove all error', () => {
    const { result } = renderHook(() =>
      useForm<{ input: string; input1: string; input2: string }>(),
    );

    result.current.formState.errors;

    const error = {
      type: 'test',
      message: 'message',
    };
    act(() => result.current.setError('input', error));
    act(() => result.current.setError('input1', error));
    act(() => result.current.setError('input2', error));
    expect(result.current.formState.errors).toEqual({
      input: {
        ...error,
        ref: undefined,
        types: undefined,
      },
      input1: {
        ...error,
        ref: undefined,
        types: undefined,
      },
      input2: {
        ...error,
        ref: undefined,
        types: undefined,
      },
    });

    act(() => result.current.clearErrors());
    expect(result.current.formState.errors).toEqual({});
  });

  it('should prevent the submission if there is a custom error', async () => {
    const submit = jest.fn();
    const { result } = renderHook(() =>
      useForm<{ data: string; whatever: string }>(),
    );

    result.current.register('data');

    act(() => {
      result.current.setError('whatever', { type: 'server' });
    });

    await act(async () => await result.current.handleSubmit(submit)());
    expect(submit).not.toBeCalled();

    act(() => {
      result.current.clearErrors('whatever');
    });

    await act(async () => await result.current.handleSubmit(submit)());
    expect(submit).toBeCalled();
  });
});
