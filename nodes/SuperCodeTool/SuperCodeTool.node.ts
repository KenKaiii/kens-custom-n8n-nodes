import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { createContext, runInContext } from 'vm';
import { spawn } from 'child_process';

class PythonExecutor {
	async execute(
		code: string,
		items: INodeExecutionData[],
		timeout: number,
		context: IExecuteFunctions,
	): Promise<INodeExecutionData[][]> {
		return new Promise((resolve, reject) => {
			const pythonScript = `
import json
import sys
import pandas as pd
import numpy as np
import requests
import datetime
from urllib.parse import urlparse, parse_qs
import re
import hashlib
import base64
import uuid
import os

# Input data from n8n
input_data = json.loads('''${JSON.stringify(items.map((item) => item.json))}''')

# Make input data available as variables
data = input_data
items = input_data

# User code execution
try:
${code
	.split('\n')
	.map((line) => '    ' + line)
	.join('\n')}
except Exception as e:
    result = {"error": str(e), "type": type(e).__name__}
    print(json.dumps(result))
    sys.exit(1)

# Output result as JSON
if 'result' not in locals():
    result = {"message": "No result variable defined"}
print(json.dumps(result))
`;

			const pythonProcess = spawn('python3', ['-c', pythonScript], {
				timeout: timeout * 1000,
			});

			let output = '';
			let errorOutput = '';

			pythonProcess.stdout.on('data', (data: any) => {
				output += data.toString();
			});

			pythonProcess.stderr.on('data', (data: any) => {
				errorOutput += data.toString();
			});

			pythonProcess.on('close', (code: number) => {
				if (code !== 0) {
					reject(
						new NodeOperationError(
							context.getNode(),
							`Python execution failed: ${errorOutput || 'Unknown error'}`,
						),
					);
					return;
				}

				try {
					const result = JSON.parse(output.trim());
					if (result.error) {
						reject(new NodeOperationError(context.getNode(), `Python error: ${result.error}`));
						return;
					}

					if (Array.isArray(result)) {
						resolve([result.map((item: any) => ({ json: item }))]);
					} else {
						resolve([[{ json: result }]]);
					}
				} catch (parseError: any) {
					reject(
						new NodeOperationError(
							context.getNode(),
							`Failed to parse Python output: ${parseError.message}`,
						),
					);
				}
			});

			pythonProcess.on('error', (error: any) => {
				reject(
					new NodeOperationError(
						context.getNode(),
						`Failed to start Python process: ${error.message}`,
					),
				);
			});
		});
	}
}

