import * as React from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { render, fireEvent, wait } from '@testing-library/react-native';
import { useForm } from './useForm';
import * as focusOnErrorField from './logic/focusFieldBy';

describe('useForm with React Native', () => {
  it('should register field', () => {
    let control: any;
    const Component = () => {
      const { register, control: tempControl } = useForm<{
        test: string;
      }>();
      control = tempControl;
      return (
        <View>
          <TextInput {...register('test', { required: 'required' })} />
        </View>
      );
    };

    render(<Component />);

    expect(control.fieldsRef.current.test).toBeDefined();
  });

  it('should invoke focus with RN', async () => {
    const mockFocus = jest.spyOn(focusOnErrorField, 'default');
    const callback = jest.fn();

    const Component = () => {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<{
        test: string;
      }>();
      return (
        <View>
          <TextInput {...register('test', { required: true })} />
          <Text>{errors.test && 'required'}</Text>
          <Button title={'button'} onPress={handleSubmit(callback)} />
        </View>
      );
    };

    const { getByText } = render(<Component />);

    fireEvent.press(getByText('button'));

    await wait(() => expect(mockFocus).toHaveBeenCalled());
    expect(callback).not.toHaveBeenCalled();
    expect(getByText('required').props.children).toBe('required');
  });
});
