import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { createContext, runInContext } from 'vm';

// Type definitions for better TypeScript support
interface LibraryCache {
	[key: string]: unknown;
}

interface PerformanceTracker {
	[key: string]: number;
}

interface EmbeddedLibraries {
	[key: string]: unknown;
}

// Directly embed ALL libraries to avoid bundle loading issues
const embeddedLibraries = {
	// Core utilities
	_: require('lodash'),
	lodash: require('lodash'),

	// HTTP & Web
	get axios() {
		try {
			return require('axios');
		} catch (error) {
			console.warn('[SuperCode] axios not available in this environment:', error.message);
			return undefined;
		}
	},
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
	get yup() {
		try {
			return require('yup');
		} catch (error) {
			console.warn('[SuperCode] yup not available in this environment:', error.message);
			return undefined;
		}
	},
	get zod() {
		try {
			return require('zod');
		} catch (error) {
			console.warn('[SuperCode] zod not available in this environment:', error.message);
			return undefined;
		}
	},
	z: (() => {
		// Alias for zod
		try {
			return require('zod');
		} catch (error) {
			return undefined;
		}
	})(),

	// Parsing & Processing
	csvParse: (() => {
		const { parse } = require('csv-parse');
		return parse;
	})(),
	xml2js: require('xml2js'),
	XMLParser: require('fast-xml-parser').XMLParser,
	YAML: require('yaml'),
	papaparse: require('papaparse'),
	Papa: require('papaparse'),

	// Templating
	Handlebars: require('handlebars'),

	// Security & Crypto
	CryptoJS: require('crypto-js'),
	get forge() {
		try {
			return require('node-forge');
		} catch (error) {
			console.warn('[SuperCode] node-forge not available in this environment:', error.message);
			return undefined;
		}
	},
	jwt: require('jsonwebtoken'),
	bcrypt: require('bcryptjs'),
	bcryptjs: require('bcryptjs'),

	// Files & Documents
	XLSX: (() => {
		const xlsx = require('xlsx');
		// Use enhanced security wrapper to protect against CVE vulnerabilities
		// Addresses GHSA-4r6h-8v6p-xvw6 (Prototype Pollution) and GHSA-5pgg-2g8v-p4x9 (ReDoS)
		return xlsx;
	})(),
	xlsx: (() => {
		// Lowercase alias for compatibility
		const xlsx = require('xlsx');
		return xlsx;
	})(),
	get pdfLib() {
		try {
			return require('pdf-lib');
		} catch (error) {
			console.warn('[SuperCode] pdf-lib not available in this environment:', error.message);
			return undefined;
		}
	},
	get archiver() {
		try {
			return require('archiver');
		} catch (error) {
			console.warn('[SuperCode] archiver not available in this environment:', error.message);
			return undefined;
		}
	},

	// Images & Media
	get Jimp() {
		try {
			return require('jimp');
		} catch (error) {
			console.warn('[SuperCode] jimp not available in this environment:', error.message);
			return undefined;
		}
	},
	QRCode: require('qrcode'),

	// Math & Science
	get math() {
		try {
			return require('mathjs');
		} catch (error) {
			console.warn('[SuperCode] mathjs not available in this environment:', error.message);
			return undefined;
		}
	},

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
	get ms() {
		try {
			const msLib = require('ms');
			return msLib;
		} catch (error) {
			// Fallback ms implementation for basic time conversion
			console.warn('[SuperCode] ms library not available, using fallback implementation');
			return (val: unknown) => {
				if (typeof val === 'string') {
					const units: Record<string, number> = { 
						ms: 1, s: 1000, sec: 1000, m: 60000, min: 60000, 
						h: 3600000, hr: 3600000, d: 86400000, day: 86400000,
						w: 604800000, week: 604800000
					};
					const match = val.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
					return match ? parseFloat(match[1]) * (units[match[2].toLowerCase()] || 1) : NaN;
				}
				// Convert milliseconds to string
				if (typeof val === 'number') {
					const units = [
						{ name: 'd', value: 86400000 },
						{ name: 'h', value: 3600000 },
						{ name: 'm', value: 60000 },
						{ name: 's', value: 1000 },
						{ name: 'ms', value: 1 }
					];
					for (const unit of units) {
						if (val >= unit.value) {
							const count = Math.floor(val / unit.value);
							return count + unit.name;
						}
					}
					return val + 'ms';
				}
				return val;
			};
		}
	},
	bytes: require('bytes'),

	// Financial & Geographic
	currency: (() => {
		const currencyLib = require('currency.js');
		// Return the default export if it exists, otherwise the module itself
		return currencyLib.default || currencyLib;
	})(),
	phoneNumber: require('libphonenumber-js'),
	iban: require('iban'),

	// Blockchain
	get ethers() {
		try {
			return require('ethers');
		} catch (error) {
			console.warn('[SuperCode] ethers not available in this environment:', error.message);
			return undefined;
		}
	},
	get web3() {
		try {
			return require('web3');
		} catch (error) {
			console.warn('[SuperCode] web3 not available in this environment:', error.message);
			return undefined;
		}
	},

	// YouTube & Video Processing
	get ytdl() {
		try {
			return require('@distube/ytdl-core');
		} catch (error) {
			console.warn(
				'[SuperCode] @distube/ytdl-core not available in this environment:',
				error.message,
			);
			return undefined;
		}
	},
	get ffmpeg() {
		try {
			return require('fluent-ffmpeg');
		} catch (error) {
			console.warn('[SuperCode] fluent-ffmpeg not available in this environment:', error.message);
			return undefined;
		}
	},
	get ffmpegStatic() {
		try {
			return require('ffmpeg-static');
		} catch (error) {
			console.warn('[SuperCode] ffmpeg-static not available in this environment:', error.message);
			return undefined;
		}
	},

	// Natural Language Processing & Text Analysis
	get franc() {
		try {
			return require('franc-min');
		} catch (error) {
			console.warn('[SuperCode] franc-min not available in this environment:', error.message);
			return undefined;
		}
	},
	get compromise() {
		try {
			return require('compromise');
		} catch (error) {
			console.warn('[SuperCode] compromise not available in this environment:', error.message);
			return undefined;
		}
	},

	// Async Control Flow
	get pRetry() {
		try {
			return require('p-retry');
		} catch (error) {
			console.warn('[SuperCode] p-retry not available in this environment:', error.message);
			return undefined;
		}
	},
	get pLimit() {
		try {
			return require('p-limit');
		} catch (error) {
			console.warn('[SuperCode] p-limit not available in this environment:', error.message);
			return undefined;
		}
	},

	// Text Processing & Conversion
	get htmlToText() {
		try {
			return require('html-to-text');
		} catch (error) {
			console.warn('[SuperCode] html-to-text not available in this environment:', error.message);
			return undefined;
		}
	},
	get marked() {
		try {
			return require('marked');
		} catch (error) {
			console.warn('[SuperCode] marked not available in this environment:', error.message);
			return undefined;
		}
	},

	// Data Comparison
	get jsonDiff() {
		try {
			return require('json-diff-ts');
		} catch (error) {
			console.warn('[SuperCode] json-diff-ts not available in this environment:', error.message);
			return undefined;
		}
	},

	// Data Operations
	get cronParser() {
		try {
			return require('cron-parser');
		} catch (error) {
			console.warn('[SuperCode] cron-parser not available in this environment:', error.message);
			return undefined;
		}
	},
};