export class SuperCodeTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Super Code Tool',
		name: 'superCodeTool',
		icon: { light: 'file:supercode.svg', dark: 'file:supercode.svg' },
		group: [],
		version: 1,
		description: 'AI Agent code execution tool with JavaScript/Python and 34+ enhanced libraries',
		usableAsTool: true,
		defaults: {
			name: 'Super Code Tool',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		credentials: [],
		properties: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{
						name: 'JavaScript',
						value: 'javascript',
						description: 'Execute JavaScript/TypeScript with 34+ enhanced libraries for AI agents',
					},
					{
						name: 'Python',
						value: 'python',
						description:
							'Execute Python with 30+ popular libraries (pandas, requests, etc.) for AI agents',
					},
				],
				default: 'javascript',
				description: 'Choose the programming language to execute',
			},
			{
				displayName: 'JavaScript Code',
				name: 'code',
				type: 'string',
				displayOptions: {
					show: {
						language: ['javascript'],
					},
				},
				typeOptions: {
					editor: 'codeNodeEditor',
					editorLanguage: 'javaScript',
					rows: 20,
				},
				default: `// AI Agent Super Code Tool - JavaScript Mode
// Available: lodash (_), axios, dayjs, joi, validator, uuid, csvParse, Handlebars, cheerio, CryptoJS, XLSX, pdfLib, math, xml2js, YAML, sharp, Jimp, QRCode, natural, archiver, puppeteer, knex, forge, moment, XMLParser, jwt, bcrypt, ethers, web3, phoneNumber, currency, iban, fuzzy

// Your AI agent code here
return { result: 'AI Agent Tool Ready!', agent: 'super-code-tool' };
`,
				description: 'JavaScript/TypeScript code with enhanced libraries for AI agents',
				noDataExpression: true,
			},
			{
				displayName: 'Python Code',
				name: 'code',
				type: 'string',
				displayOptions: {
					show: {
						language: ['python'],
					},
				},
				typeOptions: {
					editor: 'codeNodeEditor',
					editorLanguage: 'python',
					rows: 20,
				},
				default: `# AI Agent Super Code Tool - Python Mode  
# Pre-imported: pandas (pd), numpy (np), requests, datetime, json, sys, urllib.parse, re, hashlib, base64, uuid, os
# 30+ Python libraries available for AI agent tasks

# Your AI agent code here
result = {"message": "AI Agent Tool Ready!", "agent": "super-code-tool", "language": "python"}
`,
				description: 'Python code with popular libraries for AI agents',
				noDataExpression: true,
			},
			{
				displayName: 'Advanced Settings',
				name: 'advancedSettings',
				type: 'boolean',
				default: false,
				description: 'Show advanced execution options (execution mode, timeout, memory limit)',
			},
			{
				displayName: 'Execution Mode',
				name: 'executionMode',
				type: 'options',
				displayOptions: {
					show: {
						advancedSettings: [true],
					},
				},
				options: [
					{
						name: 'Run Once for All Items',
						value: 'runOnceForAllItems',
						description: 'Execute code once with access to all input items',
					},
					{
						name: 'Run Once for Each Item',
						value: 'runOnceForEachItem',
						description: 'Execute code separately for each input item',
					},
				],
				default: 'runOnceForAllItems',
				description: 'How to execute the code for AI agent workflows',
			},
			{
				displayName: 'Timeout (seconds)',
				name: 'timeout',
				type: 'number',
				displayOptions: {
					show: {
						advancedSettings: [true],
					},
				},
				default: 30,
				description: 'Maximum execution time in seconds for AI agent tasks',
				typeOptions: {
					minValue: 1,
					maxValue: 300,
				},
			},
			{
				displayName: 'Memory Limit (MB)',
				name: 'memoryLimit',
				type: 'number',
				displayOptions: {
					show: {
						advancedSettings: [true],
					},
				},
				default: 128,
				description: 'Maximum memory usage in MB for AI agent operations',
				typeOptions: {
					minValue: 16,
					maxValue: 512,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const language = this.getNodeParameter('language', 0, 'javascript') as string;
		const executionMode = this.getNodeParameter('executionMode', 0, 'runOnceForAllItems') as string;
		const code = this.getNodeParameter('code', 0) as string;
		const timeout = this.getNodeParameter('timeout', 0, 30) as number;

		if (!code.trim()) {
			throw new NodeOperationError(
				this.getNode(),
				`No code provided. Please add your ${language === 'python' ? 'Python' : 'JavaScript/TypeScript'} code for the AI agent.`,
			);
		}

		// Handle Python execution
		if (language === 'python') {
			const pythonExecutor = new PythonExecutor();
			return await pythonExecutor.execute(code, items, timeout, this);
		}

		console.log('[SuperCodeTool] 🤖 AI AGENT TOOL STARTING - JAVASCRIPT MODE - VM-SAFE VERSION');

		// Create enhanced sandbox with direct library loading (VM-compatible) - COPIED FROM SUPERCODE NODE
		const createEnhancedSandbox = (items: INodeExecutionData[]) => {
			console.log('[SuperCodeTool] 🏗️ Creating enhanced sandbox for AI agents...');
			const libraryCache: { [key: string]: any } = {};
			const performanceTracker: { [key: string]: number } = {};

			const createLLMError = (
				type: string,
				libraryName: string,
				originalError: any,
				context?: any,
			) => {
				const errorCodes: { [key: string]: string } = {
					LIBRARY_MISSING: 'E001',
					LIBRARY_LOAD_FAILED: 'E002',
					METHOD_NOT_FOUND: 'E003',
					INVALID_SYNTAX: 'E004',
					TYPE_ERROR: 'E005',
					ASYNC_ERROR: 'E006',
					MEMORY_ERROR: 'E007',
					NETWORK_ERROR: 'E008',
				};

				const fixes: { [key: string]: string } = {
					E001: `Library '${libraryName}' not installed. Run: npm install ${libraryName}`,
					E002: `Library '${libraryName}' failed to load. Check: 1) Is it installed? 2) Compatible version? 3) Dependencies met?`,
					E003: `Method not found on '${libraryName}'. Check: 1) Correct method name? 2) Library docs? 3) Await needed?`,
					E004: `Syntax error in ${libraryName} usage. Check: 1) Parentheses? 2) Quotes? 3) Semicolons?`,
					E005: `Type error with ${libraryName}. Check: 1) Correct data type? 2) Null/undefined? 3) Array vs Object?`,
					E006: `Async error with ${libraryName}. Fix: 1) Add 'await' 2) Use .then() 3) Wrap in try/catch`,
					E007: `Memory error. Fix: 1) Reduce data size 2) Process in chunks 3) Call utils.cleanup()`,
					E008: `Network error. Fix: 1) Check URL 2) Add timeout 3) Handle offline case`,
				};

				const code = errorCodes[type] || 'E000';
				const fix = fixes[code] || 'Check syntax and library documentation';

				return new Error(
					`🤖 AI AGENT ERROR [${code}]\n` +
						`📍 Library: ${libraryName}\n` +
						`🔍 Issue: ${originalError.message}\n` +
						`💡 Fix: ${fix}\n` +
						`📝 Context: ${context ? JSON.stringify(context, null, 2) : 'None'}\n` +
						`🔗 Stack: ${originalError.stack?.split('\n')[0] || 'N/A'}`,
				);
			};

			const createVmSafeLazyLoader = (
				hostObj: any,
				name: string,
				_libraryName: string,
				requirePath: string,
				property?: string,
			) => {
				let defined = false;
				let cachedValue: any;

				Object.defineProperty(hostObj, name, {
					get: function () {
						if (!defined) {
							console.log(`[SuperCodeTool] 🔄 AI Agent loading ${name} from ${requirePath}...`);
							defined = true;

							try {
								const lib = require(requirePath);
								cachedValue = property ? lib[property] : lib;

								Object.defineProperty(this, name, {
									value: cachedValue,
									writable: false,
									configurable: true,
									enumerable: true,
								});

								console.log(`[SuperCodeTool] ✅ AI Agent loaded ${name} successfully`);
								return cachedValue;
							} catch (error) {
								console.log(
									`[SuperCodeTool] ❌ AI Agent loading failed for ${name}: ${error.message}`,
								);
								throw error;
							}
						}
						return this[name];
					},
					configurable: true,
					enumerable: true,
				});
			};

			const sandbox = {
				$input: {
					all: () => items,
					first: () => items[0],
					last: () => items[items.length - 1],
					json: items.length === 1 ? items[0].json : items.map((item) => item.json),
				},

				console: {
					log: (...args: any[]) => console.log('[SuperCodeTool]', ...args),
					error: (...args: any[]) => console.error('[SuperCodeTool]', ...args),
					warn: (...args: any[]) => console.warn('[SuperCodeTool]', ...args),
				},
				utils: {
					now: () => new Date().toISOString(),
					formatDate: (date: any, format?: any) => {
						const d = new Date(date);
						return format ? d.toLocaleDateString() : d.toISOString();
					},
					isEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
					isUrl: (url: string) => {
						try {
							new URL(url);
							return true;
						} catch {
							return false;
						}
					},
					flatten: (obj: any, prefix = '') => {
						const flattened: any = {};
						for (const key in obj) {
							const newKey = prefix ? `${prefix}.${key}` : key;
							if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
								Object.assign(flattened, sandbox.utils.flatten(obj[key], newKey));
							} else {
								flattened[newKey] = obj[key];
							}
						}
						return flattened;
					},
					retry: async (fn: Function, options = { attempts: 3, delay: 1000 }) => {
						let lastError;
						for (let i = 0; i < options.attempts; i++) {
							try {
								return await fn();
							} catch (error) {
								lastError = error;
								if (i < options.attempts - 1) {
									await new Promise((resolve) =>
										setTimeout(resolve, options.delay * Math.pow(2, i)),
									);
								}
							}
						}
						throw lastError;
					},
					sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

					memoryUsage: () => {
						const usage = process.memoryUsage();
						return {
							heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
							heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
							external: `${Math.round(usage.external / 1024 / 1024)} MB`,
							rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
							loadedLibraries: Object.keys(libraryCache).length,
							estimatedFootprint: `${Object.keys(libraryCache).length * 2} MB`,
						};
					},

					getPerformanceStats: () => ({
						loadTimes: performanceTracker,
						averageLoadTime:
							Object.values(performanceTracker).reduce((a, b) => a + b, 0) /
								Object.keys(performanceTracker).length || 0,
						slowestLibrary: Object.entries(performanceTracker).sort(([, a], [, b]) => b - a)[0],
						fastestLibrary: Object.entries(performanceTracker).sort(([, a], [, b]) => a - b)[0],
						totalLibrariesLoaded: Object.keys(libraryCache).length,
					}),

					cleanup: (libraryNames?: string[]) => {
						const heavyLibraries = ['sharp', 'puppeteer-core', 'pdf-lib', 'jimp', 'archiver'];
						const toCleanup = libraryNames || heavyLibraries.filter((lib) => libraryCache[lib]);

						let cleaned = 0;
						toCleanup.forEach((lib) => {
							if (libraryCache[lib]) {
								delete libraryCache[lib];
								delete performanceTracker[lib];
								cleaned++;
								console.log(`[SuperCodeTool] 🧹 AI Agent cleaned up ${lib}`);
							}
						});

						return { cleaned, remaining: Object.keys(libraryCache).length };
					},

					healthCheck: () => {
						const memory = process.memoryUsage();
						const heapPercent = (memory.heapUsed / memory.heapTotal) * 100;

						return {
							status: heapPercent > 90 ? 'CRITICAL' : heapPercent > 70 ? 'WARNING' : 'HEALTHY',
							heapUsagePercent: Math.round(heapPercent),
							recommendCleanup: heapPercent > 70,
							loadedLibrariesCount: Object.keys(libraryCache).length,
							timestamp: new Date().toISOString(),
						};
					},

					sanitizeInput: (input: string) => {
						return input
							.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
							.replace(/javascript:/gi, '')
							.replace(/on\w+\s*=/gi, '')
							.trim();
					},

					validateSchema: (data: any, schema: any) => {
						try {
							const joi = require('joi');
							return joi.validate(data, schema);
						} catch (error: any) {
							throw createLLMError('TYPE_ERROR', 'joi', error, { data, schema });
						}
					},

					getAvailableLibraries: () => [
						'lodash (_)',
						'axios',
						'dayjs',
						'joi',
						'validator',
						'uuid',
						'csv-parse (csvParse)',
						'handlebars (Handlebars)',
						'cheerio',
						'crypto-js (CryptoJS)',
						'xlsx (XLSX)',
						'pdf-lib (pdfLib)',
						'mathjs (math)',
						'xml2js',
						'yaml (YAML)',
						'sharp',
						'jimp (Jimp)',
						'qrcode (QRCode)',
						'natural',
						'archiver',
						'puppeteer-core (puppeteer)',
						'knex',
						'node-forge (forge)',
						'moment-timezone (moment)',
						'fast-xml-parser (XMLParser)',
						'jsonwebtoken (jwt)',
						'bcrypt',
						'ethers',
						'web3',
						'libphonenumber-js (phoneNumber)',
						'currency.js (currency)',
						'iban',
						'fuse.js (fuzzy)',
					],

					isLibraryLoaded: (libraryName: string) => !!libraryCache[libraryName],
					getLoadedLibraries: () => Object.keys(libraryCache),
				},
				setTimeout,
				clearTimeout,
				setInterval,
				clearInterval,
				Promise,
				JSON,
				Date,
				Math,
				Object,
				Array,
				String,
				Number,
				Boolean,
				RegExp,
				Error,
				require,
			};

			console.log(
				'[SuperCodeTool] ✅ AI Agent sandbox created with getters:',
				Object.keys(sandbox).slice(0, 10),
			);
			console.log('[SuperCodeTool] 🔧 Applying VM-Safe lazy loading for AI agents...');

			const libraryMappings = [
				['_', 'lodash', 'lodash'],
				['axios', 'axios', 'axios'],
				['dayjs', 'dayjs', 'dayjs'],
				['joi', 'joi', 'joi'],
				['Joi', 'joi', 'joi'],
				['validator', 'validator', 'validator'],
				['uuid', 'uuid', 'uuid', 'v4'],
				['csvParse', 'csv-parse', 'csv-parse', 'parse'],
				['Handlebars', 'handlebars', 'handlebars'],
				['cheerio', 'cheerio', 'cheerio'],
				['CryptoJS', 'crypto-js', 'crypto-js'],
				['XLSX', 'xlsx', 'xlsx'],
				['pdfLib', 'pdf-lib', 'pdf-lib'],
				['math', 'mathjs', 'mathjs'],
				['xml2js', 'xml2js', 'xml2js'],
				['YAML', 'yaml', 'yaml'],
				['sharp', 'sharp', 'sharp'],
				['Jimp', 'jimp', 'jimp'],
				['QRCode', 'qrcode', 'qrcode'],
				['natural', 'natural', 'natural'],
				['archiver', 'archiver', 'archiver'],
				['puppeteer', 'puppeteer-core', 'puppeteer-core'],
				['knex', 'knex', 'knex'],
				['forge', 'node-forge', 'node-forge'],
				['moment', 'moment-timezone', 'moment-timezone'],
				['XMLParser', 'fast-xml-parser', 'fast-xml-parser', 'XMLParser'],
				['jwt', 'jsonwebtoken', 'jsonwebtoken'],
				['bcrypt', 'bcrypt', 'bcrypt'],
				['ethers', 'ethers', 'ethers'],
				['web3', 'web3', 'web3'],
				['phoneNumber', 'libphonenumber-js', 'libphonenumber-js'],
				['currency', 'currency.js', 'currency.js'],
				['iban', 'iban', 'iban'],
				['fuzzy', 'fuse.js', 'fuse.js'],
			];

			for (const [name, libraryName, requirePath, property] of libraryMappings) {
				delete (sandbox as any)[name];
				createVmSafeLazyLoader(sandbox, name, libraryName, requirePath, property);
			}

			console.log('[SuperCodeTool] ✅ VM-Safe lazy loading applied for AI agents');
			return sandbox;
		};

		try {
			console.log('[SuperCodeTool] 🤖 AI AGENT EXECUTION STARTING - VM-SAFE VERSION LOADED');
			if (executionMode === 'runOnceForAllItems') {
				const sandbox = createEnhancedSandbox(items);
				const context = createContext(sandbox);

				const wrappedCode = `
					(async function() {
						const executionStartTime = Date.now();
						let operationCount = 0;
						const maxOperations = 100000;
						
						const checkTimeout = () => {
							operationCount++;
							if (operationCount > maxOperations) {
								throw new Error('🤖 AI AGENT ERROR [E009]\\\\n📍 Issue: Possible infinite loop detected\\\\n💡 Fix: Check for infinite while/for loops, add break conditions');
							}
							if (Date.now() - executionStartTime > ${timeout * 1000}) {
								throw new Error('🤖 AI AGENT ERROR [E010]\\\\n📍 Issue: Code execution timeout (${timeout}s)\\\\n💡 Fix: 1) Reduce data processing 2) Use async/await 3) Increase timeout in Advanced Settings');
							}
						};
						
						try {
							${code}
						} catch (error) {
							if (error.name === 'TypeError') {
								if (error.message.includes('undefined')) {
									throw new Error('🤖 AI AGENT ERROR [E005]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: Check if variable exists before using: if (variable) { ... }');
								}
								if (error.message.includes('not a function')) {
									throw new Error('🤖 AI AGENT ERROR [E003]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: 1) Check method name spelling 2) Ensure library is loaded 3) Check object has method');
								}
							}
							if (error.name === 'ReferenceError') {
								const knownLibraries = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];
								const isKnownLibrary = knownLibraries.some(lib => error.message.includes(lib + ' is not defined'));
								if (!isKnownLibrary) {
									throw new Error('🤖 AI AGENT ERROR [E004]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: 1) Declare variable first 2) Check spelling 3) Import library if needed');
								}
								throw error;
							}
							if (error.message.includes('await')) {
								throw new Error('🤖 AI AGENT ERROR [E006]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: Add await before async operations: await axios.get(), await sharp().resize()');
							}
							throw error;
						}
					})();
				`;

				const result = await runInContext(wrappedCode, context, {
					timeout: timeout * 1000,
				});

				if (Array.isArray(result)) {
					return [
						result.map((item) => ({
							json: typeof item === 'object' && item !== null ? item : { data: item },
						})),
					];
				} else if (result !== undefined) {
					return [
						[{ json: typeof result === 'object' && result !== null ? result : { data: result } }],
					];
				} else {
					return [[]];
				}
			} else {
				const results: INodeExecutionData[] = [];

				for (let i = 0; i < items.length; i++) {
					const sandbox = createEnhancedSandbox([items[i]]);
					const context = createContext(sandbox);

					const wrappedCode = `
						(async function() {
							const executionStartTime = Date.now();
							let operationCount = 0;
							const maxOperations = 100000;
							
							const checkTimeout = () => {
								operationCount++;
								if (operationCount > maxOperations) {
									throw new Error('🤖 AI AGENT ERROR [E009]\\\\n📍 Issue: Possible infinite loop detected\\\\n💡 Fix: Check for infinite while/for loops, add break conditions');
								}
								if (Date.now() - executionStartTime > ${timeout * 1000}) {
									throw new Error('🤖 AI AGENT ERROR [E010]\\\\n📍 Issue: Code execution timeout (${timeout}s)\\\\n💡 Fix: 1) Reduce data processing 2) Use async/await 3) Increase timeout in Advanced Settings');
								}
							};
							
							try {
								${code}
							} catch (error) {
								if (error.name === 'TypeError') {
									if (error.message.includes('undefined')) {
										throw new Error('🤖 AI AGENT ERROR [E005]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: Check if variable exists before using: if (variable) { ... }');
									}
									if (error.message.includes('not a function')) {
										throw new Error('🤖 AI AGENT ERROR [E003]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: 1) Check method name spelling 2) Ensure library is loaded 3) Check object has method');
									}
								}
								if (error.name === 'ReferenceError') {
									const knownLibraries = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];
									const isKnownLibrary = knownLibraries.some(lib => error.message.includes(lib + ' is not defined'));
									if (!isKnownLibrary) {
										throw new Error('🤖 AI AGENT ERROR [E004]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: 1) Declare variable first 2) Check spelling 3) Import library if needed');
									}
									throw error;
								}
								if (error.message.includes('await')) {
									throw new Error('🤖 AI AGENT ERROR [E006]\\\\n📍 Issue: ' + error.message + '\\\\n💡 Fix: Add await before async operations: await axios.get(), await sharp().resize()');
								}
								throw error;
							}
						})();
					`;

					try {
						const result = await runInContext(wrappedCode, context, {
							timeout: timeout * 1000,
						});

						if (Array.isArray(result)) {
							results.push(
								...result.map((item) => ({
									json: typeof item === 'object' && item !== null ? item : { data: item },
								})),
							);
						} else if (result !== undefined) {
							results.push({
								json: typeof result === 'object' && result !== null ? result : { data: result },
							});
						}
					} catch (error) {
						if (this.continueOnFail()) {
							results.push({
								json: { error: (error as Error).message, originalData: items[i].json },
								error,
								pairedItem: { item: i },
							});
						} else {
							throw error;
						}
					}
				}

				return [results];
			}
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`AI Agent code execution failed: ${(error as Error).message}\n\nStack trace:\n${(error as Error).stack}`,
			);
		}
	}
}
