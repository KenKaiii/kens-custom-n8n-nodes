const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

module.exports = [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				Date: 'readonly',
				Object: 'readonly',
				JSON: 'readonly',
				Buffer: 'readonly',
				global: 'readonly',
				URL: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			// TypeScript-specific rules
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-inferrable-types': 'warn',

			// n8n-specific rules
			'n8n-nodes-base/node-class-description-empty-string': 'error',
			'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
			'n8n-nodes-base/node-class-description-missing-subtitle': 'warn',
			'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'warn',
			'n8n-nodes-base/node-param-default-missing': 'warn',
			'n8n-nodes-base/node-param-description-empty-string': 'error',
			'n8n-nodes-base/node-param-name-untrimmed': 'error',
			'n8n-nodes-base/node-param-type-options-missing-from-limit': 'error',

			// General JavaScript rules
			'no-undef': 'error',
			'no-console': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				Date: 'readonly',
				Object: 'readonly',
				JSON: 'readonly',
				Buffer: 'readonly',
				global: 'readonly',
				URL: 'readonly',
			},
		},
		rules: {
			'no-undef': 'error',
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-console': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		// Ignore patterns
		ignores: ['node_modules/**', 'dist/**', '*.min.js', 'webpack.*.js', 'gulpfile.cjs'],
	},
];
