/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Pick up .spec.ts files
  testMatch: ['**/src/**/*.spec.ts'],

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
    '!src/**/app.ts',
    '!src/**/server.ts',
  ],

  coverageDirectory: 'coverage',
};
