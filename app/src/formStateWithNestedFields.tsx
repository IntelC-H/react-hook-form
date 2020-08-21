import React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';

let renderCounter = 0;

const FormStateWithNestedFields: React.FC = (props: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors, ...rest },
    reset,
  } = useForm<{
    [topLevelKey: string]: {
      [nestedKey: number]: string;
    };
  }>({
    mode: props.match.params.mode,
  });

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Left</h4>
          <input
            name="left.1"
            ref={register({ required: true })}
            placeholder="firstName"
          />
          <input
            name="left.2"
            ref={register({ required: true })}
            placeholder="lastName"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Right</h4>
          <input
            name="right.1"
            ref={register({ required: false })}
            placeholder="firstName"
          />
          <input
            name="right.2"
            ref={register({ required: false })}
            placeholder="lastName"
          />
        </div>
      </div>
      <div id="state">
        {JSON.stringify({
          ...rest,
          touched: Object.keys(rest.touched).flatMap((topLevelKey) =>
            Object.keys(rest.touched[topLevelKey] || {}).map(
              (nestedKey) => `${topLevelKey}.${nestedKey}`,
            ),
          ),
          dirtyFields: Object.keys(rest.dirtyFields).flatMap((topLevelKey) =>
            Object.keys(rest.dirtyFields[topLevelKey] || {}).map(
              (nestedKey) => `${topLevelKey}.${nestedKey}`,
            ),
          ),
        })}
      </div>
      <button id="submit">Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default withRouter(FormStateWithNestedFields);
