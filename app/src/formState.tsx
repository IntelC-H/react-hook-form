import React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';
import { ValidationMode } from '../../src/types';

let renderCounter = 0;

const FormState = (props: {
  match: {
    params: {
      mode: keyof ValidationMode;
    };
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, ...rest },
    reset,
  } = useForm<{
    firstName: string;
    lastName: string;
    select: string;
    radio: string;
    checkbox: boolean;
    ['checkbox-checked']: boolean;
  }>({
    mode: props.match.params.mode,
    defaultValues: {
      firstName: '',
      lastName: '',
      select: '',
      checkbox: false,
      radio: '',
      'checkbox-checked': true,
    },
  });

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        name="firstName"
        ref={register({ required: true })}
        placeholder="firstName"
      />
      <input
        name="lastName"
        ref={register({ required: true })}
        placeholder="lastName"
      />
      <div id="state">
        {JSON.stringify({
          ...rest,
          touched: Object.keys(rest.touched),
          dirtyFields: Object.keys(rest.dirtyFields),
        })}
      </div>
      <select name="select" ref={register} defaultValue="test">
        <option value="">Select</option>
        <option value="test">test</option>
        <option value="test1">test1</option>
        <option value="test2">test3</option>
      </select>

      <input type="radio" name="radio" ref={register} />

      <input type="checkbox" name="checkbox" ref={register} />
      <input
        type="checkbox"
        name="checkbox-checked"
        defaultChecked
        ref={register}
      />
      <button id="submit">Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default withRouter(FormState);
