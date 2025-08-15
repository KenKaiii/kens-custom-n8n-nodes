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
			// No externals - everything is bundled
		},
		optimization: {
			minimize: false,
		},
		ignoreWarnings: [
			// Ignore missing optional WebSocket performance dependencies
			{
				module: /node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			// Suppress handlebars require.extensions warnings (non-critical)
			{
				message: /require\.extensions is not supported by webpack/,
			},
			// Suppress fluent-ffmpeg dynamic require warnings (expected behavior)
			{
				message: /Critical dependency: the request of a dependency is an expression/,
			},
		],
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
			// Exclude libraries that cause Node.js v24+ read-only property issues
			'pdf-lib': 'pdf-lib',
			'yup': 'yup', 
			'zod': 'zod',
			'jimp': 'jimp',
			'web3': 'web3',
			'ethers': 'ethers',
			'@distube/ytdl-core': '@distube/ytdl-core',
			'fluent-ffmpeg': 'fluent-ffmpeg',
			'ffmpeg-static': 'ffmpeg-static',
			'archiver': 'archiver',
			'xlsx': 'xlsx',
			'node-forge': 'node-forge',
			'mathjs': 'mathjs',  // Exclude mathjs due to hasOwnProperty assignment error
			'form-data': 'form-data',  // Exclude form-data due to FormData.prototype.toString assignment error
			'axios': 'axios',  // Exclude axios due to AxiosURLSearchParams.prototype.toString assignment error
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
		ignoreWarnings: [
			// Ignore missing optional WebSocket performance dependencies
			{
				module: /node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			// Suppress handlebars require.extensions warnings (non-critical)
			{
				message: /require\.extensions is not supported by webpack/,
			},
			// Suppress fluent-ffmpeg dynamic require warnings (expected behavior)
			{
				message: /Critical dependency: the request of a dependency is an expression/,
			},
		],
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
			// Exclude libraries that cause Node.js v24+ read-only property issues
			'pdf-lib': 'pdf-lib',
			'yup': 'yup', 
			'zod': 'zod',
			'jimp': 'jimp',
			'web3': 'web3',
			'ethers': 'ethers',
			'@distube/ytdl-core': '@distube/ytdl-core',
			'fluent-ffmpeg': 'fluent-ffmpeg',
			'ffmpeg-static': 'ffmpeg-static',
			'archiver': 'archiver',
			'xlsx': 'xlsx',
			'node-forge': 'node-forge',
			'mathjs': 'mathjs',  // Exclude mathjs due to hasOwnProperty assignment error
			'form-data': 'form-data',  // Exclude form-data due to FormData.prototype.toString assignment error
			'axios': 'axios',  // Exclude axios due to AxiosURLSearchParams.prototype.toString assignment error
		},
		resolve: {
			extensions: ['.js', '.ts'],
		},
		optimization: {
			minimize: false,
		},
		ignoreWarnings: [
			// Ignore missing optional WebSocket performance dependencies
			{
				module: /node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ethers\/node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			// Suppress handlebars require.extensions warnings (non-critical)
			{
				message: /require\.extensions is not supported by webpack/,
			},
			// Suppress fluent-ffmpeg dynamic require warnings (expected behavior)
			{
				message: /Critical dependency: the request of a dependency is an expression/,
			},
		],
	},
];
