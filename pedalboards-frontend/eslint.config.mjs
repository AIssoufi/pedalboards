import js from '@eslint/js';
import { importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Files of the app, run in the browser
const APP_FILES = ['src/**/*.{js,jsx}'];
// Test files, which Vitest runs with its globals (describe, it, expect, vi)
const TEST_FILES = ['**/*.test.{js,jsx,mjs}'];
// Scripts and configuration files, run by Node.js
const NODE_FILES = ['scripts/**/*.mjs', '*.config.mjs'];

// Presets that only apply to the React code of the app
const REACT_PRESETS = [
  react.configs.flat.recommended,
  // React 19 needs no React import for JSX
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended
];

// The recommended presets of ESLint and of its React, hooks, accessibility and import plugins, in
// place of airbnb, which has no flat config (docs/decisions/0008-eslint-flat-config.md)
export default [
  { ignores: ['build/'] },
  js.configs.recommended,
  importX.flatConfigs.recommended,
  ...REACT_PRESETS.map(preset => ({ ...preset, files: APP_FILES })),
  {
    files: APP_FILES,
    languageOptions: { globals: globals.browser },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': { node: { extensions: ['.js', '.jsx'] } }
    },
    rules: {
      // An import cycle already broke a test suite, whose module was still undefined when it ran
      'import-x/no-cycle': 'error'
    }
  },
  {
    files: TEST_FILES,
    languageOptions: { globals: globals.vitest },
    rules: {
      // The small components that a test renders need no prop types
      'react/prop-types': 'off'
    }
  },
  {
    files: NODE_FILES,
    languageOptions: { globals: globals.node }
  }
];
