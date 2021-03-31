import * as React from 'react';
import { Controller } from './controller';
import { useForm } from './useForm';
import { renderToString } from 'react-dom/server';

describe('Controller with SSR', () => {
  // issue: https://github.com/react-hook-form/react-hook-form/issues/1398
  it('should render correctly with as with component', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
      }>();

      return (
        <Controller
          defaultValue="default"
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(<Component />);

    expect(console.error).not.toHaveBeenCalled();
  });
});
