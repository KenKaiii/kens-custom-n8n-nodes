import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { createContext, runInContext } from 'vm';

// Import bundled libraries directly to avoid webpack dynamic require issues
let bundledLibraries: any;
try {
	bundledLibraries = require('../bundled-libraries');
	console.log('[SuperCode] ✅ Bundled libraries loaded successfully');
} catch (e) {
	console.log('[SuperCode] ⚠️ Failed to load bundled libraries:', (e as Error).message);
	bundledLibraries = {};
}
// import { spawn } from 'child_process'; // Disabled for Python support
// import * as path from 'path'; // Disabled for Python support

/* Python execution disabled for server compatibility
class PythonExecutor {
	private static dependenciesChecked = false;

	private async ensurePythonDependencies(): Promise<void> {
		if (PythonExecutor.dependenciesChecked) return;

		console.log('[SuperCode] 🐍 Ensuring Python dependencies are available...');
		
		// Get the path to the python installer script
		const installerPath = path.join(__dirname, '../../python-installer.py');
		
		return new Promise((resolve) => {
			// Try different Python executables
			const pythonPaths = ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
			let pythonCmd = 'python3';
			
			// Find working Python executable
			for (const path of pythonPaths) {
				try {
					const testResult = spawn(path, ['--version'], { timeout: 5000 });
					if (testResult) {
						pythonCmd = path;
						break;
					}
				} catch (error) {
					continue;
				}
			}
			
			console.log(`[SuperCode] 🐍 Using Python executable: ${pythonCmd}`);
			const pythonProcess = spawn(pythonCmd, [installerPath], {
				timeout: 300000, // 5 minutes for installations
			});

			pythonProcess.stdout.on('data', (data) => {
				console.log(`[SuperCode] ${data.toString().trim()}`);
			});

			pythonProcess.stderr.on('data', (data) => {
				console.log(`[SuperCode] ${data.toString().trim()}`);
			});

			pythonProcess.on('close', (code) => {
				console.log(`[SuperCode] ✅ Python dependency check completed (exit code: ${code})`);
				PythonExecutor.dependenciesChecked = true;
				resolve();
			});

			pythonProcess.on('error', (error) => {
				console.log(`[SuperCode] ⚠️ Python dependency check failed: ${error.message}`);
				PythonExecutor.dependenciesChecked = true;
				resolve(); // Continue even if check failed
			});
		});
	}

	async execute(
		code: string,
		items: INodeExecutionData[],
		timeout: number,
		context: IExecuteFunctions,
		aiConnections?: { llm?: any; memory?: any; tools?: any },
	): Promise<INodeExecutionData[][]> {
		// Ensure Python dependencies are installed before execution
		await this.ensurePythonDependencies();

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

# 🤖 AI Agent Mode: Auto-populated AI variables (seamless UX!)
llm = ${aiConnections?.llm ? JSON.stringify(aiConnections.llm).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None') : 'None'}
memory = ${aiConnections?.memory ? JSON.stringify(aiConnections.memory).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None') : 'None'}
tools = ${aiConnections?.tools ? JSON.stringify(aiConnections.tools).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None') : 'None'}

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

			// Try different Python executables
			const pythonPaths = ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];
			let pythonCmd = 'python3';
			
			// Find working Python executable
			for (const path of pythonPaths) {
				try {
					const testResult = spawn(path, ['--version'], { timeout: 1000 });
					if (testResult) {
						pythonCmd = path;
						break;
					}
				} catch (error) {
					continue;
				}
			}
			
			console.log(`[SuperCode] 🐍 Executing Python with: ${pythonCmd}`);
			const pythonProcess = spawn(pythonCmd, ['-c', pythonScript], {
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
					// DEBUG: Log exactly what Python is outputting
					console.log(`[SuperCode] 🐍 Python raw output: "${output}"`);
					console.log(`[SuperCode] 🐍 Python output length: ${output.length}`);
					console.log(`[SuperCode] 🐍 Python output lines: ${output.split('\n').length}`);
					
					// Extract JSON from output (handle mixed output from auto-installer)
					const lines = output.trim().split('\n');
					let jsonLine = '';
					
					// Find the last line that looks like JSON
					for (let i = lines.length - 1; i >= 0; i--) {
						const line = lines[i].trim();
						console.log(`[SuperCode] 🐍 Checking line ${i}: "${line}"`);
						if (line.startsWith('{') || line.startsWith('[')) {
							jsonLine = line;
							console.log(`[SuperCode] 🐍 Found JSON line: "${jsonLine}"`);
							break;
						}
					}
					
					if (!jsonLine) {
						// Fallback: try to parse the whole output
						jsonLine = output.trim();
						console.log(`[SuperCode] 🐍 Using fallback whole output: "${jsonLine}"`);
					}
					
					const result = JSON.parse(jsonLine);
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
*/ // End Python execution disabled comment

