import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-tn/**', '.angular/**', '.vite/**'] },
  {
    files: ['src/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-max-inline-declarations': ['error', { template: 0, styles: 0 }],
    },
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
