/* eslint-disable no-undef */
// Core JavaScript libraries bundled for n8n community nodes (simplified)
module.exports = {
	// Core utilities
	_: require('lodash'),
	lodash: require('lodash'),

	// HTTP & Web
	axios: require('axios'),
	cheerio: require('cheerio'),

	// Date/Time
	dayjs: require('dayjs'),
	moment: require('moment-timezone'),

	// Validation & Data
	joi: require('joi'),
	Joi: require('joi'),
	validator: require('validator'),
	uuid: require('uuid'), // Full uuid module with all methods

	// Parsing & Processing
	csvParse: require('csv-parse'),
	xml2js: require('xml2js'),
	XMLParser: require('fast-xml-parser').XMLParser,
	YAML: require('yaml'),

	// Templating
	Handlebars: require('handlebars'),

	// Security & Crypto
	CryptoJS: require('crypto-js'),
	forge: require('node-forge'),
	jwt: require('jsonwebtoken'),

	// Files & Documents
	XLSX: require('xlsx'),
	pdfLib: require('pdf-lib'),
	archiver: require('archiver'),

	// Images & Media
	Jimp: require('jimp'),
	QRCode: require('qrcode'),

	// Math & Science
	math: require('mathjs'),

	// Text & Language, AI/NLP
	// natural: require('natural'), // REMOVED: Native dependency
	fuzzy: require('fuse.js'),

	// Media Processing (additional)
	// sharp: require('sharp'), // REMOVED: Native dependency

	// Web Scraping & Automation
	// puppeteer: require('puppeteer-core'), // REMOVED: Too large, requires Chrome

	// Security & Hashing
	bcrypt: require('bcryptjs'), // Pure JavaScript implementation
	bcryptjs: require('bcryptjs'), // Alternative name

	// Financial & Geographic
	currency: require('currency.js'),
	phoneNumber: require('libphonenumber-js'),
	iban: require('iban'),

	// Blockchain
	ethers: require('ethers'),
	web3: require('web3'),

	// Enhanced Libraries (v1.0.50) - Fixed for webpack bundling
	// Better CSV handling
	papaparse: require('papaparse'),
	Papa: require('papaparse'), // Alternative name for convenience

	// Advanced date/time  
	dateFns: require('date-fns'),
	dateFnsTz: require('date-fns-tz'),

	// String processing
	stringSimilarity: require('string-similarity'),
	slug: (() => {
		try {
			const slugLib = require('slug');
			return slugLib.default || slugLib;
		} catch (e) {
			return require('slug');
		}
	})(),
	pluralize: require('pluralize'),

	// HTTP/API utilities
	qs: require('qs'),
	FormData: require('form-data'),

	// Validation alternatives
	Ajv: require('ajv'),
	yup: require('yup'),

	// File formats
	ini: require('ini'),
	toml: require('toml'),

	// Utilities
	nanoid: (() => {
		try {
			const nanoidLib = require('nanoid');
			return { nanoid: nanoidLib.nanoid || nanoidLib };
		} catch (e) {
			return require('nanoid');
		}
	})(),
	ms: require('ms'),
	bytes: require('bytes'),
};
