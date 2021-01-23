import { act, renderHook } from '@testing-library/react-hooks';
import { useForm } from '../../useForm';
import isFunction from '../../utils/isFunction';
import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { VALIDATION_MODE } from '../../constants';

let nodeEnv: string | undefined;

describe('register', () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env.NODE_ENV = nodeEnv;
  });

  it('should return throw error when name is missing', () => {
    process.env.NODE_ENV = 'development';
    const { result } = renderHook(() => useForm<{ test: string }>());

    // @ts-expect-error
    const registerCallback = () => result.current.register();

    expect(registerCallback).toThrow(
      new Error(
        '📋 `name` prop is missing during register: https://react-hook-form.com/api#register',
      ),
    );
  });

  it('should support register passed to ref', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        defaultValues: {
          test: 'testData',
        },
      }),
    );

    const { ref } = result.current.register('test');

    isFunction(ref) &&
      ref({
        target: {
          value: 'testData',
        },
      });

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'testData',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  // test.each([['text'], ['radio'], ['checkbox']])(
  //   'should register field for %s type',
  //   async (type) => {
  //     const mockListener = jest.spyOn(
  //       findRemovedFieldAndRemoveListener,
  //       'default',
  //     );
  //     jest.spyOn(HTMLInputElement.prototype, 'addEventListener');
  //
  //     const Component = () => {
  //       const {
  //         register,
  //         formState: { isDirty },
  //       } = useForm<{
  //         test: string;
  //       }>();
  //       return (
  //         <div>
  //           <input type={type} {...register('test')} />
  //           <span role="alert">{`${isDirty}`}</span>
  //         </div>
  //       );
  //     };
  //
  //     const { renderCount } = perf<{ Component: unknown }>(React);
  //
  //     render(<Component />);
  //
  //     const ref = screen.getByRole(type === 'text' ? 'textbox' : type);
  //
  //     expect(ref.addEventListener).toHaveBeenCalledWith(
  //       type === 'radio' || type === 'checkbox'
  //         ? EVENTS.CHANGE
  //         : EVENTS.INPUT,
  //       expect.any(Function),
  //     );
  //
  //     // check MutationObserver
  //     ref.remove();
  //
  //     await waitFor(() => expect(mockListener).toHaveBeenCalled());
  //     expect(screen.getByRole('alert').textContent).toBe('false');
  //     await wait(() =>
  //       expect(renderCount.current.Component).toBeRenderedTimes(2),
  //     );
  //   },
  // );

  test.each([['text'], ['radio'], ['checkbox']])(
    'should not register the same %s input',
    async (type) => {
      const callback = jest.fn();
      const Component = () => {
        const { register, handleSubmit } = useForm<{
          test: string;
        }>();
        return (
          <div>
            <input type={type} {...register('test')} />

            <button onClick={handleSubmit(callback)}>submit</button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /submit/ }));

      await waitFor(() =>
        expect(callback).toHaveBeenCalledWith(
          {
            test: type === 'checkbox' ? false : type === 'radio' ? null : '',
          },
          expect.any(Object),
        ),
      );
    },
  );

  it('should re-render if errors occurred with resolver when formState.isValid is defined', async () => {
    const resolver = async (data: any) => {
      return {
        values: data,
        errors: {
          test: {
            type: 'test',
          },
        },
      };
    };

    const Component = () => {
      const { register, formState } = useForm<{ test: string }>({
        resolver,
      });

      return (
        <div>
          <input {...register('test')} />
          <span role="alert">{`${formState.isValid}`}</span>
        </div>
      );
    };

    render(<Component />);

    expect(screen.getByRole('alert').textContent).toBe('false');
  });

  it('should be set default value when item is remounted again', async () => {
    const { result, unmount } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    result.current.setValue('test', 'test');

    unmount();

    const ref = { type: 'text', name: 'test' };

    result.current.register('test');

    expect(ref).toEqual({ type: 'text', name: 'test' });

    expect(result.current.getValues()).toEqual({ test: 'test' });
  });

  // issue: https://github.com/react-hook-form/react-hook-form/issues/2298
  it('should reset isValid formState after reset with valid value in initial render', async () => {
    const Component = () => {
      const { register, reset, formState } = useForm<{
        issue: string;
        test: string;
      }>({
        mode: VALIDATION_MODE.onChange,
      });

      React.useEffect(() => {
        setTimeout(() => {
          reset({ issue: 'test', test: 'test' });
        });
      }, [reset]);

      return (
        <div>
          <input {...register('test', { required: true })} />
          <input type="text" {...register('issue', { required: true })} />
          <button disabled={!formState.isValid}>submit</button>
        </div>
      );
    };

    await actComponent(async () => {
      render(<Component />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('register valueAs', () => {
    it('should return number value with valueAsNumber', async () => {
      let output = {};
      const Component = () => {
        const { register, handleSubmit } = useForm<{
          test: number;
          test1: boolean;
        }>();

        return (
          <form onSubmit={handleSubmit((data) => (output = data))}>
            <input {...register('test', { valueAsNumber: true })} />
            <input
              {...register('test1', {
                setValueAs: (value: string) => value === 'true',
              })}
            />
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: {
          value: '12345',
        },
      });

      fireEvent.input(screen.getAllByRole('textbox')[1], {
        target: {
          value: 'true',
        },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button'));
      });

      expect(output).toEqual({ test: 12345, test1: true });
    });
  });
});
