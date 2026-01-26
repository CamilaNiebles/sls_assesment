/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Pick up .spec.ts files
  testMatch: ['**/*.spec.ts'],

  // Treat TS files as ESM
  extensionsToTreatAsEsm: ['.ts'],

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
