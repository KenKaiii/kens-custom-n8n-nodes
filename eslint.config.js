/* eslint-disable */
const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

module.exports = [
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				project: './tsconfig.json',
			},
			globals: {
				require: 'readonly',
				console: 'readonly',
				process: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				URL: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				global: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_|^this$',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					args: 'after-used',
				},
			],
			'no-unused-vars': 'off', // Disabled in favor of @typescript-eslint/no-unused-vars
			'n8n-nodes-base/node-dirname-against-convention': 'error',
			'n8n-nodes-base/node-class-description-missing-subtitle': 'warn',
			'n8n-nodes-base/node-execute-block-wrong-error-thrown': 'error',
		},
		ignores: ['dist/', 'node_modules/', 'gulpfile.js'],
	},
];
