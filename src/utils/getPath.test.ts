import getPath from './getPath';

describe('getPath', () => {
  it('should render correctly', () => {
    expect(
      getPath('test', [
        1,
        [1, 2],
        {
          data: 'test',
          kidding: { test: 'data' },
          what: [{ bill: { haha: 'test' } }, [3, 4]],
        },
      ]),
    ).toEqual([
      'test[0]',
      'test[1][0]',
      'test[1][1]',
      'test[2].data',
      'test[2].kidding.test',
      'test[2].what[0].bill.haha',
      'test[2].what[1][0]',
      'test[2].what[1][1]',
    ]);
  });
});
