import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Controller } from './index';

function reconfigureControl(changedControl = {}) {
  const defaultControl = {
    defaultValuesRef: {
      current: {},
    },
    fields: {},
    setValue: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn(),
    errors: {},
    mode: { isOnSubmit: false, isOnBlur: false },
    reValidateMode: {
      isReValidateOnBlur: false,
      isReValidateOnSubmit: false,
    },
    formState: {
      dirty: false,
      isSubmitted: false,
      submitCount: 0,
      touched: {},
      isSubmitting: false,
      isValid: false,
    },
    fieldsRef: {
      current: {},
    },
    resetFieldArrayFunctionRef: {
      current: {},
    },
    fieldArrayNamesRef: {
      current: new Set<string>(),
    },
    isDirtyRef: {
      current: false,
    },
  };

  return Object.assign({}, defaultControl, changedControl);
}

describe('Controller', () => {
  it('should render correctly with as with string', () => {
    const control = reconfigureControl();

    const { asFragment } = render(
      <Controller defaultValue="" name="test" as="input" control={control} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with as with component', () => {
    const control = reconfigureControl();

    const { asFragment } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input />}
        control={control}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: true, isOnBlur: false },
    });

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        control={control}
      />,
    );

    fireEvent.change(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it("should trigger component's onBlur method and invoke setValue method", () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: true, isOnBlur: true },
    });

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        control={control}
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it('should invoke custom event named method', () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: true, isOnBlur: true },
    });

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        onChangeName="onChange"
        control={control}
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it('should invoke custom onChange method', () => {
    const onChange = jest.fn();
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: false, isOnBlur: true },
    });

    onChange.mockImplementation(() => 'test');

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        onChange={onChange}
        control={control}
      />,
    );

    fireEvent.change(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalled();
    expect(onChange).toBeCalled();
  });

  it('should support default value from hook form', () => {
    const control = reconfigureControl({
      defaultValues: {
        test: 'data',
      },
    });

    const { asFragment } = render(
      <Controller defaultValue="" name="test" as="input" control={control} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should support custom value name', () => {
    const control = reconfigureControl();

    const { asFragment } = render(
      <Controller
        defaultValue=""
        name="test"
        as="input"
        valueName="selectedkey"
        control={control}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
