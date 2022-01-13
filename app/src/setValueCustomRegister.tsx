import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

let renderCounter = 0;

const SetValueCustomRegister: React.FC = () => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { touchedFields, isDirty, errors },
  } = useForm<{
    firstName: string;
    lastName: string;
  }>();

  useEffect(() => {
    register('firstName', { required: true });
    register('lastName', { required: true });
  }, [register]);

  renderCounter++;

  console.log(errors);

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <button
        id="TriggerDirty"
        type="button"
        onClick={() => setValue('lastName', 'test', { dirty: true })}
      >
        TriggerDirty
      </button>
      <button
        id="TriggerNothing"
        type="button"
        onClick={() => setValue('firstName', '', { dirty: true })}
      >
        TriggerNothing
      </button>
      <button
        id="WithError"
        type="button"
        onClick={() =>
          setValue('firstName', '', { validate: true, dirty: true })
        }
      >
        WithError
      </button>
      <button
        id="WithoutError"
        type="button"
        onClick={() =>
          setValue('firstName', 'true', {
            validate: true,
            dirty: true,
          })
        }
      >
        WithOutError
      </button>

      <div id="dirty">{isDirty.toString()}</div>
      <div id="touched">{Object.keys(touchedFields).map((touch) => touch)}</div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValueCustomRegister;
