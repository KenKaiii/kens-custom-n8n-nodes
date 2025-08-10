import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
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
		},
		plugins: {
			'@typescript-eslint': typescript,
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'n8n-nodes-base/node-dirname-against-convention': 'error',
			'n8n-nodes-base/node-class-description-missing-subtitle': 'warn',
			'n8n-nodes-base/node-execute-block-wrong-error-thrown': 'error',
		},
		ignores: ['dist/', 'node_modules/', 'gulpfile.js'],
	},
];