export class SuperCodeNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Super Code',
		name: 'superCodeNodeVmSafe',
		icon: { light: 'file:supercode.svg', dark: 'file:supercode.svg' },
		group: ['transform'],
		version: 1,
		description: 'Execute JavaScript/TypeScript with enhanced libraries and utilities',
		defaults: {
			name: 'Super Code',
		},
		inputs: `={{ 
			((values, aiAgentMode) => {
				const connectorTypes = {
					'${NodeConnectionType.AiChain}': 'Chain',
					'${NodeConnectionType.AiDocument}': 'Document',
					'${NodeConnectionType.AiEmbedding}': 'Embedding',
					'${NodeConnectionType.AiLanguageModel}': 'Language Model',
					'${NodeConnectionType.AiMemory}': 'Memory',
					'${NodeConnectionType.AiOutputParser}': 'Output Parser',
					'${NodeConnectionType.AiTextSplitter}': 'Text Splitter',
					'${NodeConnectionType.AiTool}': 'Tool',
					'${NodeConnectionType.AiVectorStore}': 'Vector Store',
					'${NodeConnectionType.Main}': 'Main'
				};
				const baseInputs = [{ displayName: '', type: '${NodeConnectionType.Main}' }];
				if (aiAgentMode && values) {
					return baseInputs.concat(values.map(value => ({
						type: value.type,
						required: value.required,
						maxConnections: value.maxConnections === -1 ? undefined : value.maxConnections,
						displayName: connectorTypes[value.type] !== 'Main' ? connectorTypes[value.type] : undefined
					})));
				}
				return baseInputs;
			})($parameter.aiConnections?.input, $parameter.aiAgentMode)
		}}`,
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		parameterPane: 'wide',
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
						description: 'Execute JavaScript/TypeScript with 33+ enhanced libraries',
					},
					{
						name: 'Python',
						value: 'python',
						description: 'Execute Python with 30+ popular libraries (pandas, requests, etc.)',
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
					editor: 'jsEditor',
				},
				default: `// Libraries are pre-loaded as globals - no require() needed!
// Available: lodash (_), axios, dayjs, joi, validator, uuid, csvParse, Handlebars, cheerio, CryptoJS, XLSX, pdfLib, math, xml2js, YAML, sharp, Jimp, QRCode, natural, archiver, puppeteer, knex, forge, moment, XMLParser, jwt, bcrypt, ethers, web3, phoneNumber, currency, iban, fuzzy

// Example: Use joi directly (no require needed)
const schema = joi.string().min(3);
const result = schema.validate('test');

// 🤖 AI Agent Mode: Auto-populated AI variables (seamless UX!)
const aiConnections = {
    llm_available: !!llm,
    memory_available: !!memory,
    tools_available: !!tools
};

if (llm) {
    // Language model is automatically available when connected
    console.log('AI LLM available:', typeof llm, Object.keys(llm));
    // Note: AI connections come as arrays, access actual LLM with llm[0]
    const actualLLM = llm[0];
    if (actualLLM) {
        console.log('Actual LLM methods:', Object.getOwnPropertyNames(actualLLM));
        aiConnections.llm_info = {
            type: typeof llm,
            keys: Object.keys(llm).slice(0, 5),
            actual_llm_available: !!actualLLM,
            actual_llm_methods: Object.getOwnPropertyNames(actualLLM).slice(0, 10)
        };
    }
}

if (memory) {
    // Memory is automatically available when connected
    console.log('AI Memory available:', typeof memory, Object.keys(memory));
    aiConnections.memory_info = {
        type: typeof memory,
        keys: Object.keys(memory).slice(0, 5)
    };
}

if (tools) {
    // Tools are automatically available when connected
    console.log('AI Tools available:', typeof tools, Object.keys(tools));
    aiConnections.tools_info = {
        type: typeof tools,
        keys: Object.keys(tools).slice(0, 5)
    };
}

// Your JavaScript code here
return { 
    result: 'Hello from Super Code!', 
    ai_mode: !!llm,
    ai_connections: aiConnections 
};
`,
				description: 'JavaScript/TypeScript code with enhanced libraries and utilities',
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
					editor: 'jsEditor',
					editorLanguage: 'python',
				},
				default: `# 30+ Python libraries available: pandas, numpy, requests, datetime, json, sys, urllib, re, hashlib, base64, uuid, os, and many more
# Pre-imported: pandas (pd), numpy (np), requests, datetime, json, sys, urllib.parse, re, hashlib, base64, uuid, os

# 🤖 AI Agent Mode: Auto-populated AI variables (seamless UX!)
ai_connections = {
    "llm_available": llm is not None,
    "memory_available": memory is not None,
    "tools_available": tools is not None
}

if llm is not None:
    # Language model is automatically available when connected
    # Note: llm object structure depends on the connected AI model
    # Uncomment to inspect: ai_connections["llm_type"] = type(llm).__name__
    ai_connections["llm_type"] = type(llm).__name__

if memory is not None:
    # Memory is automatically available when connected
    # Uncomment to inspect: ai_connections["memory_type"] = type(memory).__name__
    ai_connections["memory_type"] = type(memory).__name__

if tools is not None:
    # Tools are automatically available when connected
    # Uncomment to inspect: ai_connections["tools_type"] = type(tools).__name__
    ai_connections["tools_type"] = type(tools).__name__

# Your Python code here
result = {
    "message": "Hello from Super Code Python!", 
    "ai_mode": llm is not None,
    "ai_connections": ai_connections
}
`,
				description: 'Python code with popular libraries and utilities',
				noDataExpression: true,
			},
			{
				displayName: 'AI Agent Mode',
				name: 'aiAgentMode',
				type: 'boolean',
				default: false,
				description:
					'Enable AI Agent Mode with 10 AI connection types (Chain, Document, Embedding, Language Model, Memory, Output Parser, Text Splitter, Tools, Vector Store)',
			},
			{
				displayName: 'Execution Mode',
				name: 'executionType',
				type: 'options',
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Process workflow data and return to main output',
					},
					{
						name: 'Supply Data',
						value: 'supplyData',
						description: 'Provide AI components to other nodes, no main I/O processing',
					},
				],
				default: 'execute',
				description:
					'Choose execution mode: Execute for data processing or Supply Data for AI component provision',
			},
			{
				displayName: 'AI Connections',
				name: 'aiConnections',
				placeholder: 'Add AI Connection',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						aiAgentMode: [true],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				options: [
					{
						name: 'input',
						displayName: 'Input',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'Chain', value: NodeConnectionType.AiChain },
									{ name: 'Document', value: NodeConnectionType.AiDocument },
									{ name: 'Embedding', value: NodeConnectionType.AiEmbedding },
									{ name: 'Language Model', value: NodeConnectionType.AiLanguageModel },
									{ name: 'Memory', value: NodeConnectionType.AiMemory },
									{ name: 'Output Parser', value: NodeConnectionType.AiOutputParser },
									{ name: 'Text Splitter', value: NodeConnectionType.AiTextSplitter },
									{ name: 'Tool', value: NodeConnectionType.AiTool },
									{ name: 'Vector Store', value: NodeConnectionType.AiVectorStore },
								],
								default: NodeConnectionType.AiLanguageModel,
								description: 'Type of AI connection to add',
							},
							{
								displayName: 'Max Connections',
								name: 'maxConnections',
								type: 'number',
								default: 1,
								description: 'Maximum number of connections allowed (-1 for unlimited)',
								typeOptions: {
									minValue: -1,
									maxValue: 100,
								},
							},
							{
								displayName: 'Required',
								name: 'required',
								type: 'boolean',
								default: false,
								description: 'Whether this connection is required',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const language = this.getNodeParameter('language', 0, 'javascript') as string;
		const executionMode = 'runOnceForAllItems'; // Default execution mode
		const code = this.getNodeParameter('code', 0) as string;
		const timeout = 30; // Default timeout in seconds

		if (!code.trim()) {
			throw new NodeOperationError(
				this.getNode(),
				`No code provided. Please add your ${language === 'python' ? 'Python' : 'JavaScript/TypeScript'} code.`,
			);
		}

		// Handle Python execution
		if (language === 'python') {
			// Python support temporarily disabled - coming soon!
			throw new NodeOperationError(
				this.getNode(),
				'🐍 Python execution is coming soon! Currently under development for broader server compatibility. Use JavaScript for now - 35 libraries available!',
			);
		}
		
		// Python code disabled for server compatibility
		/* 
		if (language === 'python') {
			const aiAgentMode = this.getNodeParameter('aiAgentMode', 0, false) as boolean;
			let aiConnections: { llm?: any; memory?: any; tools?: any } | undefined;

			// 🤖 Get AI connections for Python if AI Agent Mode is enabled
			if (aiAgentMode) {
				console.log('[SuperCode] 🤖 Getting AI connections for Python execution...');
				aiConnections = {};

				try {
					const llmConnection = await this.getInputConnectionData(
						NodeConnectionType.AiLanguageModel,
						0,
					);
					if (llmConnection) {
						// 🎯 Extract actual LLM from array for user convenience
						aiConnections.llm = Array.isArray(llmConnection) ? llmConnection[0] : llmConnection;
						console.log('[SuperCode] ✅ Got LLM connection for Python (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No LLM connection for Python');
				}

				try {
					const memoryConnection = await this.getInputConnectionData(
						NodeConnectionType.AiMemory,
						0,
					);
					if (memoryConnection) {
						// 🎯 Extract actual memory from array for user convenience
						aiConnections.memory = Array.isArray(memoryConnection)
							? memoryConnection[0]
							: memoryConnection;
						console.log('[SuperCode] ✅ Got Memory connection for Python (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No Memory connection for Python');
				}

				try {
					const toolConnection = await this.getInputConnectionData(NodeConnectionType.AiTool, 0);
					if (toolConnection) {
						// 🎯 Extract actual tools from array for user convenience
						aiConnections.tools = Array.isArray(toolConnection)
							? toolConnection[0]
							: toolConnection;
						console.log('[SuperCode] ✅ Got Tools connection for Python (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No Tools connection for Python');
				}
			}

			const pythonExecutor = new PythonExecutor();
			return await pythonExecutor.execute(code, items, timeout, this, aiConnections);
		}
		*/

		console.log('[SuperCode] 🚀 EXECUTION STARTING - JAVASCRIPT MODE - VM-SAFE VERSION');

		// AI Agent Mode: Get AI connections if enabled
		const aiAgentMode = this.getNodeParameter('aiAgentMode', 0, false) as boolean;

		// Create enhanced sandbox with direct library loading (VM-compatible)
		const createEnhancedSandbox = async (items: INodeExecutionData[]) => {
			console.log('[SuperCode] 🏗️ Creating enhanced sandbox with direct loading...');
			// Library cache to avoid repeated loading
			const libraryCache: { [key: string]: any } = {};
			const performanceTracker: { [key: string]: number } = {};


			// VM-Safe Lazy Loading Pattern (fixes VM context getter incompatibility)
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
							console.log(`[SuperCode] 🔄 VM-Safe loading ${name} from ${requirePath}...`);
							defined = true;

							try {
								// Use pre-imported bundled libraries to avoid webpack dynamic require issues
								let lib = bundledLibraries[name];
								if (!lib) {
									// Fallback to direct require for external libraries  
									try {
										lib = require(requirePath);
									} catch {
										// Library not available
										throw new Error(`Library ${name} not found`);
									}
								}
								cachedValue = property ? lib[property] : lib;

								// Redefine as value property for VM compatibility
								Object.defineProperty(this, name, {
									value: cachedValue,
									writable: false,
									configurable: true,
									enumerable: true,
								});

								console.log(`[SuperCode] ✅ VM-Safe loaded ${name} successfully`);
								return cachedValue;
							} catch (error) {
								console.log(`[SuperCode] ❌ VM-Safe loading failed for ${name}: ${error.message}`);
								throw error;
							}
						}
						return this[name];
					},
					configurable: true,
					enumerable: true,
				});
			};

			// Enhanced lazy loader with LLM-friendly errors and comprehensive logging
			// Old lazyLoad function removed - now using VM-Safe pattern only

			const sandbox = {
				$input: {
					all: () => items,
					first: () => items[0],
					last: () => items[items.length - 1],
					json: items.length === 1 ? items[0].json : items.map((item) => item.json),
				},

				// 🤖 AI Agent Mode: AI Connection Access (like LangChain Code node)
				getInputConnectionData: aiAgentMode ? this.getInputConnectionData.bind(this) : undefined,

				// 🎯 Auto-populated AI variables for seamless UX
				llm: undefined as any, // Will be populated if AI Agent Mode is enabled
				memory: undefined as any, // Will be populated if AI Agent Mode is enabled
				tools: undefined as any, // Will be populated if AI Agent Mode is enabled

				// Libraries will be added via VM-Safe lazy loading pattern below

				console: {
					log: (...args: any[]) => console.log('[SuperCode]', ...args),
					error: (...args: any[]) => console.error('[SuperCode]', ...args),
					warn: (...args: any[]) => console.warn('[SuperCode]', ...args),
				},
				utils: {
					now: () => new Date().toISOString(),
					formatDate: (date: any, format?: any) => {
						const d = new Date(date);
						return format ? d.toLocaleDateString() : d.toISOString();
					},
					isEmail: (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email),
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

					// 🧠 Memory Management & Monitoring
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

					// 📊 Performance Monitoring
					getPerformanceStats: () => ({
						loadTimes: performanceTracker,
						averageLoadTime:
							Object.values(performanceTracker).reduce((a, b) => a + b, 0) /
								Object.keys(performanceTracker).length || 0,
						slowestLibrary: Object.entries(performanceTracker).sort(([, a], [, b]) => b - a)[0],
						fastestLibrary: Object.entries(performanceTracker).sort(([, a], [, b]) => a - b)[0],
						totalLibrariesLoaded: Object.keys(libraryCache).length,
					}),

					// 🧹 Resource Cleanup
					cleanup: (libraryNames?: string[]) => {
						const heavyLibraries = ['sharp', 'puppeteer-core', 'pdf-lib', 'jimp', 'archiver'];
						const toCleanup = libraryNames || heavyLibraries.filter((lib) => libraryCache[lib]);

						let cleaned = 0;
						toCleanup.forEach((lib) => {
							if (libraryCache[lib]) {
								delete libraryCache[lib];
								delete performanceTracker[lib];
								cleaned++;
								console.log(`[SuperCode] 🧹 Cleaned up ${lib}`);
							}
						});

						return { cleaned, remaining: Object.keys(libraryCache).length };
					},

					// 🔍 Health Check
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

					// 🛡️ Security & Validation
					sanitizeInput: (input: string) => {
						return input
							.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
							.replace(/javascript:/gi, '')
							.replace(/on\w+\s*=/gi, '')
							.trim();
					},

					validateSchema: (data: any, schema: any) => {
						// Note: joi validation requires joi library to be loaded first
						// Use: const joi = require('joi'); result = utils.validateSchema(data, schema);
						return { error: 'joi validation disabled - load joi first', value: data };
					},

					// Library availability checker
					getAvailableLibraries: () => [
						// Core Data Libraries
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
						// Business-Critical Libraries
						'xlsx (XLSX)',
						'pdf-lib (pdfLib)',
						'mathjs (math)',
						'xml2js',
						'yaml (YAML)',
						// Media Processing
						'sharp',
						'jimp (Jimp)',
						'qrcode (QRCode)',
						// AI/NLP Libraries
						'natural',
						// File & Archive Processing
						'archiver',
						// Web & Scraping
						'puppeteer-core (puppeteer)',
						// Database & Security
						'knex',
						'node-forge (forge)',
						'moment-timezone (moment)',
						// Advanced XML
						'fast-xml-parser (XMLParser)',
						// 🔐 Authentication & Security (NEW!)
						'jsonwebtoken (jwt)',
						'bcrypt',
						// 💰 Blockchain & Crypto (NEW!)
						'ethers',
						'web3',
						// 🌍 International Business (NEW!)
						'libphonenumber-js (phoneNumber)',
						'currency.js (currency)',
						'iban',
						// 🔍 Advanced Search & Text (NEW!)
						'fuse.js (fuzzy)',
					],

					// Check if library is loaded
					isLibraryLoaded: (libraryName: string) => !!libraryCache[libraryName],

					// Get loaded library stats
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
				require, // Add require to VM context for lazy loading
			};

			console.log(
				'[SuperCode] ✅ Sandbox created with getters:',
				Object.keys(sandbox).slice(0, 10),
			);

			// Apply VM-Safe Lazy Loading to fix VM context getter incompatibility
			console.log('[SuperCode] 🔧 Applying VM-Safe lazy loading pattern...');

			// Remove existing getters and replace with VM-safe lazy loaders
			const libraryMappings = [
				// Core Data Libraries
				['_', 'lodash', 'lodash'],
				['axios', 'axios', 'axios'],
				['dayjs', 'dayjs', 'dayjs'],
				['joi', 'joi', 'joi'],
				['Joi', 'joi', 'joi'],
				['validator', 'validator', 'validator'],
				['uuid', 'uuid', 'uuid'],
				['csvParse', 'csv-parse', 'csv-parse', 'parse'],
				['Handlebars', 'handlebars', 'handlebars'],
				['cheerio', 'cheerio', 'cheerio'],
				['CryptoJS', 'crypto-js', 'crypto-js'],

				// Business-Critical Libraries
				['XLSX', 'xlsx', 'xlsx'],
				['pdfLib', 'pdf-lib', 'pdf-lib'],
				['math', 'mathjs', 'mathjs'],
				['xml2js', 'xml2js', 'xml2js'],
				['YAML', 'yaml', 'yaml'],

				// Media Processing
				['sharp', 'sharp', 'sharp'],
				['Jimp', 'jimp', 'jimp'],
				['QRCode', 'qrcode', 'qrcode'],

				// AI/NLP
				['natural', 'natural', 'natural'],

				// File & Archive
				['archiver', 'archiver', 'archiver'],

				// Web & Scraping
				['puppeteer', 'puppeteer-core', 'puppeteer-core'],

				// Database & Security
				['knex', 'knex', 'knex'],
				['forge', 'node-forge', 'node-forge'],
				['moment', 'moment-timezone', 'moment-timezone'],

				// Advanced XML
				['XMLParser', 'fast-xml-parser', 'fast-xml-parser', 'XMLParser'],

				// Auth & Security
				['jwt', 'jsonwebtoken', 'jsonwebtoken'],
				['bcrypt', 'bcrypt', 'bcrypt'],

				// Blockchain & Crypto
				['ethers', 'ethers', 'ethers'],
				['web3', 'web3', 'web3'],

				// International Business
				['phoneNumber', 'libphonenumber-js', 'libphonenumber-js'],
				['currency', 'currency.js', 'currency.js'],
				['iban', 'iban', 'iban'],

				// Advanced Search & Text
				['fuzzy', 'fuse.js', 'fuse.js'],
			];

			// Apply VM-safe lazy loading to each library
			for (const [name, libraryName, requirePath, property] of libraryMappings) {
				// Remove existing getter if it exists
				delete (sandbox as any)[name];

				// Add VM-safe lazy loader
				createVmSafeLazyLoader(sandbox, name, libraryName, requirePath, property);
			}

			// 🔧 CRITICAL VM CONTEXT FIX: Pre-load ALL libraries as direct values
			// Using pre-imported bundled libraries to avoid webpack dynamic require issues
			if (bundledLibraries && Object.keys(bundledLibraries).length > 0) {
				console.log('[SuperCode] 🔧 Pre-loading ALL libraries as direct values for VM compatibility...');
				
				let preloadedCount = 0;
				let skippedCount = 0;
				
				// Pre-load ALL bundled libraries as direct values (skip getters completely)
				for (const [libName, libValue] of Object.entries(bundledLibraries)) {
					if (libValue && typeof libValue !== 'undefined') {
						// Remove any existing getter and replace with direct value
						delete (sandbox as any)[libName];
						(sandbox as any)[libName] = libValue;
						preloadedCount++;
						console.log(`[SuperCode] ✅ Pre-loaded ${libName} as direct value`);
					} else {
						skippedCount++;
						console.log(`[SuperCode] ⚠️ Skipped ${libName} (undefined/null)`);
					}
				}
				
				console.log(`[SuperCode] ✅ Pre-loading completed: ${preloadedCount} loaded, ${skippedCount} skipped`);
			} else {
				console.log('[SuperCode] ⚠️ No bundled libraries available, attempting fallback loading...');
				// Fallback: try to pre-load critical libraries individually
				const criticalLibs = ['joi', 'Joi', 'pdfLib', 'math', 'Jimp', 'QRCode', 'currency', 'iban', 'ethers', 'natural', 'sharp', 'puppeteer', 'bcrypt', 'web3'];
				for (const libName of criticalLibs) {
					try {
						const lib = require(libraryMappings.find(([name]) => name === libName)?.[2] || libName);
						if (lib) {
							delete (sandbox as any)[libName];
							(sandbox as any)[libName] = lib;
							console.log(`[SuperCode] ✅ Fallback loaded ${libName}`);
						}
					} catch (libError) {
						console.log(`[SuperCode] ❌ Failed to fallback load ${libName}`);
					}
				}
			}

			console.log('[SuperCode] ✅ VM-Safe lazy loading applied to all libraries');

			// 🤖 Auto-populate AI variables when AI Agent Mode is enabled
			if (aiAgentMode) {
				console.log('[SuperCode] 🤖 Auto-populating AI variables...');

				// Auto-populate llm (Language Model) - extract actual component
				try {
					const llmConnection = await this.getInputConnectionData(
						NodeConnectionType.AiLanguageModel,
						0,
					);
					if (llmConnection) {
						// 🎯 Extract actual LLM from array for user convenience
						sandbox.llm = Array.isArray(llmConnection) ? llmConnection[0] : llmConnection;
						console.log('[SuperCode] ✅ Auto-populated llm variable (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No Language Model connection found');
				}

				// Auto-populate memory - extract actual component
				try {
					const memoryConnection = await this.getInputConnectionData(
						NodeConnectionType.AiMemory,
						0,
					);
					if (memoryConnection) {
						// 🎯 Extract actual memory from array for user convenience
						sandbox.memory = Array.isArray(memoryConnection)
							? memoryConnection[0]
							: memoryConnection;
						console.log('[SuperCode] ✅ Auto-populated memory variable (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No Memory connection found');
				}

				// Auto-populate tools - extract actual component
				try {
					const toolConnection = await this.getInputConnectionData(NodeConnectionType.AiTool, 0);
					if (toolConnection) {
						// 🎯 Extract actual tools from array for user convenience
						sandbox.tools = Array.isArray(toolConnection) ? toolConnection[0] : toolConnection;
						console.log('[SuperCode] ✅ Auto-populated tools variable (extracted from array)');
					}
				} catch (error) {
					console.log('[SuperCode] ℹ️ No Tool connections found');
				}
			}

			return sandbox;
		};


		try {
			console.log('[SuperCode] 🚀 EXECUTION STARTING - LIBRARIES PRE-LOADED AS GLOBALS');
			
			if (executionMode === 'runOnceForAllItems') {
				// Execute code once for all items
				const sandbox = await createEnhancedSandbox(items);
				const context = createContext(sandbox);

				const wrappedCode = `
					(async function() {
						const executionStartTime = Date.now();
						let operationCount = 0;
						const maxOperations = 100000; // Prevent infinite loops
						
						const checkTimeout = () => {
							operationCount++;
							if (operationCount > maxOperations) {
								throw new Error('🤖 LLM-FRIENDLY ERROR [E009]\\n📍 Issue: Possible infinite loop detected\\n💡 Fix: Check for infinite while/for loops, add break conditions');
							}
							if (Date.now() - executionStartTime > ${timeout * 1000}) {
								throw new Error('🤖 LLM-FRIENDLY ERROR [E010]\\n📍 Issue: Code execution timeout (${timeout}s)\\n💡 Fix: 1) Reduce data processing 2) Use async/await 3) Increase timeout in Advanced Settings');
							}
						};
						
						// 🚀 Libraries are pre-loaded as globals in the sandbox - no require needed!
						
						// Enhanced async wrapper with better error handling
						try {
							${code}
						} catch (error) {
							// Categorize common errors for LLM assistance
							if (error.name === 'TypeError') {
								if (error.message.includes('undefined')) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E005]\\n📍 Issue: ' + error.message + '\\n💡 Fix: Check if variable exists before using: if (variable) { ... }');
								}
								if (error.message.includes('not a function')) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E003]\\n📍 Issue: ' + error.message + '\\n💡 Fix: 1) Check method name spelling 2) Ensure library is loaded 3) Check object has method');
								}
							}
							if (error.name === 'ReferenceError') {
								// Don't intercept ReferenceErrors for known lazy-loaded libraries
								const knownLibraries = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];
								const isKnownLibrary = knownLibraries.some(lib => error.message.includes(lib + ' is not defined'));
								if (!isKnownLibrary) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E004]\\n📍 Issue: ' + error.message + '\\n💡 Fix: 1) Declare variable first 2) Check spelling 3) Import library if needed');
								}
								// Re-throw original error for known libraries to allow lazy loading
								throw error;
							}
							if (error.message.includes('await')) {
								throw new Error('🤖 LLM-FRIENDLY ERROR [E006]\\n📍 Issue: ' + error.message + '\\n💡 Fix: Add await before async operations: await axios.get(), await sharp().resize()');
							}
							// Re-throw with original stack for debugging
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
				// Execute code for each item
				const results: INodeExecutionData[] = [];

				for (let i = 0; i < items.length; i++) {
					const sandbox = await createEnhancedSandbox([items[i]]);
					const context = createContext(sandbox);

					const wrappedCode = `
						(async function() {
							const executionStartTime = Date.now();
							let operationCount = 0;
							const maxOperations = 100000;
							
							const checkTimeout = () => {
								operationCount++;
								if (operationCount > maxOperations) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E009]\\n📍 Issue: Possible infinite loop detected\\n💡 Fix: Check for infinite while/for loops, add break conditions');
								}
								if (Date.now() - executionStartTime > ${timeout * 1000}) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E010]\\n📍 Issue: Code execution timeout (${timeout}s)\\n💡 Fix: 1) Reduce data processing 2) Use async/await 3) Increase timeout in Advanced Settings');
								}
							};
							
							// 🚀 Libraries are pre-loaded as globals in the sandbox - no require needed!
							
							try {
								${code}
							} catch (error) {
								if (error.name === 'TypeError') {
									if (error.message.includes('undefined')) {
										throw new Error('🤖 LLM-FRIENDLY ERROR [E005]\\n📍 Issue: ' + error.message + '\\n💡 Fix: Check if variable exists before using: if (variable) { ... }');
									}
									if (error.message.includes('not a function')) {
										throw new Error('🤖 LLM-FRIENDLY ERROR [E003]\\n📍 Issue: ' + error.message + '\\n💡 Fix: 1) Check method name spelling 2) Ensure library is loaded 3) Check object has method');
									}
								}
								if (error.name === 'ReferenceError') {
									// Don't intercept ReferenceErrors for known lazy-loaded libraries
									const knownLibraries = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];
									const isKnownLibrary = knownLibraries.some(lib => error.message.includes(lib + ' is not defined'));
									if (!isKnownLibrary) {
										throw new Error('🤖 LLM-FRIENDLY ERROR [E004]\\n📍 Issue: ' + error.message + '\\n💡 Fix: 1) Declare variable first 2) Check spelling 3) Import library if needed');
									}
									// Re-throw original error for known libraries to allow lazy loading
									throw error;
								}
								if (error.message.includes('await')) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E006]\\n📍 Issue: ' + error.message + '\\n💡 Fix: Add await before async operations: await axios.get(), await sharp().resize()');
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
								json: { error: error.message, originalData: items[i].json },
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
				`Code execution failed: ${error.message}\\n\\nStack trace:\\n${error.stack}`,
			);
		}
	}
}
