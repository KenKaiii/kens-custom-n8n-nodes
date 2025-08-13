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
			'../bundled-libraries': 'commonjs ../bundled-libraries',
			// Make all libraries external so they're loaded via require() at runtime
			'joi': 'commonjs joi',
			'lodash': 'commonjs lodash',
			'axios': 'commonjs axios',
			'dayjs': 'commonjs dayjs',
			'validator': 'commonjs validator',
			'uuid': 'commonjs uuid',
			'csv-parse': 'commonjs csv-parse',
			'xml2js': 'commonjs xml2js',
			'fast-xml-parser': 'commonjs fast-xml-parser',
			'yaml': 'commonjs yaml',
			'handlebars': 'commonjs handlebars',
			'crypto-js': 'commonjs crypto-js',
			'node-forge': 'commonjs node-forge',
			'jsonwebtoken': 'commonjs jsonwebtoken',
			'xlsx': 'commonjs xlsx',
			'pdf-lib': 'commonjs pdf-lib',
			'archiver': 'commonjs archiver',
			'jimp': 'commonjs jimp',
			'qrcode': 'commonjs qrcode',
			'mathjs': 'commonjs mathjs',
			'natural': 'commonjs natural',
			'fuse.js': 'commonjs fuse.js',
			'sharp': 'commonjs sharp',
			'puppeteer-core': 'commonjs puppeteer-core',
			'bcrypt': 'commonjs bcrypt',
			'currency.js': 'commonjs currency.js',
			'libphonenumber-js': 'commonjs libphonenumber-js',
			'iban': 'commonjs iban',
			'ethers': 'commonjs ethers',
			'web3': 'commonjs web3',
			'cheerio': 'commonjs cheerio',
			'moment-timezone': 'commonjs moment-timezone',
		},
		resolve: {
			extensions: ['.js', '.ts'],
		},
		module: {
			parser: {
				javascript: {
					commonjsMagicComments: true,
				},
			},
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
