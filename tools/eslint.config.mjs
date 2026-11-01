import js from '@eslint/js';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';

// Every file here is a Node.js module, tests included: they run with node --test
export default [
  js.configs.recommended,
  importX.flatConfigs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: { 'import-x/no-cycle': 'error' }
  }
];
