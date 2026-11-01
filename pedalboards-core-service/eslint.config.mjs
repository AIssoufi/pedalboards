import js from '@eslint/js';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';

// The modules that only the Workers runtime knows, so that no resolver finds them on disk
const WORKERS_RUNTIME_MODULES = '^cloudflare:';

// The same presets as the frontend, without React (docs/decisions/0008-eslint-flat-config.md)
export default [
	{ ignores: ['dist/', '.wrangler/'] },
	js.configs.recommended,
	importX.flatConfigs.recommended,
	{
		rules: {
			// Deprecated by ESLint, but the only rule of its core that keeps the tabs of this package
			indent: ['error', 'tab', { SwitchCase: 1 }],
			'import-x/no-cycle': 'error',
			'import-x/no-unresolved': ['error', { ignore: [WORKERS_RUNTIME_MODULES] }]
		}
	},
	{
		files: ['src/**/*.js', 'test/**/*.js'],
		languageOptions: { globals: globals.worker }
	},
	{
		files: ['**/*.test.js'],
		languageOptions: { globals: globals.vitest }
	},
	{
		files: ['scripts/**/*.js', '*.config.js'],
		languageOptions: { globals: globals.node }
	}
];
