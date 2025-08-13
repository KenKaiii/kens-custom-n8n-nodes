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
			// ALL LIBRARY EXTERNALS REMOVED - Libraries will be bundled with embedded approach
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
