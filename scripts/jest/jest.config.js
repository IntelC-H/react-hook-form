const jestDefaultConfig = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  rootDir: '.',
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
};

const web = {
  ...jestDefaultConfig,
  displayName: {
    name: 'Web',
    color: 'cyan',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/scripts/jest/setup.ts'],
  testEnvironment: 'jsdom',
};

const server = {
  ...jestDefaultConfig,
  displayName: {
    name: 'Server',
    color: 'blue',
  },
  testMatch: ['**/+([a-zA-Z]).server.(spec|test).ts?(x)'],
  testEnvironment: 'node',
};

const native = {
  ...jestDefaultConfig,
  displayName: {
    name: 'React Native',
    color: 'magenta',
  },
  preset: 'react-native',
  testMatch: ['**/+([a-zA-Z]).native.(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(@react-native|react-native)[/\\\\])',
  ],
  setupFilesAfterEnv: ['<rootDir>/scripts/jest/setup.native.ts'],
};

const getProjects = () => {
  const testEnv = process.env.TEST_ENV;
  if (!testEnv) {
    return [web, server, native];
  }

  switch (testEnv) {
    case 'web':
      return [web];
    case 'server':
      return [server];
    case 'native':
      return [native];
  }
};

module.exports = {
  collectCoverageFrom: [
    '**/**/*.{ts,tsx}',
    '!**/**/*.test.{ts,tsx}',
    '!**/src/types/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  projects: getProjects(),
};
