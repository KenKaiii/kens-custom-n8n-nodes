/* eslint-disable no-undef */
const path = require('path');

// Webpack config optimized for Node.js 18.x
module.exports = [
	{
		name: 'SuperCodeNode-v18',
		target: 'node18',
		mode: 'production',
		entry: './dist/SuperCodeNode/SuperCodeNode.node.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'SuperCodeNode.node.v18.bundled.js',
			libraryTarget: 'commonjs2',
			chunkFormat: 'commonjs',
		},
		externals: {
			'n8n-workflow': 'n8n-workflow',
			// Node 18 compatible externals
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
			'mathjs': 'mathjs',
			'form-data': 'form-data',
			'axios': 'axios',
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
			nodeEnv: 'production'
		},
		ignoreWarnings: [
			{
				module: /node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			{
				message: /require\.extensions is not supported by webpack/,
			},
			{
				message: /Critical dependency: the request of a dependency is an expression/,
			},
		],
	},
	{
		name: 'SuperCodeTool-v18',
		target: 'node18',
		mode: 'production',
		entry: './dist/SuperCodeTool/SuperCodeTool.node.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'SuperCodeTool.node.v18.bundled.js',
			libraryTarget: 'commonjs2',
			chunkFormat: 'commonjs',
		},
		externals: {
			'n8n-workflow': 'n8n-workflow',
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
			'mathjs': 'mathjs',
			'form-data': 'form-data',
			'axios': 'axios',
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
			nodeEnv: 'production'
		},
		ignoreWarnings: [
			{
				module: /node_modules\/ws\/lib\/buffer-util\.js/,
				message: /Can't resolve 'bufferutil'/,
			},
			{
				module: /node_modules\/ws\/lib\/validation\.js/,
				message: /Can't resolve 'utf-8-validate'/,
			},
			{
				message: /require\.extensions is not supported by webpack/,
			},
			{
				message: /Critical dependency: the request of a dependency is an expression/,
			},
		],
	},
];