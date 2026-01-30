/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Pick up .spec.ts files
  testMatch: ['**/src/**/*.spec.ts'],
  setupFiles: ['<rootDir>/jest.setup.cjs'],

  // Treat TS files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Clear mocks between tests
  clearMocks: true,

  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/scripts/**/*.ts',
    '!src/**/app.ts',
    '!src/**/server.ts',
  ],

  coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},

  coverageDirectory: 'coverage',
};
