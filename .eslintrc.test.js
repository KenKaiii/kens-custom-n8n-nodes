module.exports = {
	env: {
		node: true,
		es2022: true,
	},
	globals: {
		console: 'readonly',
		process: 'readonly',
		require: 'readonly',
		module: 'readonly',
		__dirname: 'readonly',
		setTimeout: 'readonly',
		clearTimeout: 'readonly',
		Date: 'readonly',
		Object: 'readonly',
		JSON: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	rules: {
		'no-undef': 'error',
		'no-unused-vars': 'warn',
	},
};