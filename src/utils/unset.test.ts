import unset from './unset';

test('should unset the object', () => {
  const test = {
    data: {
      firstName: 'test',
      clear: undefined,
      test: [{ data1: '' }, { data2: '' }],
      data: {
        test: undefined,
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  };

  expect(unset(test, ['data.firstName', 'data.test[0]'])).toEqual({
    data: {
      test: [undefined, { data2: '' }],
      clear: undefined,
      data: {
        test: undefined,
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  });
});

test('should unset multiple path', () => {
  const test = {
    data: {
      firstName: 'test',
      clear: undefined,
      quick: {
        test: undefined,
        what: 'test',
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  };

  expect(unset(test, ['data.firstName', 'data.quick.test1'])).toEqual({
    data: {
      quick: {
        what: 'test',
      },
    },
  });
});

test('should return empty object when inner object is empty object', () => {
  const test = {
    data: {
      firstName: {},
    },
  };

  expect(unset(test, ['data.firstName'])).toEqual({ data: {} });
});

test('should clear empty array', () => {
  const test = {
    data: {
      firstName: {
        test: [
          { name: undefined, email: undefined },
          { name: 'test', email: 'last' },
        ],
        deep: {
          last: [
            { name: undefined, email: undefined },
            { name: 'test', email: 'last' },
          ],
        },
      },
    },
  };

  expect(unset(test, ['data.firstName.test[0]'])).toEqual({
    data: {
      firstName: {
        test: [undefined, { name: 'test', email: 'last' }],
        deep: {
          last: [
            { name: undefined, email: undefined },
            { name: 'test', email: 'last' },
          ],
        },
      },
    },
  });

  const test2 = {
    arrayItem: [
      {
        test1: undefined,
        test2: undefined,
      },
    ],
    data: 'test',
  };

  expect(unset(test2, ['arrayItem[0].test1'])).toEqual({
    arrayItem: [
      {
        test2: undefined,
      },
    ],
    data: 'test',
  });
});

test('should only remove relevant data', () => {
  const data = {
    test: {},
    testing: {
      key1: 1,
      key2: [
        {
          key4: 4,
          key5: [],
          key6: null,
          key7: '',
          key8: undefined,
          key9: {},
        },
      ],
      key3: [],
    },
  };

  expect(unset(data, ['test'])).toEqual({
    testing: {
      key1: 1,
      key2: [
        {
          key4: 4,
          key5: [],
          key6: null,
          key7: '',
          key8: undefined,
          key9: {},
        },
      ],
      key3: [],
    },
  });
});