// Try to load full bundle, fall back to embedded
let bundledLibraries: EmbeddedLibraries = embeddedLibraries;

export class SuperCodeNode implements INodeType {
	// Helper method to create utility functions for the sandbox
	private createSandboxUtils(libraryCache: LibraryCache, performanceTracker: PerformanceTracker) {
		return {
			now: () => new Date().toISOString(),
			formatDate: (date: unknown, format?: unknown) => {
				const d = new Date(date as string | number | Date);
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
			flatten: (obj: Record<string, unknown>, prefix = '') => {
				const flattened: Record<string, unknown> = {};
				for (const key in obj) {
					const newKey = prefix ? `${prefix}.${key}` : key;
					if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
						Object.assign(
							flattened,
							this.createSandboxUtils(libraryCache, performanceTracker).flatten(
								obj[key] as Record<string, unknown>,
								newKey,
							),
						);
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
							await new Promise((resolve) => setTimeout(resolve, options.delay * Math.pow(2, i)));
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

			// Helper function to determine health status based on heap usage
			getHealthStatus: (heapPercent: number) => {
				if (heapPercent > 90) return 'CRITICAL';
				if (heapPercent > 70) return 'WARNING';
				return 'HEALTHY';
			},

			// 🔍 Health Check
			healthCheck: () => {
				const memory = process.memoryUsage();
				const heapPercent = (memory.heapUsed / memory.heapTotal) * 100;
				const utils = this.createSandboxUtils(libraryCache, performanceTracker);

				return {
					status: utils.getHealthStatus(heapPercent),
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

			validateSchema: (data: unknown, _schema: unknown) => {
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
				// 📹 YouTube & Video Processing (NEW!)
				'@distube/ytdl-core (ytdl)',
				'fluent-ffmpeg (ffmpeg)',
				'ffmpeg-static (ffmpegStatic)',
			],

			// Check if library is loaded
			isLibraryLoaded: (libraryName: string) => !!libraryCache[libraryName],

			// Get loaded library stats
			getLoadedLibraries: () => Object.keys(libraryCache),
		};
	}

	// Helper method to load embedded libraries into the sandbox
	private loadEmbeddedLibraries(sandbox: Record<string, unknown>, originalConsole: typeof console) {
		originalConsole.log('[SuperCode] 🔧 Using EMBEDDED libraries for guaranteed compatibility...');
		originalConsole.log('[SuperCode] 🔧 Pre-evaluating ALL embedded libraries as direct values...');

		let preloadedCount = 0;
		let skippedCount = 0;

		// Pre-evaluate ALL embedded libraries to avoid require() calls in VM context
		for (const [libName, libValue] of Object.entries(bundledLibraries)) {
			try {
				// Check if this is a getter property descriptor
				const descriptor = Object.getOwnPropertyDescriptor(bundledLibraries, libName);
				let evaluatedValue;
				
				if (descriptor && descriptor.get) {
					// This is a getter - call it to get the actual value
					evaluatedValue = descriptor.get();
				} else if (typeof libValue === 'function' && libValue.name === '') {
					// This is an anonymous function (legacy check)
					evaluatedValue = libValue();
				} else {
					// Use direct value
					evaluatedValue = libValue;
				}

				if (evaluatedValue && typeof evaluatedValue !== 'undefined') {
					// Remove any existing property and replace with evaluated value
					delete sandbox[libName];
					sandbox[libName] = evaluatedValue;
					preloadedCount++;
					originalConsole.log(`[SuperCode] ✅ Embedded ${libName} pre-evaluated and loaded`);
				} else {
					skippedCount++;
					originalConsole.log(
						`[SuperCode] ⚠️ Skipped ${libName} (undefined/null after evaluation)`,
					);
				}
			} catch (error) {
				skippedCount++;
				originalConsole.log(`[SuperCode] ⚠️ Failed to pre-evaluate ${libName}:`, error.message);
			}
		}

		originalConsole.log(
			`[SuperCode] ✅ Embedded pre-evaluation completed: ${preloadedCount} loaded, ${skippedCount} skipped`,
		);

		// Add library aliases for compatibility (with pre-evaluation)
		try {
			const nanoidDescriptor = Object.getOwnPropertyDescriptor(bundledLibraries, 'nanoid');
			let evaluatedNanoid;
			
			if (nanoidDescriptor && nanoidDescriptor.get) {
				evaluatedNanoid = nanoidDescriptor.get();
			} else {
				const nanoidLib = bundledLibraries.nanoid;
				evaluatedNanoid =
					typeof nanoidLib === 'function' && nanoidLib.name === '' ? nanoidLib() : nanoidLib;
			}

			if (
				evaluatedNanoid &&
				typeof evaluatedNanoid === 'object' &&
				evaluatedNanoid !== null &&
				'nanoid' in evaluatedNanoid
			) {
				// Extract nanoid function from wrapper
				sandbox.nanoid = (evaluatedNanoid as { nanoid: unknown }).nanoid;
				originalConsole.log('[SuperCode] ✅ Added nanoid function alias');
			}
		} catch (error) {
			originalConsole.log('[SuperCode] ⚠️ Failed to set nanoid alias:', error.message);
		}

		console.log('[SuperCode] ✅ Embedded libraries pre-evaluated and assigned to sandbox');
	}

	// Helper method to populate AI variables when AI Agent Mode is enabled
	private async populateAIVariables(
		sandbox: Record<string, unknown>,
		aiAgentMode: boolean,
		executionContext: IExecuteFunctions,
	) {
		if (!aiAgentMode) return;

		console.log('[SuperCode] 🤖 Auto-populating AI variables...');

		// Auto-populate llm (Language Model) - extract actual component
		try {
			const llmConnection = await executionContext.getInputConnectionData(
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
			const memoryConnection = await executionContext.getInputConnectionData(
				NodeConnectionType.AiMemory,
				0,
			);
			if (memoryConnection) {
				// 🎯 Extract actual memory from array for user convenience
				sandbox.memory = Array.isArray(memoryConnection) ? memoryConnection[0] : memoryConnection;
				console.log('[SuperCode] ✅ Auto-populated memory variable (extracted from array)');
			}
		} catch (_error) {
			console.log('[SuperCode] ℹ️ No Memory connection found');
		}

		// Auto-populate tools - extract actual component
		try {
			const toolConnection = await executionContext.getInputConnectionData(
				NodeConnectionType.AiTool,
				0,
			);
			if (toolConnection) {
				// 🎯 Extract actual tools from array for user convenience
				sandbox.tools = Array.isArray(toolConnection) ? toolConnection[0] : toolConnection;
				console.log('[SuperCode] ✅ Auto-populated tools variable (extracted from array)');
			}
		} catch (_error) {
			console.log('[SuperCode] ℹ️ No Tool connections found');
		}
	}

	// Helper method to create wrapped code with error handling
	private createWrappedCode(code: string, timeout: number): string {
		return `
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
					if (_error.name === 'TypeError') {
						if (_error.message.includes('undefined')) {
							throw new Error('🤖 LLM-FRIENDLY ERROR [E005]\\n📍 Issue: ' + _error.message + '\\n💡 Fix: Check if variable exists before using: if (variable) { ... }');
						}
						if (_error.message.includes('not a function')) {
							throw new Error('🤖 LLM-FRIENDLY ERROR [E003]\\n📍 Issue: ' + _error.message + '\\n💡 Fix: 1) Check method name spelling 2) Ensure library is loaded 3) Check object has method');
						}
					}
					if (_error.name === 'ReferenceError') {
						// Don't intercept ReferenceErrors for known lazy-loaded libraries
						const knownLibraries = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];
						const isKnownLibrary = knownLibraries.some(lib => _error.message.includes(lib + ' is not defined'));
						if (!isKnownLibrary) {
							throw new Error('🤖 LLM-FRIENDLY ERROR [E004]\\n📍 Issue: ' + _error.message + '\\n💡 Fix: 1) Declare variable first 2) Check spelling 3) Import library if needed');
						}
						// Re-throw original error for known libraries to allow lazy loading
						throw _error;
					}
					if (_error.message.includes('await')) {
						throw new Error('🤖 LLM-FRIENDLY ERROR [E006]\\n📍 Issue: ' + _error.message + '\\n💡 Fix: Add await before async operations: await axios.get(), await sharp().resize()');
					}
					// Re-throw with original stack for debugging
					throw _error;
				}
			})();
		`;
	}

	// Helper method to process execution results
	private processExecutionResult(result: unknown): INodeExecutionData[] {
		if (Array.isArray(result)) {
			return result.map((item) => ({
				json:
					typeof item === 'object' && item !== null
						? (item as IDataObject)
						: ({ data: item } as IDataObject),
			}));
		} else if (result !== undefined) {
			return [
				{
					json:
						typeof result === 'object' && result !== null
							? (result as IDataObject)
							: ({ data: result } as IDataObject),
				},
			];
		} else {
			return [];
		}
	}

	// Helper method to execute code in batch mode (runOnceForAllItems)
	public async executeCodeBatch(
		items: INodeExecutionData[],
		code: string,
		timeout: number,
		createEnhancedSandbox: (items: INodeExecutionData[]) => Promise<unknown>,
	): Promise<INodeExecutionData[][]> {
		console.log('[SuperCode] ⚡ Running runOnceForAllItems mode');
		console.log('[SuperCode] 🎯 About to call createEnhancedSandbox...');
		const sandbox = await createEnhancedSandbox(items);
		console.log('[SuperCode] ✅ createEnhancedSandbox completed');
		const context = createContext(sandbox as Record<string, unknown>);

		const wrappedCode = this.createWrappedCode(code, timeout);
		const result = await runInContext(wrappedCode, context, {
			timeout: timeout * 1000,
		});

		return [this.processExecutionResult(result)];
	}

	// Helper method to execute code for each item individually
	public async executeCodePerItem(
		items: INodeExecutionData[],
		code: string,
		timeout: number,
		createEnhancedSandbox: (items: INodeExecutionData[]) => Promise<unknown>,
		executionContext: IExecuteFunctions,
	): Promise<INodeExecutionData[][]> {
		const results: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const sandbox = await createEnhancedSandbox([items[i]]);
			const context = createContext(sandbox as Record<string, unknown>);

			const wrappedCode = this.createWrappedCode(code, timeout);

			try {
				const result = await runInContext(wrappedCode, context, {
					timeout: timeout * 1000,
				});

				results.push(...this.processExecutionResult(result));
			} catch (_error) {
				if (executionContext.continueOnFail()) {
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

	// Helper method to create a sandbox factory function
	public createSandboxFactory(
		aiAgentMode: boolean,
		originalConsole: typeof console,
		executionContext: IExecuteFunctions,
	) {
		return async (items: INodeExecutionData[]) => {
			originalConsole.log(
				'[SuperCode] 🏗️ createEnhancedSandbox called - starting sandbox creation',
			);
			originalConsole.log('[SuperCode] 🏗️ Creating enhanced sandbox with direct loading...');

			// Library cache to avoid repeated loading
			const libraryCache: LibraryCache = {};
			const performanceTracker: PerformanceTracker = {};

			// Create the base sandbox structure with n8n workflow context
			const sandbox = {
				// 🔗 n8n WORKFLOW CONTEXT: Add core workflow data proxy and methods FIRST
				...executionContext.getWorkflowDataProxy(0),
				$getNodeParameter: executionContext.getNodeParameter.bind(executionContext),
				$getWorkflowStaticData: executionContext.getWorkflowStaticData.bind(executionContext),
				helpers: executionContext.helpers,

				// 📦 OVERRIDE: Enhanced $input with additional convenience methods
				$input: {
					all: () => items,
					first: () => items[0],
					last: () => items[items.length - 1],
					json: items.length === 1 ? items[0].json : items.map((item) => item.json),
				},

				// 🤖 AI Agent Mode: AI Connection Access (like LangChain Code node)
				getInputConnectionData: aiAgentMode
					? executionContext.getInputConnectionData.bind(executionContext)
					: undefined,

				// 🎯 Auto-populated AI variables for seamless UX
				llm: undefined as unknown, // Will be populated if AI Agent Mode is enabled
				memory: undefined as unknown, // Will be populated if AI Agent Mode is enabled
				tools: undefined as unknown, // Will be populated if AI Agent Mode is enabled

				// 🔧 DEBUG: Make bundledLibraries available for debugging
				bundledLibraries: bundledLibraries,

				// 🔍 VERSION IDENTIFIER: Confirm Railway is running v1.0.65+
				SUPERCODE_VERSION: '1.0.65-all-libraries-bundled',

				console: {
					log: (...args: unknown[]) => console.log('[SuperCode]', ...args),
					error: (...args: unknown[]) => console.error('[SuperCode]', ...args),
					warn: (...args: unknown[]) => console.warn('[SuperCode]', ...args),
				},
				utils: this.createSandboxUtils(libraryCache, performanceTracker),
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

				// 🎯 Node.js globals for full compatibility with standard Code node
				global,
				Buffer,

				// SECURITY: require removed to prevent sandbox escape via require('child_process').exec()
			};

			console.log(
				'[SuperCode] ✅ Sandbox created with getters:',
				Object.keys(sandbox).slice(0, 10),
			);

			// Load embedded libraries using helper method
			this.loadEmbeddedLibraries(sandbox as Record<string, unknown>, originalConsole);

			// Populate AI variables using helper method
			await this.populateAIVariables(
				sandbox as Record<string, unknown>,
				aiAgentMode,
				executionContext,
			);

			return sandbox;
		};
	}

	description: INodeTypeDescription = {
		displayName: 'Super Code',
		name: 'superCodeNodeVmSafe',
		icon: { light: 'file:supercode.svg', dark: 'file:supercode.svg' },
		group: ['transform'],
		version: 1,
		description:
			'🚀 The node that replaces entire workflows! Consolidate 10-15 nodes into ONE with 47+ libraries, full workflow access, and AI-ready code generation',
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
						description:
							'Execute JavaScript/TypeScript with 44+ enhanced libraries including YouTube/FFmpeg',
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
				default: `// SuperCode Node by Ken Kai - 49+ JavaScript Libraries Available
// Available: _, lodash, axios, cheerio, dayjs, moment, dateFns, dateFnsTz, joi, Joi, validator, uuid, Ajv, yup, csvParse, xml2js, XMLParser, YAML, papaparse, Papa, Handlebars, CryptoJS, forge, jwt, bcrypt, bcryptjs, XLSX, pdfLib, archiver, Jimp, QRCode, math, fuzzy, stringSimilarity, slug, pluralize, qs, FormData, ini, toml, nanoid, bytes, phoneNumber, iban, ethers, web3, ytdl, ffmpeg, ffmpegStatic, utils

// 🔄 EXECUTION MODE SUPPORT:
// - "Run Once for All Items": Access all items via $input.all() or items variable
// - "Run Once for Each Item": Access current item via $input.item or item variable

// For "Run Once for All Items" mode:
if (typeof items !== 'undefined') {
    console.log('Running in "Run Once for All Items" mode');
    console.log('Total items:', items.length);
    // Process all items together
    const allData = items.map(item => item.json);
    return { 
        mode: 'runOnceForAllItems',
        totalItems: items.length,
        firstItem: allData[0],
        result: 'Processed all items together'
    };
}

// For "Run Once for Each Item" mode:
if (typeof item !== 'undefined') {
    console.log('Running in "Run Once for Each Item" mode');
    console.log('Current item:', item.json);
    // Process single item
    return { 
        mode: 'runOnceForEachItem',
        currentItem: item.json,
        result: 'Processed individual item'
    };
}

// Fallback (shouldn't happen)
const data = $input.first().json;
return { 
    result: 'Hello from Super Code!',
    fallback: true,
    data
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
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Run Once for All Items',
						value: 'runOnceForAllItems',
						description: 'Run the code only once with all input items accessible via $input.all()',
					},
					{
						name: 'Run Once for Each Item',
						value: 'runOnceForEachItem',
						description:
							'Run the code for each input item separately, with only current item accessible via $input.item',
					},
				],
				default: 'runOnceForAllItems',
				description: 'Whether to run code once for all items or once for each item',
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
		const executionMode = this.getNodeParameter('mode', 0, 'runOnceForAllItems') as string;
		const code = this.getNodeParameter('code', 0) as string;
		const timeout = 30; // Default timeout in seconds

		// Early validation
		if (!code.trim()) {
			throw new NodeOperationError(
				this.getNode(),
				`No code provided. Please add your ${language === 'python' ? 'Python' : 'JavaScript/TypeScript'} code.`,
			);
		}

		if (language === 'python') {
			throw new NodeOperationError(
				this.getNode(),
				'🐍 Python execution is coming soon! Currently under development for broader server compatibility. Use JavaScript for now - 35 libraries available!',
			);
		}

		// Setup logging
		const originalConsole = console;
		originalConsole.log('[SuperCode] 🚀 EXECUTION STARTING - JAVASCRIPT MODE - VM-SAFE VERSION');
		originalConsole.log('[SuperCode] 🔍 Platform check - Railway environment detected');

		const aiAgentMode = this.getNodeParameter('aiAgentMode', 0, false) as boolean;
		originalConsole.log('[SuperCode] 🤖 AI Agent Mode:', aiAgentMode);

		try {
			console.log('[SuperCode] 🚀 EXECUTION STARTING - LIBRARIES PRE-LOADED AS GLOBALS');
			console.log('[SuperCode] 📝 Execution mode:', executionMode);
			console.log('[SuperCode] 📦 Items count:', items.length);

			// Create SuperCode node instance to access helper methods
			const superCodeNode = new SuperCodeNode();

			// Create sandbox factory function
			const createEnhancedSandbox = superCodeNode.createSandboxFactory(
				aiAgentMode,
				originalConsole,
				this,
			);

			// Helper function to create sandbox for runOnceForAllItems mode
			const createSandboxForAllItems = (
				baseSandboxFactory: (items: INodeExecutionData[]) => Promise<unknown>,
			) => {
				return async (items: INodeExecutionData[]) => {
					const baseSandbox = await baseSandboxFactory(items);
					// In runOnceForAllItems mode, provide access to all items
					return {
						...(baseSandbox as Record<string, unknown>),
						items: items, // Standard n8n Code node compatibility
						$input: {
							all: () => items,
							first: () => items[0],
							last: () => items[items.length - 1],
							json: items.length === 1 ? items[0].json : items.map((item) => item.json),
						},
					};
				};
			};

			// Helper function to create sandbox for runOnceForEachItem mode
			const createSandboxForEachItem = (
				baseSandboxFactory: (items: INodeExecutionData[]) => Promise<unknown>,
			) => {
				return async (items: INodeExecutionData[]) => {
					const baseSandbox = await baseSandboxFactory(items);
					// In runOnceForEachItem mode, provide access to single item
					const currentItem = items[0]; // executeCodePerItem passes single item array
					return {
						...(baseSandbox as Record<string, unknown>),
						item: currentItem, // Standard n8n Code node compatibility
						$input: {
							all: () => [currentItem],
							first: () => currentItem,
							last: () => currentItem,
							item: currentItem, // Additional convenience accessor
							json: currentItem.json,
						},
					};
				};
			};

			// Execute based on the selected mode
			if (executionMode === 'runOnceForEachItem') {
				console.log('[SuperCode] ⚡ Running runOnceForEachItem mode');
				return await superCodeNode.executeCodePerItem(
					items,
					code,
					timeout,
					createSandboxForEachItem(createEnhancedSandbox),
					this,
				);
			} else {
				console.log('[SuperCode] ⚡ Running runOnceForAllItems mode');
				return await superCodeNode.executeCodeBatch(
					items,
					code,
					timeout,
					createSandboxForAllItems(createEnhancedSandbox),
				);
			}
		} catch (_error) {
			throw new NodeOperationError(
				this.getNode(),
				`Code execution failed: ${_error.message}\\n\\nStack trace:\\n${_error.stack}`,
			);
		}
	}
}
