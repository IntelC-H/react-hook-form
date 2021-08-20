import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import * as generateId from '../logic/generateId';
import {
  Control,
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormReturn,
} from '../types';
import { useController } from '../useController';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';
import { useWatch } from '../useWatch';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

describe('useWatch', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  afterEach(() => {
    (generateId.default as jest.Mock<any>).mockRestore();
  });

  it('should return default value in useForm', () => {
    let method: any;
    let watched: any;
    const Component = () => {
      method = useForm<{ test: string }>({ defaultValues: { test: 'test' } });
      watched = useWatch({ control: method.control });
      return <div />;
    };
    render(<Component />);

    expect(watched).toEqual({ test: 'test' });
  });

  it('should return default value in useWatch', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>({
        defaultValues: {
          test: 'test',
        },
      });
      return useWatch({
        control,
        name: 'test',
      });
    });

    expect(result.current).toEqual('test');
  });

  it('should return default value for single input', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      });
      return useWatch({
        control,
        name: 'test',
      });
    });

    expect(result.current).toEqual('test');
  });

  it('should return default values for array of inputs', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      });
      return useWatch({
        control,
        name: ['test', 'test1'],
      });
    });

    expect(result.current).toEqual(['test', 'test1']);
  });

  it('should return default value when name is undefined', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string; test1: string }>({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      });
      return useWatch({
        control,
      });
    });

    expect(result.current).toEqual({ test: 'test', test1: 'test1' });
  });

  it('should return empty array when watch array fields', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>();
      return useWatch({
        control,
        name: ['test'],
      });
    });

    expect(result.current).toEqual([undefined]);
  });

  it('should return undefined', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{ test: string }>();
      return useWatch({
        control,
        name: 'test',
      });
    });

    expect(result.current).toBeUndefined();
  });

  it('should render with FormProvider', () => {
    const Provider: React.FC = ({ children }) => {
      const methods = useForm<{ test: string }>();
      return <FormProvider {...methods}>{children}</FormProvider>;
    };
    const { result } = renderHook(() => useWatch({ name: 'test' }), {
      wrapper: Provider,
    });
    expect(result.error).toBeUndefined();
  });

  it('should remove input with shouldUnregister: true and deeply nested', async () => {
    type FormValue = {
      test: string;
    };

    let submitData = {};

    const Child = ({
      control,
      register,
    }: {
      register: UseFormRegister<FormValue>;
      control: Control<FormValue>;
    }) => {
      const show = useWatch({
        control,
        name: 'test',
      });

      return <>{show && show !== 'test' && <input {...register('test')} />}</>;
    };

    const Component = () => {
      const { register, control, handleSubmit } = useForm<FormValue>({
        defaultValues: {
          test: 'bill',
        },
        shouldUnregister: true,
      });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            submitData = data;
          })}
        >
          <Child control={control} register={register} />
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' },
      });
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(submitData).toEqual({});
  });

  describe('when disabled prop is used', () => {
    it('should be able to disabled subscription and started with true', async () => {
      type FormValues = {
        test: string;
      };

      const ChildComponent = ({
        control,
      }: {
        control: Control<FormValues>;
      }) => {
        const [disabled, setDisabled] = React.useState(true);
        const test = useWatch({
          control,
          name: 'test',
          disabled,
        });

        return (
          <div>
            <p>{test}</p>
            <button
              onClick={() => {
                setDisabled(!disabled);
              }}
              type={'button'}
            >
              toggle
            </button>
          </div>
        );
      };

      const App = () => {
        const { register, control } = useForm<FormValues>({
          defaultValues: {
            test: 'test',
          },
        });

        return (
          <div>
            <input {...register('test')} />
            <ChildComponent control={control} />
          </div>
        );
      };

      render(<App />);

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'what',
          },
        });
      });

      screen.getByText('test');

      fireEvent.click(screen.getByRole('button'));

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'what12345',
          },
        });
      });

      screen.getByText('what12345');

      fireEvent.click(screen.getByRole('button'));

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: '12345',
          },
        });
      });

      screen.getByText('what12345');
    });

    it('should be able to toggle the subscription and started with false', async () => {
      type FormValues = {
        test: string;
      };

      const ChildComponent = ({
        control,
      }: {
        control: Control<FormValues>;
      }) => {
        const [disabled, setDisabled] = React.useState(false);
        const test = useWatch({
          control,
          name: 'test',
          disabled,
        });

        return (
          <div>
            <p>{test}</p>
            <button
              onClick={() => {
                setDisabled(!disabled);
              }}
              type={'button'}
            >
              toggle
            </button>
          </div>
        );
      };

      const WatchApp = () => {
        const { register, control } = useForm<FormValues>({
          defaultValues: {
            test: 'test',
          },
        });

        return (
          <div>
            <input {...register('test')} />
            <ChildComponent control={control} />
          </div>
        );
      };

      render(<WatchApp />);

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'what',
          },
        });
      });

      screen.getByText('what');

      fireEvent.click(screen.getByRole('button'));

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'what12345',
          },
        });
      });

      screen.getByText('what');
    });
  });

  describe('update', () => {
    it('should partial re-render', async () => {
      type FormInputs = {
        child: string;
        parent: string;
      };

      const Child = ({
        register,
        control,
      }: Pick<UseFormReturn<FormInputs>, 'register' | 'control'>) => {
        useWatch({ name: 'child', control });
        return <input {...register('child')} />;
      };

      const Parent = () => {
        const {
          register,
          handleSubmit,
          control,
          formState: { errors },
        } = useForm<FormInputs>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('parent')} />
            <Child register={register} control={control} />
            {errors.parent}
            <button>submit</button>
          </form>
        );
      };

      render(<Parent />);

      const childInput = screen.getAllByRole('textbox')[1];

      fireEvent.input(childInput, {
        target: { value: 'test' },
      });

      await actComponent(async () => {
        await fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
      });

      await actComponent(async () => {
        await fireEvent.input(childInput, { target: { value: 'test1' } });
      });
    });

    it('should only subscribe change at useWatch level instead of useForm', () => {
      type FormValues = {
        test: string;
        test1: string;
        test2: string;
      };

      let parentRenderCount = 0;
      let childRenderCount = 0;

      const Test = ({ control }: { control: Control<FormValues> }) => {
        useWatch({
          control,
        });

        childRenderCount++;

        return <div>test</div>;
      };

      const Component = () => {
        const { control, register } = useForm<FormValues>();

        parentRenderCount++;

        return (
          <div>
            <Test control={control} />
            <input {...register('test')} />
            <input {...register('test1')} />
            <input {...register('test2')} />
          </div>
        );
      };

      render(<Component />);

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: '1234',
        },
      });

      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: {
          value: '1234',
        },
      });

      fireEvent.change(screen.getAllByRole('textbox')[2], {
        target: {
          value: '1234',
        },
      });

      expect(parentRenderCount).toEqual(1);
      expect(childRenderCount).toEqual(4);
    });

    it("should not re-render external component when field name don't match", async () => {
      type FormInputs = { test1: string; test2: string };

      const Child = ({ control }: { control: Control<FormInputs> }) => {
        useWatch({ name: 'test2', control });

        return <div />;
      };

      const Parent = () => {
        const { register, control } = useForm<FormInputs>();
        useWatch({ name: 'test1', control });

        return (
          <form>
            <input {...register('test1')} />
            <input {...register('test2')} />
            <Child control={control} />
          </form>
        );
      };

      render(<Parent />);

      fireEvent.input(screen.getAllByRole('textbox')[1], {
        target: {
          name: 'test2',
          value: 'value',
        },
      });
    });

    it('should not throw error when null or undefined is set', () => {
      const watchedValue: Record<string, any> = {};
      const Component = () => {
        const { register, control } = useForm<{
          test: string;
          test1: string;
        }>();

        register('test');
        register('test1');

        watchedValue['test'] = useWatch({ name: 'test', control });
        watchedValue['test1'] = useWatch({ name: 'test1', control });

        return <div />;
      };

      render(<Component />);

      expect(watchedValue).toEqual({ test: undefined, test1: undefined });
    });

    it('should return undefined when input gets unregistered', async () => {
      const Component = () => {
        const { register, control, unregister } = useForm<{ test: number }>();
        const [show, setShow] = React.useState(true);
        const data: any = useWatch({ name: 'test', control });

        return (
          <>
            {show && <input {...register('test')} />}
            <span>{data}</span>
            <button
              type="button"
              onClick={() => {
                unregister('test');
                setShow(false);
              }}
            >
              hide
            </button>
          </>
        );
      };

      render(<Component />);

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      screen.getByText('test');

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByText('test')).toBeNull();
    });

    it('should return undefined when input get unregistered', () => {
      type FormValues = {
        test: string;
      };

      const Test = ({ control }: { control: Control<FormValues> }) => {
        const value = useWatch({
          control,
          name: 'test',
        });

        return <div>{value === undefined ? 'yes' : 'no'}</div>;
      };

      const Component = () => {
        const { register, control, unregister } = useForm<FormValues>({
          defaultValues: {
            test: 'test',
          },
        });

        React.useEffect(() => {
          register('test');
        }, [register]);

        return (
          <>
            <Test control={control} />
            <button onClick={() => unregister('test')}>unregister</button>
          </>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button'));

      screen.getByText('yes');
    });
  });

  describe('fieldArray', () => {
    it('should watch correct input update with single field array input', () => {
      const inputValues: string[] = [];

      type FormValues = {
        labels: {
          displayName: string;
          internalName: string;
        }[];
      };

      function Item({
        control,
        register,
        itemIndex,
        remove,
      }: {
        control: Control<FormValues>;
        register: UseFormReturn<FormValues>['register'];
        remove: UseFieldArrayReturn['remove'];
        itemIndex: number;
      }) {
        const actualValue = useWatch({
          control,
          name: `labels.${itemIndex}.displayName` as const,
        });
        inputValues.push(actualValue);

        return (
          <div>
            <input
              {...register(`labels.${itemIndex}.displayName` as const)}
              defaultValue={actualValue}
            />
            <button type="button" onClick={() => remove(itemIndex)}>
              Remove
            </button>
          </div>
        );
      }

      const Component = () => {
        const { control, register } = useForm<FormValues>({
          defaultValues: {
            labels: [
              {
                displayName: 'Type',
                internalName: 'type',
              },
              {
                displayName: 'Number',
                internalName: 'number',
              },
              {
                displayName: 'Totals',
                internalName: 'totals',
              },
            ],
          },
        });

        const { fields, remove } = useFieldArray({
          control,
          name: 'labels',
        });

        return (
          <form>
            {fields.map((item, itemIndex) => (
              <Item
                key={item.id}
                control={control}
                register={register}
                itemIndex={itemIndex}
                remove={remove}
              />
            ))}
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getAllByRole('button')[1]);

      expect(inputValues).toEqual([
        'Type',
        'Number',
        'Totals',
        'Type',
        'Totals',
      ]);
    });

    it('should return shallow merged watch values', () => {
      const watchedValue: unknown[] = [];

      function App() {
        const methods = useForm({
          defaultValues: {
            name: 'foo',
            arr: [],
          },
          mode: 'onSubmit',
          reValidateMode: 'onChange',
          criteriaMode: 'all',
          shouldUnregister: false,
        });

        return (
          <FormProvider {...methods}>
            <input {...methods.register('name')} placeholder="First Name" />
            <Preview />
            <FieldArray />
            <input type="submit" />
          </FormProvider>
        );
      }

      function Preview() {
        const form = useWatch({});
        watchedValue.push(form);

        return null;
      }

      function FieldArray() {
        useFieldArray({
          name: 'arr',
          shouldUnregister: false,
        });

        return null;
      }

      render(<App />);

      expect(watchedValue).toMatchSnapshot();
    });
  });

  describe('fieldArray with shouldUnregister true', () => {
    it('should watch correct input update with single field array input', () => {
      const watchData: unknown[] = [];

      type Unpacked<T> = T extends (infer U)[] ? U : T;

      type FormValues = {
        items: { prop: string }[];
      };

      function App() {
        const rhfProps = useForm<FormValues>({
          defaultValues: {
            items: [{ prop: 'test' }, { prop: 'test1' }],
          },
          shouldUnregister: true,
        });
        const { control } = rhfProps;

        const { fields, insert, remove } = useFieldArray({
          control,
          name: 'items',
        });

        return (
          <form>
            {fields.map((item, index, items) => {
              return (
                <div key={item.id}>
                  <Child
                    control={control}
                    index={index}
                    itemDefault={item}
                    itemsDefault={items}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      insert(index + 1, { prop: 'ShouldBeTHere' });
                    }}
                  >
                    insert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    remove
                  </button>
                </div>
              );
            })}
            <input type="submit" />
          </form>
        );
      }

      function Child({
        index,
        itemDefault,
        itemsDefault,
        control,
      }: {
        index: number;
        itemDefault: Unpacked<FormValues['items']>;
        itemsDefault: FormValues['items'];
        control: Control<FormValues>;
      }) {
        const useWatchedItems = useWatch({
          name: 'items',
          control,
          defaultValue: itemsDefault,
        });

        watchData.push(useWatchedItems);

        const { field } = useController({
          name: `items.${index}.prop` as const,
          control,
          defaultValue: itemDefault.prop,
        });

        return <input {...field} />;
      }

      render(<App />);

      fireEvent.click(screen.getAllByRole('button', { name: 'insert' })[0]);

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);

      expect(watchData).toMatchSnapshot();
    });
  });

  describe('reset', () => {
    it('should return updated default value with watched field after reset', async () => {
      type FormValues = {
        test: string;
        name: string;
      };

      function Watcher({ control }: { control: Control<FormValues> }) {
        const testField = useWatch<FormValues>({
          name: 'test',
          control: control,
        });

        return <div>{testField}</div>;
      }

      function Component() {
        const { reset, control } = useForm<FormValues>({
          defaultValues: {
            test: '',
            name: '',
          },
        });

        React.useEffect(() => {
          reset({
            test: 'test',
          });
        }, [reset]);

        return <Watcher control={control} />;
      }

      render(<Component />);

      await waitFor(() => screen.getByText('test'));
    });

    it('should return default value of reset method', async () => {
      const Component = () => {
        const { register, reset, control } = useForm<{
          test: string;
        }>();
        const test = useWatch<{
          test: string;
        }>({ name: 'test', control });

        React.useEffect(() => {
          reset({ test: 'default' });
        }, [reset]);

        return (
          <form>
            <input {...register('test')} />
            <span>{test}</span>
          </form>
        );
      };

      render(<Component />);

      expect(await screen.findByText('default')).toBeDefined();
    });

    it('should re-register watched input after reset', async () => {
      type FormValues = {
        firstName: string;
      };

      function LivePreview({ control }: { control: Control<FormValues> }) {
        const value = useWatch({
          name: `firstName`,
          defaultValue: 'yes',
          control,
        });

        return <p>{value}</p>;
      }

      const Component = () => {
        const formMethods = useForm<FormValues>();
        const { control, reset, register } = formMethods;

        React.useEffect(() => {
          reset({
            firstName: 'firstName',
          });
        }, [reset]);

        return (
          <>
            <input {...register('firstName')} />

            <LivePreview control={control} />
          </>
        );
      };

      render(<Component />);

      screen.getByText('firstName');

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: { value: '123' },
        });
      });

      screen.getByText('123');
    });

    describe('with useFieldArray', () => {
      // issue: https://github.com/react-hook-form/react-hook-form/issues/2229
      it('should return current value with radio type', async () => {
        type FormValues = {
          options: { option: string }[];
        };

        const watchedValue: object[] = [];

        const Test = ({ control }: { control: Control<FormValues> }) => {
          watchedValue.push(
            useWatch({
              control,
            }),
          );

          return null;
        };

        const Component = () => {
          const { register, reset, control } = useForm<FormValues>();
          const { fields } = useFieldArray({ name: 'options', control });

          React.useEffect(() => {
            reset({
              options: [
                {
                  option: 'yes',
                },
                {
                  option: 'yes',
                },
              ],
            });
          }, [reset]);

          return (
            <form>
              {fields.map((_, i) => (
                <div key={i.toString()}>
                  <input
                    type="radio"
                    value="yes"
                    {...register(`options.${i}.option` as const)}
                  />
                  <input
                    type="radio"
                    value="no"
                    {...register(`options.${i}.option` as const)}
                  />
                  <Test control={control} />
                </div>
              ))}
            </form>
          );
        };

        render(<Component />);

        fireEvent.change(screen.getAllByRole('radio')[1], {
          target: {
            value: 'yes',
            checked: true,
          },
        });

        expect(watchedValue).toMatchSnapshot();
      });

      it("should watch item correctly with useFieldArray's remove method", async () => {
        let watchedValue: { [x: string]: any } | undefined;
        const Component = () => {
          const { register, control } = useForm<{
            test: {
              firstName: string;
              lsatName: string;
            }[];
          }>({
            defaultValues: {
              test: [{ firstName: 'test' }, { firstName: 'test1' }],
            },
          });
          const { fields, remove } = useFieldArray({
            name: 'test',
            control,
          });
          watchedValue = useWatch({
            name: 'test',
            control,
          });

          return (
            <form>
              {fields.map((item, i) => (
                <div key={item.firstName}>
                  <input
                    type="input"
                    defaultValue={item.firstName}
                    {...register(`test.${i}.firstName` as const)}
                  />

                  <button type="button" onClick={() => remove(i)}>
                    remove
                  </button>
                </div>
              ))}
            </form>
          );
        };

        render(<Component />);

        expect(watchedValue).toEqual([
          { firstName: 'test' },
          { firstName: 'test1' },
        ]);

        fireEvent.click(screen.getAllByRole('button')[0]);

        expect(watchedValue).toEqual([{ firstName: 'test1' }]);
      });
    });

    describe('with custom register', () => {
      it('should return default value of reset method when value is not empty', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{
            test: string;
          }>();
          const test = useWatch<{
            test: string;
          }>({
            name: 'test',
            control,
          });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default1' });
          }, [reset]);

          return (
            <form>
              <input {...register('test')} />
              <span data-testid="result">{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect((await screen.findByTestId('result')).textContent).toBe(
          'default1',
        );
      });

      it('should return default value of reset method', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{
            test: string;
          }>();
          const test = useWatch<{
            test: string;
          }>({ name: 'test', control });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default' });
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('default')).toBeDefined();
      });

      it('should return default value', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{ test: string }>({
            defaultValues: {
              test: 'test',
            },
          });
          const test = useWatch<{ test: string }>({
            name: 'test',
            control,
          });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset();
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('test')).toBeDefined();
      });
    });
  });

  describe('unregister', () => {
    it('should return correct value after input get unregistered', async () => {
      type FormValues = { test: string };

      const Component = ({ control }: { control: Control<FormValues> }) => {
        const test = useWatch<{ test: string }>({ name: 'test', control });
        return <div>{test === undefined ? 'no' : test}</div>;
      };

      const Form = () => {
        const { control, unregister, register } = useForm<FormValues>({
          defaultValues: { test: 'test' },
        });

        return (
          <>
            <Component control={control} />
            <input {...register('test')} />
            <button onClick={() => unregister('test')}>unregister</button>
          </>
        );
      };

      render(<Form />);

      screen.getByText('test');

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('no');
    });
  });

  describe('setValue', () => {
    it('should return correct value after input get unregistered', async () => {
      type FormValues = { test: string };

      const Child = ({ register }: UseFormReturn<FormValues>) => {
        return <input {...register('test')} />;
      };

      const Component = ({ control }: { control: Control<FormValues> }) => {
        const test = useWatch<{ test: string }>({ name: 'test', control });
        return <div>{test === 'bill' ? 'no' : test}</div>;
      };

      const Form = () => {
        const methods = useForm<FormValues>({
          defaultValues: { test: 'test' },
        });

        React.useEffect(() => {
          methods.setValue('test', 'bill');
        }, [methods]);

        return (
          <>
            <Component control={methods.control} />
            <Child {...methods} />
          </>
        );
      };

      render(<Form />);

      await waitFor(async () => screen.getByText('no'));
    });

    it('should watch nested object field update', () => {
      interface FormData {
        one: {
          two: {
            dep: number;
          };
        };
      }

      const Component1 = () => {
        const watchedDep = useWatch({ name: 'one.two.dep' });
        return <p>{watchedDep}</p>;
      };

      const Component2 = () => {
        const { register, setValue } = useFormContext<FormData>();
        const field = register('one.two.dep');

        return (
          <>
            <input {...field} />
            <button
              onClick={() => {
                setValue('one.two', { dep: 333 });
              }}
            >
              set deep
            </button>
          </>
        );
      };

      const Component: React.FC = () => {
        const form = useForm<FormData>({
          defaultValues: {
            one: {
              two: {
                dep: 111,
              },
            },
          },
        });

        return (
          <>
            <FormProvider {...form}>
              <Component1 />
              <Component2 />
            </FormProvider>
          </>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button'));

      screen.getByText('333');

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '333',
      );
    });
  });

  describe('formContext', () => {
    it('should work with form context', async () => {
      const Component = () => {
        const test = useWatch<{ test: string }>({ name: 'test' });
        return <div>{test}</div>;
      };

      const Form = () => {
        const methods = useForm<{ test: string }>({
          defaultValues: { test: 'test' },
        });

        return (
          <FormProvider {...methods}>
            <Component />
          </FormProvider>
        );
      };

      render(<Form />);

      expect(await screen.findByText('test')).toBeDefined();
    });
  });
});
