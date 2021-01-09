import getRadioValue from './getRadioValue';

describe('getRadioValue', () => {
  it('should return default value if not valid or empty options', () => {
    expect(getRadioValue(undefined)).toEqual({
      isValid: false,
      value: '',
    });
  });

  it('should return valid to true when value found', () => {
    expect(
      getRadioValue([
        { name: 'bill', checked: false, value: '1' } as HTMLInputElement,
        { name: 'bill', checked: true, value: '2' } as HTMLInputElement,
      ]),
    ).toEqual({
      isValid: true,
      value: '2',
    });
  });
});
