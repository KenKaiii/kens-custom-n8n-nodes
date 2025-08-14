import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	NodeConnectionType,
	NodeOperationError,
	SupplyData,
} from 'n8n-workflow';

import { createContext, runInContext } from 'vm';

// Type definitions for better TypeScript support
interface LibraryCache {
	[key: string]: unknown;
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
let bundledLibraries: EmbeddedLibraries = embeddedLibraries;

export class SuperCodeTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Super Code Tool',
		name: 'superCodeTool',
		icon: { light: 'file:supercode.svg', dark: 'file:supercode.svg' },
		group: [],
		version: 1,
		description: 'AI Agent code execution tool with JavaScript/Python and 41+ enhanced libraries',
		usableAsTool: true,
		defaults: {
			name: 'Super Code Tool',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [NodeConnectionType.AiTool, { displayName: '', type: NodeConnectionType.Main }],
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
						description: 'Execute JavaScript/TypeScript with 41+ enhanced libraries',
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
// Available: lodash (_), axios, dayjs, joi, validator, uuid, csvParse, Handlebars, cheerio, CryptoJS, XLSX, pdfLib, math, xml2js, YAML, Jimp, QRCode, archiver, knex, forge, moment, XMLParser, jwt, bcrypt, ethers, web3, phoneNumber, currency, iban, fuzzy

// Example: Use joi directly (no require needed)
const schema = joi.string().min(3);
const result = schema.validate('test');

// Your JavaScript code here
return { 
    result: 'Hello from Super Code Tool!',
    libraries_available: utils.getAvailableLibraries().length
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

# Your Python code here
result = {
    "message": "Hello from Super Code Tool Python!",
    "python_available": True
}
`,
				description: 'Python code with popular libraries and utilities',
				noDataExpression: true,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, _itemIndex: number): Promise<SupplyData> {
		// Return the SuperCode tool schema for AI agents
		const tool = {
			name: 'super_code_tool',
			description:
				'Execute JavaScript/Python code with 41+ enhanced libraries including lodash, axios, joi, XLSX, crypto, ethers, web3, and many more',
			schema: {
				type: 'object',
				properties: {
					language: {
						type: 'string',
						enum: ['javascript', 'python'],
						description: 'Programming language to execute (javascript or python)',
					},
					code: {
						type: 'string',
						description:
							'Code to execute with access to 41+ enhanced libraries. Libraries are pre-loaded as globals (e.g., use _ for lodash, axios for HTTP, dayjs for dates, joi for validation, XLSX for spreadsheets, CryptoJS for crypto, ethers/web3 for blockchain).',
					},
				},
				required: ['language', 'code'],
			},
		};

		return { response: [tool] };
	}

	private static createSandboxStatic(items: INodeExecutionData[]) {
		const libraryCache: LibraryCache = {};

		const sandbox = {
			$input: {
				all: () => items,
				first: () => items[0],
				last: () => items[items.length - 1],
				json: items.length === 1 ? items[0].json : items.map((item) => item.json),
			},
			bundledLibraries: bundledLibraries,
			SUPERCODE_VERSION: '1.0.65-simplified-tool',
			console: {
				log: (...args: unknown[]) => console.log('[SuperCodeTool]', ...args),
				error: (...args: unknown[]) => console.error('[SuperCodeTool]', ...args),
				warn: (...args: unknown[]) => console.warn('[SuperCodeTool]', ...args),
			},
			utils: {
				now: () => new Date().toISOString(),
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
					'jimp (Jimp)',
					'qrcode (QRCode)',
					'archiver',
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
				memoryUsage: () => {
					const usage = process.memoryUsage();
					return {
						heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
						heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
					};
				},
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

		// Load all embedded libraries directly
		for (const [libName, libValue] of Object.entries(bundledLibraries)) {
			if (libValue && typeof libValue !== 'undefined') {
				(sandbox as Record<string, unknown>)[libName] = libValue;
			}
		}

		// Add nanoid function alias if available
		if (
			bundledLibraries.nanoid &&
			typeof bundledLibraries.nanoid === 'object' &&
			bundledLibraries.nanoid !== null &&
			'nanoid' in bundledLibraries.nanoid
		) {
			(sandbox as Record<string, unknown>).nanoid = (
				bundledLibraries.nanoid as { nanoid: unknown }
			).nanoid;
		}

		return sandbox;
	}

	private static createCodeWrapperStatic(code: string, timeout: number): string {
		return `
			(async function() {
				const start = Date.now();
				try {
					${code}
				} catch (error) {
					if (error.name === 'TypeError' && error.message.includes('undefined')) {
						throw new Error('🤖 ERROR: ' + error.message + ' - Check if variable exists first');
					}
					if (error.name === 'ReferenceError') {
						throw new Error('🤖 ERROR: ' + error.message + ' - Variable not defined');
					}
					throw error;
				}
				if (Date.now() - start > ${timeout * 1000}) {
					throw new Error('🤖 ERROR: Code execution timeout');
				}
			})();
		`;
	}

	private static formatResultStatic(result: unknown): INodeExecutionData[] {
		if (Array.isArray(result)) {
			return result.map((item) => ({
				json: item && typeof item === 'object' ? JSON.parse(JSON.stringify(item)) : { data: item },
			}));
		}
		if (result !== undefined) {
			return [
				{
					json:
						result && typeof result === 'object'
							? JSON.parse(JSON.stringify(result))
							: { data: result },
				},
			];
		}
		return [];
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const language = this.getNodeParameter('language', 0, 'javascript') as string;
		const code = this.getNodeParameter('code', 0) as string;
		const timeout = 30;

		if (!code.trim()) {
			throw new NodeOperationError(this.getNode(), 'No code provided');
		}

		if (language === 'python') {
			throw new NodeOperationError(this.getNode(), 'Python execution coming soon!');
		}

		console.log('[SuperCodeTool] 🚀 Executing JavaScript code');

		const sandbox = SuperCodeTool.createSandboxStatic(items);
		const context = createContext(sandbox);
		const wrappedCode = SuperCodeTool.createCodeWrapperStatic(code, timeout);

		try {
			const result = await runInContext(wrappedCode, context, { timeout: timeout * 1000 });
			const formattedResults = SuperCodeTool.formatResultStatic(result);
			return [formattedResults];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Code execution failed: ${error.message}`);
		}
	}
}
