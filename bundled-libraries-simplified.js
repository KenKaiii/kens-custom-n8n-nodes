/* eslint-disable no-undef */
// Core JavaScript libraries bundled for n8n community nodes (simplified)
module.exports = {
	// Core utilities
	_: require(/* webpackIgnore: true */ 'lodash'),
	lodash: require(/* webpackIgnore: true */ 'lodash'),

	// HTTP & Web
	axios: require(/* webpackIgnore: true */ 'axios'),
	cheerio: require(/* webpackIgnore: true */ 'cheerio'),

	// Date/Time
	dayjs: require(/* webpackIgnore: true */ 'dayjs'),
	moment: require(/* webpackIgnore: true */ 'moment-timezone'),

	// Validation & Data
	joi: require(/* webpackIgnore: true */ 'joi'),
	Joi: require(/* webpackIgnore: true */ 'joi'),
	validator: require(/* webpackIgnore: true */ 'validator'),
	uuid: require(/* webpackIgnore: true */ 'uuid'),

	// Parsing & Processing
	csvParse: require(/* webpackIgnore: true */ 'csv-parse'),
	xml2js: require(/* webpackIgnore: true */ 'xml2js'),
	XMLParser: require(/* webpackIgnore: true */ 'fast-xml-parser').XMLParser,
	YAML: require(/* webpackIgnore: true */ 'yaml'),

	// Templating
	Handlebars: require(/* webpackIgnore: true */ 'handlebars'),

	// Security & Crypto
	CryptoJS: require(/* webpackIgnore: true */ 'crypto-js'),
	forge: require(/* webpackIgnore: true */ 'node-forge'),
	jwt: require(/* webpackIgnore: true */ 'jsonwebtoken'),

	// Files & Documents
	XLSX: require(/* webpackIgnore: true */ 'xlsx'),
	pdfLib: require(/* webpackIgnore: true */ 'pdf-lib'),
	archiver: require(/* webpackIgnore: true */ 'archiver'),

	// Images & Media
	Jimp: require(/* webpackIgnore: true */ 'jimp'),
	QRCode: require(/* webpackIgnore: true */ 'qrcode'),

	// Math & Science
	math: require(/* webpackIgnore: true */ 'mathjs'),

	// Text & Language, AI/NLP
	natural: require(/* webpackIgnore: true */ 'natural'),
	fuzzy: require(/* webpackIgnore: true */ 'fuse.js'),

	// Media Processing (additional)
	sharp: require(/* webpackIgnore: true */ 'sharp'),

	// Web Scraping & Automation
	puppeteer: require(/* webpackIgnore: true */ 'puppeteer-core'),

	// Security & Hashing
	bcrypt: require(/* webpackIgnore: true */ 'bcrypt'),

	// Financial & Geographic
	currency: require(/* webpackIgnore: true */ 'currency.js'),
	phoneNumber: require(/* webpackIgnore: true */ 'libphonenumber-js'),
	iban: require(/* webpackIgnore: true */ 'iban'),

	// Blockchain
	ethers: require(/* webpackIgnore: true */ 'ethers'),
	web3: require(/* webpackIgnore: true */ 'web3'),
};
