import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

let renderCount = 0;

const WatchUseFieldArray: React.FC = (props: any) => {
  const { control, handleSubmit, reset, watch, register } = useForm<{
    data: { name: string }[];
  }>({
    ...(props.match.params.mode === 'default'
      ? {
          defaultValues: {
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          },
        }
      : {}),
    mode: props.match.params.mode === 'formState' ? 'onChange' : 'onSubmit',
  });
  const {
    fields,
    append,
    prepend,
    swap,
    move,
    insert,
    remove,
  } = useFieldArray<{ name: string }>({
    control,
    name: 'data',
  });
  const onSubmit = () => {};
  const watchAll = watch('data');

  React.useEffect(() => {
    setTimeout(() => {
      if (props.match.params.mode === 'asyncReset') {
        reset({
          data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
        });
      }
    }, 10);
  }, [reset, props.match.params.mode]);

  renderCount++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ul>
        {fields.map((data, index) => (
          <li key={data.id}>
            <input
              id={`field${index}`}
              name={`data[${index}].name`}
              defaultValue={data.name}
              data-order={index}
              ref={register()}
            />
            <button id={`delete${index}`} onClick={() => remove(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        id="append"
        type="button"
        onClick={() => append({ name: renderCount.toString() })}
      >
        append
      </button>

      <button
        id="prepend"
        type="button"
        onClick={() => prepend({ name: renderCount.toString() })}
      >
        prepend
      </button>

      <button id="swap" onClick={() => swap(1, 2)} type="button">
        swap
      </button>

      <button id="move" onClick={() => move(2, 0)} type="button">
        move
      </button>

      <button
        id="insert"
        type="button"
        onClick={() => insert(1, { name: renderCount.toString() })}
      >
        insert
      </button>

      <button id="remove" type="button" onClick={() => remove(1)}>
        remove
      </button>

      <button id="removeAll" type="button" onClick={() => remove()}>
        remove all
      </button>

      <div id="renderCount">{renderCount}</div>
      <div id="result">{JSON.stringify(watchAll)}</div>
    </form>
  );
};

export default WatchUseFieldArray;
