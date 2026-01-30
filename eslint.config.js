import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  // ✅ 1. GLOBAL ignores (must be first)
  {
    ignores: [
      '.serverless/**',
      'node_modules/**',
      'dist/**',
      'build/**',
    ],
  },

  // ✅ 2. Base JS rules
  js.configs.recommended,

  // ✅ 3. TypeScript rules
  ...tseslint.configs.recommended,

  // ✅ 4. Project-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      'prettier/prettier': 'error',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
