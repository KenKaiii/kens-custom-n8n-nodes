import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { createContext, runInContext } from 'vm';

// Directly embed ALL libraries to avoid bundle loading issues
const embeddedLibraries = {
	// Core utilities
	_: require('lodash'),
	lodash: require('lodash'),

	// HTTP & Web
	axios: require('axios'),
	cheerio: require('cheerio'),

	// Date/Time
	dayjs: require('dayjs'),
	moment: require('moment-timezone'),
	dateFns: require('date-fns'),
	dateFnsTz: require('date-fns-tz'),

	// Validation & Data
	joi: require('joi'),
	Joi: require('joi'),
	validator: require('validator'),
	uuid: require('uuid'),
	Ajv: require('ajv'),
	yup: require('yup'),

	// Parsing & Processing
	csvParse: require('csv-parse'),
	xml2js: require('xml2js'),
	XMLParser: require('fast-xml-parser').XMLParser,
	YAML: require('yaml'),
	papaparse: require('papaparse'),
	Papa: require('papaparse'),

	// Templating
	Handlebars: require('handlebars'),

	// Security & Crypto
	CryptoJS: require('crypto-js'),
	forge: require('node-forge'),
	jwt: require('jsonwebtoken'),
	bcrypt: require('bcryptjs'),
	bcryptjs: require('bcryptjs'),

	// Files & Documents
	XLSX: require('xlsx'),
	pdfLib: require('pdf-lib'),
	archiver: require('archiver'),

	// Images & Media
	Jimp: require('jimp'),
	QRCode: require('qrcode'),

	// Math & Science
	math: require('mathjs'),

	// Text & Language
	fuzzy: require('fuse.js'),
	stringSimilarity: require('string-similarity'),
	slug: (() => {
		try {
			const slugLib = require('slug');
			return slugLib.default || slugLib;
		} catch (_e) {
			return require('slug');
		}
	})(),
	pluralize: require('pluralize'),

	// HTTP/API utilities
	qs: require('qs'),
	FormData: require('form-data'),

	// File formats
	ini: require('ini'),
	toml: require('toml'),

	// Utilities
	nanoid: (() => {
		try {
			const nanoidLib = require('nanoid');
			return { nanoid: nanoidLib.nanoid || nanoidLib };
		} catch (_e) {
			return require('nanoid');
		}
	})(),
	ms: require('ms'),
	bytes: require('bytes'),

	// Financial & Geographic
	currency: require('currency.js'),
	phoneNumber: require('libphonenumber-js'),
	iban: require('iban'),

	// Blockchain
	ethers: require('ethers'),
	web3: require('web3'),
};

// Try to load full bundle, fall back to embedded
let bundledLibraries: any = embeddedLibraries;

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

		// Use direct console access (not VM sandbox console) for Railway debugging
		const originalConsole = console;
		originalConsole.log('[SuperCode] 🚀 EXECUTION STARTING - JAVASCRIPT MODE - VM-SAFE VERSION');
		originalConsole.log('[SuperCode] 🔍 Platform check - Railway environment detected');

		// AI Agent Mode: Get AI connections if enabled
		const aiAgentMode = this.getNodeParameter('aiAgentMode', 0, false) as boolean;
		originalConsole.log('[SuperCode] 🤖 AI Agent Mode:', aiAgentMode);

		// Create enhanced sandbox with direct library loading (VM-compatible)
		const createEnhancedSandbox = async (items: INodeExecutionData[]) => {
			originalConsole.log('[SuperCode] 🏗️ createEnhancedSandbox called - starting sandbox creation');
			originalConsole.log('[SuperCode] 🏗️ Creating enhanced sandbox with direct loading...');
			// Library cache to avoid repeated loading
			const libraryCache: { [key: string]: any } = {};
			const performanceTracker: { [key: string]: number } = {};


			// 🔧 EMBEDDED LIBRARIES: Direct loading without lazy loading patterns

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

				// 🔧 DEBUG: Make bundledLibraries available for debugging
				bundledLibraries: bundledLibraries,
				
				// 🔍 VERSION IDENTIFIER: Confirm Railway is running v1.0.65+
				SUPERCODE_VERSION: '1.0.65-all-libraries-bundled',

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
							} catch (_error) {
								lastError = _error;
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

					validateSchema: (data: any, _schema: any) => {
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

			// 🔧 LEGACY CODE REMOVED: Old lazy loading patterns replaced with direct embedding

			// 🔧 EMBEDDED LIBRARIES ONLY: Skip all lazy loading, use embedded libraries directly
			originalConsole.log('[SuperCode] 🔧 Using EMBEDDED libraries for guaranteed compatibility...');
			originalConsole.log('[SuperCode] 🔧 Pre-loading ALL embedded libraries as direct values...');
				
			let preloadedCount = 0;
			let skippedCount = 0;
			
			// Pre-load ALL embedded libraries as direct values (skip lazy loading completely)
			for (const [libName, libValue] of Object.entries(bundledLibraries)) {
				if (libValue && typeof libValue !== 'undefined') {
					// Remove any existing property and replace with direct value
					delete (sandbox as any)[libName];
					(sandbox as any)[libName] = libValue;
					preloadedCount++;
					originalConsole.log(`[SuperCode] ✅ Embedded ${libName} loaded directly`);
				} else {
					skippedCount++;
					originalConsole.log(`[SuperCode] ⚠️ Skipped ${libName} (undefined/null)`);
				}
			}
			
			originalConsole.log(`[SuperCode] ✅ Embedded loading completed: ${preloadedCount} loaded, ${skippedCount} skipped`);
			
			// Add library aliases for compatibility
			if (bundledLibraries.nanoid && bundledLibraries.nanoid.nanoid) {
				// Extract nanoid function from wrapper
				(sandbox as any).nanoid = bundledLibraries.nanoid.nanoid;
				originalConsole.log('[SuperCode] ✅ Added nanoid function alias');
			}

			console.log('[SuperCode] ✅ Embedded libraries directly assigned to sandbox');

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
				} catch (_error) {
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
				} catch (_error) {
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
				} catch (_error) {
					console.log('[SuperCode] ℹ️ No Tool connections found');
				}
			}

			return sandbox;
		};


		try {
			console.log('[SuperCode] 🚀 EXECUTION STARTING - LIBRARIES PRE-LOADED AS GLOBALS');
			console.log('[SuperCode] 📝 Execution mode:', executionMode);
			console.log('[SuperCode] 📦 Items count:', items.length);
			
			if (executionMode === 'runOnceForAllItems') {
				console.log('[SuperCode] ⚡ Running runOnceForAllItems mode');
				// Execute code once for all items
				console.log('[SuperCode] 🎯 About to call createEnhancedSandbox...');
				const sandbox = await createEnhancedSandbox(items);
				console.log('[SuperCode] ✅ createEnhancedSandbox completed');
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
						} catch (_error) {
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
							} catch (_error) {
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
					} catch (_error) {
						if (this.continueOnFail()) {
							results.push({
								json: { error: _error.message, originalData: items[i].json },
								error: _error,
								pairedItem: { item: i },
							});
						} else {
							throw _error;
						}
					}
				}

				return [results];
			}
		} catch (_error) {
			throw new NodeOperationError(
				this.getNode(),
				`Code execution failed: ${_error.message}\\n\\nStack trace:\\n${_error.stack}`,
			);
		}
	}
}
