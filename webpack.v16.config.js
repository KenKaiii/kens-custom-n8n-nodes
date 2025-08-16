/* eslint-disable no-undef */
const path = require('path');

// Webpack config optimized for Node.js 16.x
module.exports = [
	{
		name: 'SuperCodeNode-v16',
		target: 'node16',
		mode: 'production',
		entry: './dist/SuperCodeNode/SuperCodeNode.node.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'SuperCodeNode.node.v16.bundled.js',
			libraryTarget: 'commonjs2',
			chunkFormat: 'commonjs',
		},
		externals: {
			'n8n-workflow': 'n8n-workflow',
			// More aggressive externals for Node 16 compatibility
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
			// Additional Node 16 externals
			'bcrypt': 'bcrypt',
			'jsonwebtoken': 'jsonwebtoken'
		},
		resolve: {
			extensions: ['.js', '.ts'],
			fallback: {
				// Node 16 polyfills
				"buffer": require.resolve("buffer"),
				"util": require.resolve("util")
			}
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
		name: 'SuperCodeTool-v16',
		target: 'node16',
		mode: 'production',
		entry: './dist/SuperCodeTool/SuperCodeTool.node.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'SuperCodeTool.node.v16.bundled.js',
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
			'bcrypt': 'bcrypt',
			'jsonwebtoken': 'jsonwebtoken'
		},
		resolve: {
			extensions: ['.js', '.ts'],
			fallback: {
				"buffer": require.resolve("buffer"),
				"util": require.resolve("util")
			}
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