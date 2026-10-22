'use strict';

const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const globals = require('globals');

module.exports = defineConfig(
  {
    ignores: ['build/**'],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      curly: ['error', 'multi-line'],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
);
