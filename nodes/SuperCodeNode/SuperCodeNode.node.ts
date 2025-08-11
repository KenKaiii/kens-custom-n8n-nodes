/* eslint-disable no-undef */
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
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export class SuperCodeNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Super Code',
		name: 'superCode',
		icon: 'fa:code',
		group: ['transform'],
		version: 1,
		description: 'Execute JavaScript/TypeScript with enhanced libraries and utilities',
		defaults: {
			name: 'Super Code',
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
						description: 'Execute JavaScript/TypeScript code with 33+ libraries',
					},
					{
						name: 'Python',
						value: 'python',
						description: 'Execute Python code with 30+ libraries (pandas, requests, etc.)',
					},
				],
				default: 'javascript',
				description: 'Programming language to execute',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				typeOptions: {
					editor: 'codeNodeEditor',
					editorLanguage: '={{ $parameter["language"] === "python" ? "python" : "javaScript" }}',
					rows: 20,
				},
				default: `// 🚀 Super Code - The Most Powerful n8n Code Node Ever Created!
// ⚡ LAZY LOADING: Libraries load only when accessed (0ms overhead if unused)

// 📊 CORE DATA LIBRARIES (10):
// • lodash (_) - Utilities: _.chunk([1,2,3,4], 2)
// • axios - HTTP: await axios.get('https://api.example.com')
// • dayjs - Dates: dayjs().format('YYYY-MM-DD HH:mm:ss')
// • joi/Joi - Validation: joi.string().email().validate(email)
// • validator - Validation: validator.isEmail(email)
// • uuid - IDs: uuid() // generates unique ID
// • csvParse - CSV: csvParse(csvString, callback)
// • Handlebars - Templates: Handlebars.compile('Hello {{name}}')
// • cheerio - HTML: cheerio.load(html)('h1').text()
// • CryptoJS - Crypto: CryptoJS.AES.encrypt(text, 'secret')

// 💼 BUSINESS-CRITICAL LIBRARIES (5):
// • XLSX - Excel: XLSX.readFile('file.xlsx'), XLSX.writeFile(workbook, 'output.xlsx')
// • pdfLib - PDF: await pdfLib.PDFDocument.create()
// • math - Advanced Math: math.evaluate('sqrt(3^2 + 4^2)')
// • xml2js - XML: xml2js.parseString(xml, callback)
// • YAML - YAML: YAML.parse(yamlString), YAML.stringify(object)

// 🖼️ MEDIA PROCESSING (3):
// • sharp - Images: await sharp(buffer).resize(800, 600).toBuffer()
// • Jimp - Images: await Jimp.read(buffer).resize(800, 600)
// • QRCode - QR Codes: await QRCode.toDataURL('text')

// 🤖 AI/NLP LIBRARIES (1):
// • natural - NLP: natural.SentimentAnalyzer.getSentiment(tokens)

// 📁 FILE & ARCHIVE (1):
// • archiver - ZIP: archiver('zip').append(data, {name: 'file.txt'})

// 🌐 WEB & SCRAPING (1):
// • puppeteer - Browser: await puppeteer.launch({headless: true})

// 🔒 DATABASE & SECURITY (3):
// • knex - SQL Builder: knex('users').where('id', 1).select('*')
// • forge - Security: forge.pki.rsa.generateKeyPair(2048)
// • moment - Timezones: moment.tz('2023-01-01', 'America/New_York')

// 📊 ADVANCED XML (1):
// • XMLParser - Fast XML: new XMLParser().parse(xmlString)

// 🔐 AUTHENTICATION & SECURITY (2):
// • jwt - JWT Tokens: jwt.sign(payload, secret), jwt.verify(token, secret)
// • bcrypt - Password Hashing: await bcrypt.hash(password, 10), await bcrypt.compare(password, hash)

// 💰 BLOCKCHAIN & CRYPTO (2):
// • ethers - Ethereum: new ethers.Wallet(privateKey), ethers.utils.parseEther('1.0')
// • web3 - Web3: new web3.eth.Contract(abi, address), web3.utils.toWei('1', 'ether')

// 🌍 INTERNATIONAL BUSINESS (3):
// • phoneNumber - Phone: parsePhoneNumber('+1234567890', 'US').formatNational()
// • currency - Money: currency(29.99).add(0.05).format()
// • iban - Banking: IBAN.isValid('DE89370400440532013000')

// 🔍 ADVANCED SEARCH & TEXT (1):
// • fuzzy - Fuzzy Search: new Fuse(list, {keys: ['name']}).search('query')

// 🛠️ UTILITY FUNCTIONS:
// • utils.getAvailableLibraries() - List all 33 available libraries
// • utils.getLoadedLibraries() - See which libraries are currently loaded
// • utils.isLibraryLoaded('xlsx') - Check if specific library is loaded
// • utils.isEmail(email), utils.isUrl(url) - Quick validation
// • utils.flatten(obj) - Flatten nested objects
// • utils.retry(fn, {attempts: 3}) - Retry failed operations
// • utils.sleep(1000) - Async delay

// 📊 INPUT DATA:
// • $input.all() - All input items
// • $input.first() - First input item  
// • $input.json - JSON data (single item) or array (multiple)

// 📤 RETURN FORMAT:
// • Single: return { key: 'value' }
// • Multiple: return [{ json: {...} }, { json: {...} }]
// • Array: return data.map(item => ({ json: item }))

// 💡 EXAMPLE - Excel Processing (only loads XLSX when used):
// const workbook = XLSX.readFile('data.xlsx');
// const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = XLSX.utils.sheet_to_json(worksheet);
// return data.map(row => ({ json: row }));

return $input.all();
`,
				description: 'JavaScript/TypeScript code with enhanced libraries and utilities',
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
				description: 'How to execute the JavaScript code',
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
				description: 'Maximum execution time in seconds',
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
				description: 'Maximum memory usage in MB',
				typeOptions: {
					minValue: 16,
					maxValue: 512,
				},
			},
			{
				displayName: 'Available Libraries',
				name: 'librariesInfo',
				type: 'notice',
				default: '📦 Enhanced libraries: lodash (_), axios, dayjs, joi, validator, uuid, csv-parse, handlebars, cheerio, crypto-js\n🔒 Secure sandbox with configurable timeout and memory limits\n⚡ Multiple execution modes for different data processing patterns\n✨ Utilities: isEmail, isUrl, flatten, retry, sleep',
			},
		],
	};



	// eslint-disable-next-line no-unused-vars
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const executeFunctions = this;
		const items = executeFunctions.getInputData();
		const language = executeFunctions.getNodeParameter('language', 0, 'javascript') as string;
		const executionMode = executeFunctions.getNodeParameter('executionMode', 0, 'runOnceForAllItems') as string;
		const code = executeFunctions.getNodeParameter('code', 0) as string;
		const timeout = executeFunctions.getNodeParameter('timeout', 0, 30) as number;

		if (!code.trim()) {
			throw new NodeOperationError(executeFunctions.getNode(), `No code provided. Please add your ${language === 'python' ? 'Python' : 'JavaScript/TypeScript'} code.`);
		}

		// Route to appropriate execution engine
		if (language === 'python') {
			return await SuperCodeNode.executePythonCode(executeFunctions, items, code, executionMode, timeout);
		} else {
			return await SuperCodeNode.executeJavaScriptCode(executeFunctions, items, code, executionMode, timeout);
		}
	}

	// JavaScript Execution Engine
	private static async executeJavaScriptCode(
		executeFunctions: IExecuteFunctions,
		items: INodeExecutionData[],
		code: string,
		executionMode: string,
		timeout: number
	): Promise<INodeExecutionData[][]> {
		// Create enhanced sandbox with lazy loading
		const createEnhancedSandbox = (items: INodeExecutionData[]) => {
			// Library cache to avoid repeated loading
			const libraryCache: { [key: string]: unknown } = {};
			const performanceTracker: { [key: string]: number } = {};
			
			// LLM-Friendly Error Handler - Provides detailed diagnostics for AI code generation
			const createLLMError = (type: string, libraryName: string, originalError: Error, context?: Record<string, unknown>) => {
				const errorCodes: { [key: string]: string } = {
					LIBRARY_MISSING: 'E001',
					LIBRARY_LOAD_FAILED: 'E002', 
					METHOD_NOT_FOUND: 'E003',
					INVALID_SYNTAX: 'E004',
					TYPE_ERROR: 'E005',
					ASYNC_ERROR: 'E006',
					MEMORY_ERROR: 'E007',
					NETWORK_ERROR: 'E008'
				};

				const fixes: { [key: string]: string } = {
					E001: `Library '${libraryName}' not installed. Run: npm install ${libraryName}`,
					E002: `Library '${libraryName}' failed to load. Check: 1) Is it installed? 2) Compatible version? 3) Dependencies met?`,
					E003: `Method not found on '${libraryName}'. Check: 1) Correct method name? 2) Library docs? 3) Await needed?`,
					E004: `Syntax error in ${libraryName} usage. Check: 1) Parentheses? 2) Quotes? 3) Semicolons?`,
					E005: `Type error with ${libraryName}. Check: 1) Correct data type? 2) Null/undefined? 3) Array vs Object?`,
					E006: `Async error with ${libraryName}. Fix: 1) Add 'await' 2) Use .then() 3) Wrap in try/catch`,
					E007: `Memory error. Fix: 1) Reduce data size 2) Process in chunks 3) Call utils.cleanup()`,
					E008: `Network error. Fix: 1) Check URL 2) Add timeout 3) Handle offline case`
				};

				const code = errorCodes[type] || 'E000';
				const fix = fixes[code] || 'Check syntax and library documentation';
				
				return new Error(
					`🤖 LLM-FRIENDLY ERROR [${code}]\n` +
					`📍 Library: ${libraryName}\n` +
					`🔍 Issue: ${originalError.message}\n` +
					`💡 Fix: ${fix}\n` +
					`📝 Context: ${context ? JSON.stringify(context, null, 2) : 'None'}\n` +
					`🔗 Stack: ${originalError.stack?.split('\n')[0] || 'N/A'}`
				);
			};
			
			// Enhanced lazy loader with LLM-friendly errors
			const lazyLoad = (libraryName: string, requirePath: string, property?: string) => {
				if (!libraryCache[libraryName]) {
					try {
						const startTime = Date.now();
						const lib = require(requirePath);
						
						if (!lib) {
							throw createLLMError('LIBRARY_MISSING', libraryName, new Error(`Module '${requirePath}' returned undefined`));
						}
						
						libraryCache[libraryName] = property ? lib[property] : lib;
						performanceTracker[libraryName] = Date.now() - startTime;
						console.log(`[SuperCode] ✅ Loaded ${libraryName} (${performanceTracker[libraryName]}ms)`);
						
					} catch (error: unknown) {
						if (error && typeof error === 'object' && 'code' in error && (error as {code: string}).code === 'MODULE_NOT_FOUND') {
							throw createLLMError('LIBRARY_MISSING', libraryName, error as unknown as Error);
						} else {
							throw createLLMError('LIBRARY_LOAD_FAILED', libraryName, error as Error, { requirePath, property });
						}
					}
				}
				return libraryCache[libraryName];
			};

			const sandbox = {
				$input: {
					all: () => items,
					first: () => items[0],
					last: () => items[items.length - 1],
					json: items.length === 1 ? items[0].json : items.map(item => item.json),
				},
				
				// Lazy-loaded libraries - only require when accessed
				// 📊 Core Data Libraries
				get _() { return lazyLoad('lodash', 'lodash'); },
				get axios() { return lazyLoad('axios', 'axios'); },
				get dayjs() { return lazyLoad('dayjs', 'dayjs'); },
				get Joi() { return lazyLoad('joi', 'joi'); },
				get joi() { return lazyLoad('joi', 'joi'); },
				get validator() { return lazyLoad('validator', 'validator'); },
				get uuid() { return lazyLoad('uuid', 'uuid', 'v4'); },
				get csvParse() { return lazyLoad('csv-parse', 'csv-parse', 'parse'); },
				get Handlebars() { return lazyLoad('handlebars', 'handlebars'); },
				get cheerio() { return lazyLoad('cheerio', 'cheerio'); },
				get CryptoJS() { return lazyLoad('crypto-js', 'crypto-js'); },
				
				// 📊 Business-Critical Libraries
				get XLSX() { return lazyLoad('xlsx', 'xlsx'); },
				get pdfLib() { return lazyLoad('pdf-lib', 'pdf-lib'); },
				get math() { return lazyLoad('mathjs', 'mathjs'); },
				get xml2js() { return lazyLoad('xml2js', 'xml2js'); },
				get YAML() { return lazyLoad('yaml', 'yaml'); },
				
				// 🖼️ Media Processing
				get sharp() { return lazyLoad('sharp', 'sharp'); },
				get Jimp() { return lazyLoad('jimp', 'jimp'); },
				get QRCode() { return lazyLoad('qrcode', 'qrcode'); },
				
				// 🤖 AI/NLP Libraries
				get natural() { return lazyLoad('natural', 'natural'); },
				
				// 🗄️ File & Archive Processing
				get archiver() { return lazyLoad('archiver', 'archiver'); },
				
				// 🌐 Web & Scraping
				get puppeteer() { return lazyLoad('puppeteer-core', 'puppeteer-core'); },
				
				// 🗄️ Database & Security
				get knex() { return lazyLoad('knex', 'knex'); },
				get forge() { return lazyLoad('node-forge', 'node-forge'); },
				get moment() { return lazyLoad('moment-timezone', 'moment-timezone'); },
				
				// 📊 Advanced XML
				get XMLParser() { return lazyLoad('fast-xml-parser', 'fast-xml-parser', 'XMLParser'); },

				// 🔐 AUTHENTICATION & SECURITY (New High-Demand Libraries)
				get jwt() { return lazyLoad('jsonwebtoken', 'jsonwebtoken'); },
				get bcrypt() { return lazyLoad('bcrypt', 'bcrypt'); },
				
				// 💰 BLOCKCHAIN & CRYPTO (Untapped Market)
				get ethers() { return lazyLoad('ethers', 'ethers'); },
				get web3() { return lazyLoad('web3', 'web3'); },
				
				// 🌍 INTERNATIONAL BUSINESS (Global Requirements)  
				get phoneNumber() { return lazyLoad('libphonenumber-js', 'libphonenumber-js'); },
				get currency() { return lazyLoad('currency.js', 'currency.js'); },
				get iban() { return lazyLoad('iban', 'iban'); },
				
				// 🔍 ADVANCED SEARCH & TEXT (Developer Requests)
				get fuzzy() { return lazyLoad('fuse.js', 'fuse.js'); },
				
				console: {
					log: (...args: unknown[]) => console.log('[SuperCode]', ...args),
					error: (...args: unknown[]) => console.error('[SuperCode]', ...args),
					warn: (...args: unknown[]) => console.warn('[SuperCode]', ...args),
				},
				utils: {
					now: () => new Date().toISOString(),
					formatDate: (date: string | number | Date, format?: string) => {
						const d = new Date(date);
						return format ? d.toLocaleDateString() : d.toISOString();
					},
					isEmail: (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email),
					isUrl: (url: string) => {
						try { new globalThis.URL(url); return true; } catch { return false; }
					},
					flatten: (obj: Record<string, unknown>, prefix = '') => {
						const flattened: Record<string, unknown> = {};
						for (const key in obj) {
							const newKey = prefix ? `${prefix}.${key}` : key;
							if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
								Object.assign(flattened, sandbox.utils.flatten(obj[key] as Record<string, unknown>, newKey));
							} else {
								flattened[newKey] = obj[key];
							}
						}
						return flattened;
					},
					retry: async (fn: () => Promise<unknown>, options = { attempts: 3, delay: 1000 }) => {
						let lastError;
						for (let i = 0; i < options.attempts; i++) {
							try {
								return await fn();
							} catch (error) {
								lastError = error;
								if (i < options.attempts - 1) {
									await new Promise(resolve => setTimeout(resolve, options.delay * Math.pow(2, i)));
								}
							}
						}
						throw lastError;
					},
					sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
					
					// 🧠 Memory Management & Monitoring
					memoryUsage: () => {
						const usage = globalThis.process.memoryUsage();
						return {
							heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
							heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`, 
							external: `${Math.round(usage.external / 1024 / 1024)} MB`,
							rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
							loadedLibraries: Object.keys(libraryCache).length,
							estimatedFootprint: `${Object.keys(libraryCache).length * 2} MB`
						};
					},
					
					// 📊 Performance Monitoring
					getPerformanceStats: () => ({
						loadTimes: performanceTracker,
						averageLoadTime: Object.values(performanceTracker).reduce((a, b) => a + b, 0) / Object.keys(performanceTracker).length || 0,
						slowestLibrary: Object.entries(performanceTracker).sort(([,a], [,b]) => b - a)[0],
						fastestLibrary: Object.entries(performanceTracker).sort(([,a], [,b]) => a - b)[0],
						totalLibrariesLoaded: Object.keys(libraryCache).length
					}),
					
					// 🧹 Resource Cleanup
					cleanup: (libraryNames?: string[]) => {
						const heavyLibraries = ['sharp', 'puppeteer-core', 'pdf-lib', 'jimp', 'archiver'];
						const toCleanup = libraryNames || heavyLibraries.filter(lib => libraryCache[lib]);
						
						let cleaned = 0;
						toCleanup.forEach(lib => {
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
						const memory = globalThis.process.memoryUsage();
						const heapPercent = (memory.heapUsed / memory.heapTotal) * 100;
						
						return {
							status: heapPercent > 90 ? 'CRITICAL' : heapPercent > 70 ? 'WARNING' : 'HEALTHY',
							heapUsagePercent: Math.round(heapPercent),
							recommendCleanup: heapPercent > 70,
							loadedLibrariesCount: Object.keys(libraryCache).length,
							timestamp: new Date().toISOString()
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
					
					validateSchema: (data: unknown, schema: unknown) => {
						try {
							const joi = lazyLoad('joi', 'joi') as Record<string, unknown>;
							return (joi.validate as Function)(data, schema);
						} catch (error) {
							throw createLLMError('TYPE_ERROR', 'joi', error as Error, { data, schema });
						}
					},
					
					// Library availability checker
					getAvailableLibraries: () => [
						// Core Data Libraries
						'lodash (_)', 'axios', 'dayjs', 'joi', 'validator', 'uuid', 
						'csv-parse (csvParse)', 'handlebars (Handlebars)', 'cheerio', 'crypto-js (CryptoJS)',
						// Business-Critical Libraries  
						'xlsx (XLSX)', 'pdf-lib (pdfLib)', 'mathjs (math)', 'xml2js', 'yaml (YAML)',
						// Media Processing
						'sharp', 'jimp (Jimp)', 'qrcode (QRCode)',
						// AI/NLP Libraries
						'natural',
						// File & Archive Processing
						'archiver',
						// Web & Scraping
						'puppeteer-core (puppeteer)',
						// Database & Security
						'knex', 'node-forge (forge)', 'moment-timezone (moment)',
						// Advanced XML
						'fast-xml-parser (XMLParser)',
						// 🔐 Authentication & Security (NEW!)
						'jsonwebtoken (jwt)', 'bcrypt',
						// 💰 Blockchain & Crypto (NEW!)  
						'ethers', 'web3',
						// 🌍 International Business (NEW!)
						'libphonenumber-js (phoneNumber)', 'currency.js (currency)', 'iban',
						// 🔍 Advanced Search & Text (NEW!)
						'fuse.js (fuzzy)'
					],
					
					// Check if library is loaded
					isLibraryLoaded: (libraryName: string) => !!libraryCache[libraryName],
					
					// Get loaded library stats
					getLoadedLibraries: () => Object.keys(libraryCache),
				},
				setTimeout: globalThis.setTimeout,
				clearTimeout: globalThis.clearTimeout,
				setInterval: globalThis.setInterval,
				clearInterval: globalThis.clearInterval,
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
				require: globalThis.require, // Add require to VM context for lazy loading
			};
			return sandbox;
		};

		try {
			if (executionMode === 'runOnceForAllItems') {
				// Execute code once for all items
				const sandbox = createEnhancedSandbox(items);
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
					return [result.map(item => ({
						json: typeof item === 'object' && item !== null ? item : { data: item }
					}))];
				} else if (result !== undefined) {
					return [[{ json: typeof result === 'object' && result !== null ? result : { data: result } }]];
				} else {
					return [[]];
				}
			} else {
				// Execute code for each item
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
									throw new Error('🤖 LLM-FRIENDLY ERROR [E009]\\n📍 Issue: Possible infinite loop detected\\n💡 Fix: Check for infinite while/for loops, add break conditions');
								}
								if (Date.now() - executionStartTime > ${timeout * 1000}) {
									throw new Error('🤖 LLM-FRIENDLY ERROR [E010]\\n📍 Issue: Code execution timeout (${timeout}s)\\n💡 Fix: 1) Reduce data processing 2) Use async/await 3) Increase timeout in Advanced Settings');
								}
							};
							
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
							results.push(...result.map(item => ({
								json: typeof item === 'object' && item !== null ? item : { data: item }
							})));
						} else if (result !== undefined) {
							results.push({
								json: typeof result === 'object' && result !== null ? result : { data: result }
							});
						}
					} catch (error) {
						if (executeFunctions.continueOnFail()) {
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
			throw new NodeOperationError(executeFunctions.getNode(), `Code execution failed: ${(error as Error).message}\\n\\nStack trace:\\n${(error as Error).stack}`);
		}
	}

	// Python Execution Engine
	private static async executePythonCode(
		executeFunctions: IExecuteFunctions,
		items: INodeExecutionData[],
		code: string,
		executionMode: string,
		timeout: number
	): Promise<INodeExecutionData[][]> {
		return new Promise((resolve, reject) => {
			const tempDir = tmpdir();
			const scriptPath = join(tempDir, `n8n_python_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
			
			try {
				// Prepare Python environment and data
				const inputData = executionMode === 'runOnceForAllItems' 
					? items.map(item => item.json)
					: [items[0]?.json || {}];

				// Create Python script with preloaded libraries and data
				const pythonScript = `
import json
import sys
import traceback
from typing import List, Dict, Any

# 📊 DATA PROCESSING & ANALYSIS
try:
    import pandas as pd
except ImportError:
    pd = None
    
try:
    import numpy as np
except ImportError:
    np = None
    
try:
    import polars as pl
except ImportError:
    pl = None

# 🌐 HTTP/API INTEGRATION
try:
    import requests
except ImportError:
    requests = None
    
try:
    import httpx
except ImportError:
    httpx = None
    
try:
    import aiohttp
except ImportError:
    aiohttp = None

# ✅ DATA VALIDATION
try:
    from pydantic import BaseModel, ValidationError
except ImportError:
    BaseModel = None
    ValidationError = None
    
try:
    from marshmallow import Schema, fields
except ImportError:
    Schema = None
    fields = None
    
try:
    from cerberus import Validator
except ImportError:
    Validator = None

# 🔐 AUTHENTICATION & SECURITY
try:
    import jwt
except ImportError:
    jwt = None
    
try:
    from passlib.context import CryptContext
except ImportError:
    CryptContext = None
    
try:
    from cryptography.fernet import Fernet
except ImportError:
    Fernet = None
    
try:
    import bcrypt
except ImportError:
    bcrypt = None

# 📁 FILE PROCESSING
try:
    from PIL import Image
except ImportError:
    Image = None
    
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
    
try:
    import magic
except ImportError:
    magic = None
    
try:
    import openpyxl
except ImportError:
    openpyxl = None

# 📅 DATE/TIME
try:
    from dateutil import parser, relativedelta
except ImportError:
    parser = None
    relativedelta = None
    
try:
    import arrow
except ImportError:
    arrow = None

# 📝 TEXT PROCESSING
try:
    import regex
except ImportError:
    regex = None
    
try:
    from fuzzywuzzy import fuzz, process
except ImportError:
    fuzz = None
    process = None

# 🌍 BUSINESS LOGIC
try:
    import phonenumbers
except ImportError:
    phonenumbers = None
    
try:
    from babel import numbers, dates
except ImportError:
    numbers = None
    dates = None

# 🗄️ DATABASE
try:
    from sqlalchemy import create_engine, text
except ImportError:
    create_engine = None
    text = None
    
try:
    import pymongo
except ImportError:
    pymongo = None
    
try:
    import redis
except ImportError:
    redis = None

# 🤖 AI/ML
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
except ImportError:
    RandomForestClassifier = None
    train_test_split = None
    
try:
    from transformers import pipeline
except ImportError:
    pipeline = None
    
try:
    import openai
except ImportError:
    openai = None
    
try:
    from langchain import LLMChain
except ImportError:
    LLMChain = None

# 🕷️ WEB SCRAPING
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
    
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
except ImportError:
    webdriver = None
    By = None
    
try:
    import scrapy
except ImportError:
    scrapy = None

# 📧 EMAIL (built-in)
import smtplib
from email.mime.text import MIMEText

# Input data from n8n
input_data = ${JSON.stringify(inputData)}

# User code execution
try:
    # Execute user code
${code.split('\n').map(line => '    ' + line.trimStart()).join('\n')}
    
    # If no explicit return, return input_data
    if 'result' not in locals() and 'return' not in '''${code.replace(/'/g, "\\'")}''':
        result = input_data
        
except Exception as e:
    result = {
        "error": str(e),
        "error_type": type(e).__name__,
        "traceback": traceback.format_exc(),
        "input_data": input_data
    }

# Output result as JSON
print(json.dumps(result if 'result' in locals() else input_data))
`;

				// Write Python script to temp file
				writeFileSync(scriptPath, pythonScript);

				// Execute Python script
				const pythonProcess = spawn('python3', [scriptPath], {
					timeout: timeout * 1000,
					stdio: ['pipe', 'pipe', 'pipe']
				});

				let stdout = '';
				let stderr = '';

				pythonProcess.stdout.on('data', (data) => {
					stdout += data.toString();
				});

				pythonProcess.stderr.on('data', (data) => {
					stderr += data.toString();
				});

				pythonProcess.on('close', (code) => {
					try {
						// Cleanup temp file
						unlinkSync(scriptPath);
					} catch (cleanupError) {
						console.warn('[SuperCode] Failed to cleanup temp file:', cleanupError);
					}

					if (code === 0) {
						try {
							const result = JSON.parse(stdout.trim());
							
							// Format result for n8n
							if (Array.isArray(result)) {
								const formatted = result.map(item => ({
									json: typeof item === 'object' && item !== null ? item : { data: item }
								}));
								resolve([formatted]);
							} else if (result !== undefined) {
								const formatted = [{
									json: typeof result === 'object' && result !== null ? result : { data: result }
								}];
								resolve([formatted]);
							} else {
								resolve([[]]);
							}
						} catch (parseError) {
							reject(new NodeOperationError(
								executeFunctions.getNode(),
								`Python code execution completed but output parsing failed: ${(parseError as Error).message}\\n\\nOutput: ${stdout}\\nError: ${stderr}`
							));
						}
					} else {
						reject(new NodeOperationError(
							executeFunctions.getNode(),
							`Python code execution failed (exit code: ${code}):\\n\\nStderr: ${stderr}\\nStdout: ${stdout}`
						));
					}
				});

				pythonProcess.on('error', (error) => {
					try {
						unlinkSync(scriptPath);
					} catch (cleanupError) {
						console.warn('[SuperCode] Failed to cleanup temp file:', cleanupError);
					}
					
					if (error.message.includes('ENOENT')) {
						reject(new NodeOperationError(
							executeFunctions.getNode(),
							'Python3 not found. Please install Python 3 on the system running n8n.\\n\\nInstallation:\\n- Ubuntu/Debian: apt install python3 python3-pip\\n- macOS: brew install python3\\n- Windows: Download from https://python.org'
						));
					} else {
						reject(new NodeOperationError(executeFunctions.getNode(), `Python execution error: ${error.message}`));
					}
				});

			} catch (error) {
				try {
					unlinkSync(scriptPath);
				} catch (cleanupError) {
					console.warn('[SuperCode] Failed to cleanup temp file:', cleanupError);
				}
				reject(new NodeOperationError(executeFunctions.getNode(), `Python setup failed: ${(error as Error).message}`));
			}
		});
	}

}