/* eslint-disable no-undef */
const path = require('path');

module.exports = [
	{
		name: 'BundledLibraries',
		target: 'node',
		mode: 'production',
		entry: './bundled-libraries-simplified.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'bundled-libraries.js',
			libraryTarget: 'commonjs2',
		},
		resolve: {
			extensions: ['.js', '.ts'],
		},
		externals: {
			// Native modules that should be external
			canvas: 'commonjs canvas',
			sharp: 'commonjs sharp',
			bcrypt: 'commonjs bcrypt',
			'puppeteer-core': 'commonjs puppeteer-core',
			natural: 'commonjs natural',
			knex: 'commonjs knex',
			sqlite3: 'commonjs sqlite3',
			mysql: 'commonjs mysql',
			mysql2: 'commonjs mysql2',
			pg: 'commonjs pg',
			oracledb: 'commonjs oracledb',
			mssql: 'commonjs mssql',
			'better-sqlite3': 'commonjs better-sqlite3',
			tedious: 'commonjs tedious',
		},
		optimization: {
			minimize: false,
		},
	},
	{
		name: 'SuperCodeNode',
		target: 'node',
		mode: 'production',
		entry: './dist/SuperCodeNode/SuperCodeNode.node.js',
		output: {
			path: path.resolve(__dirname, 'dist/SuperCodeNode'),
			filename: 'SuperCodeNode.node.bundled.js',
			libraryTarget: 'commonjs2',
		},
		externals: {
			'n8n-workflow': 'n8n-workflow',
		},
		resolve: {
			extensions: ['.js', '.ts'],
		},
		optimization: {
			minimize: false,
		},
	},
	{
		name: 'SuperCodeTool',
		target: 'node',
		mode: 'production',
		entry: './dist/SuperCodeTool/SuperCodeTool.node.js',
		output: {
			path: path.resolve(__dirname, 'dist/SuperCodeTool'),
			filename: 'SuperCodeTool.node.bundled.js',
			libraryTarget: 'commonjs2',
		},
		externals: {
			'n8n-workflow': 'n8n-workflow',
		},
		resolve: {
			extensions: ['.js', '.ts'],
		},
		optimization: {
			minimize: false,
		},
	},
];
