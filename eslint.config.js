import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**']
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', '*.config.ts'],
    languageOptions: {
      parser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: { '@typescript-eslint': typescript },
    rules: {
      'eqeqeq': ['error', 'always'],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
];
