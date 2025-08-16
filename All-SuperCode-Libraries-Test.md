# SuperCode All Libraries Test - Complete

Test every single embedded library in SuperCode node with simple functionality check.

## SuperCode JavaScript

```javascript
const libraryTests = [];

// Helper function to test each library
function testLibrary(name, testFn) {
	try {
		const result = testFn();
		libraryTests.push({
			library: name,
			status: 'WORKING',
			result: result,
			available: true,
		});
	} catch (error) {
		libraryTests.push({
			library: name,
			status: 'ERROR',
			result: error.message,
			available: false,
		});
	}
}

// Helper for optional libraries
function testOptional(name, testFn) {
	try {
		const result = testFn();
		libraryTests.push({ library: name, status: 'WORKING', result, available: true });
	} catch (error) {
		libraryTests.push({
			library: name,
			status: 'OPTIONAL',
			result: 'Not available in environment',
			available: false,
		});
	}
}

// Core utilities
testLibrary('lodash (_)', () => {
	return 'Sum [1,2,3]: ' + _.sum([1, 2, 3]) + ' | Unique: [' + _.uniq([1, 1, 2]) + ']';
});

testLibrary('lodash', () => {
	return (
		'Same as _ | GroupBy test: ' +
		JSON.stringify(lodash.groupBy([{ a: 1 }, { a: 2 }, { a: 1 }], 'a'))
	);
});

// HTTP & Web
testOptional('axios', () => {
	if (typeof axios === 'undefined') return 'Not available';
	return 'HTTP client: ' + typeof axios + ' | Has get: ' + (typeof axios.get === 'function');
});

testLibrary('cheerio', () => {
	const $ = cheerio.load('<div><h1>Test</h1><p>Content</p></div>');
	return 'H1 text: ' + $('h1').text() + ' | P count: ' + $('p').length;
});

// Date/Time libraries
testLibrary('dayjs', () => {
	const date = dayjs('2024-01-15');
	return 'Format: ' + date.format('YYYY-MM-DD') + ' | Year: ' + date.year();
});

testLibrary('moment', () => {
	const date = moment('2024-01-15');
	return 'Format: ' + date.format('YYYY-MM-DD') + ' | UTC: ' + date.utc().format('HH:mm');
});

testLibrary('dateFns', () => {
	return 'Date-fns available | Type: ' + typeof dateFns + ' | Has format: ' + !!dateFns.format;
});

testLibrary('dateFnsTz', () => {
	return (
		'Date-fns-tz available | Type: ' +
		typeof dateFnsTz +
		' | Has zonedTimeToUtc: ' +
		!!dateFnsTz.zonedTimeToUtc
	);
});

// Validation & Data
testLibrary('joi', () => {
	const schema = joi.string().email();
	const result = schema.validate('test@example.com');
	return 'Email validation: ' + !result.error + ' | Value: ' + result.value;
});

testLibrary('Joi', () => {
	const schema = Joi.number().positive();
	const result = schema.validate(42);
	return 'Number validation: ' + !result.error + ' | Value: ' + result.value;
});

testLibrary('validator', () => {
	return (
		'Email: ' +
		validator.isEmail('test@example.com') +
		' | URL: ' +
		validator.isURL('https://example.com')
	);
});

testLibrary('uuid', () => {
	return 'v4: ' + uuid.v4() + ' | v1: ' + uuid.v1();
});

testLibrary('Ajv', () => {
	const ajv = new Ajv();
	const schema = { type: 'string' };
	const validate = ajv.compile(schema);
	return 'Schema compiled | Validates: ' + validate('test');
});

testOptional('yup', () => {
	if (typeof yup === 'undefined') return 'Not available';
	const schema = yup.string().required();
	return 'Yup schema created | Type: ' + typeof yup;
});

// Parsing & Processing
testLibrary('csvParse', () => {
	return 'CSV parser | Type: ' + typeof csvParse + ' | Has parse: ' + !!csvParse.parse;
});

testLibrary('xml2js', () => {
	const parser = new xml2js.Parser();
	return 'XML parser | Type: ' + typeof xml2js + ' | Has Parser: ' + !!xml2js.Parser;
});

testLibrary('XMLParser', () => {
	const parser = new XMLParser();
	const result = parser.parse('<test>value</test>');
	return 'FastXML parsed: ' + JSON.stringify(result);
});

testLibrary('YAML', () => {
	const yamlStr = YAML.stringify({ test: 'value', num: 42 });
	const parsed = YAML.parse(yamlStr);
	return 'YAML: ' + yamlStr.replace(/\n/g, ' ').trim() + ' | Parsed: ' + JSON.stringify(parsed);
});

testLibrary('papaparse', () => {
	const parsed = Papa.parse('name,age\nJohn,30\nJane,25', { header: true });
	return (
		'CSV rows: ' +
		parsed.data.length +
		' | First: ' +
		(parsed.data[0] ? parsed.data[0].name : 'none')
	);
});

testLibrary('Papa', () => {
	const parsed = Papa.parse('a,b\n1,2', { header: true });
	return 'Same as papaparse | Rows: ' + parsed.data.length;
});

// Templating
testLibrary('Handlebars', () => {
	const template = Handlebars.compile('Hello {{name}}!');
	const result = template({ name: 'World' });
	return 'Template: ' + result + ' | Type: ' + typeof Handlebars;
});

// Security & Crypto
testLibrary('CryptoJS', () => {
	const hash = CryptoJS.SHA256('test').toString();
	const encrypted = CryptoJS.AES.encrypt('secret', 'key').toString();
	return 'SHA256: ' + hash.substring(0, 16) + '... | AES encrypted length: ' + encrypted.length;
});

testOptional('forge', () => {
	if (typeof forge === 'undefined') return 'Not available';
	return 'Node-forge | Type: ' + typeof forge + ' | Has md: ' + !!forge.md;
});

testLibrary('jwt', () => {
	const token = jwt.sign({ test: 'data' }, 'secret', { expiresIn: '1h' });
	return 'JWT token length: ' + token.length + ' | Type: ' + typeof jwt;
});

testLibrary('bcrypt', () => {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync('password', salt);
	return 'Salt: ' + salt.substring(0, 10) + '... | Hash length: ' + hash.length;
});

testLibrary('bcryptjs', () => {
	const salt = bcryptjs.genSaltSync(10);
	return 'Same as bcrypt | Salt: ' + salt.substring(0, 10) + '...';
});

// Files & Documents
testLibrary('XLSX', () => {
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet([
		['Name', 'Value'],
		['Test', 42],
	]);
	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
	const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
	return 'Excel created | Sheets: ' + wb.SheetNames.length + ' | Size: ' + buffer.length + ' bytes';
});

testOptional('pdfLib', () => {
	if (typeof pdfLib === 'undefined') return 'Not available';
	return 'PDF-lib | Type: ' + typeof pdfLib + ' | Has PDFDocument: ' + !!pdfLib.PDFDocument;
});

testOptional('archiver', () => {
	if (typeof archiver === 'undefined') return 'Not available';
	return 'Archiver | Type: ' + typeof archiver + ' | Has create: ' + !!archiver.create;
});

// Images & Media
testOptional('Jimp', () => {
	if (typeof Jimp === 'undefined') return 'Not available';
	return 'Image processor | Type: ' + typeof Jimp + ' | Has read: ' + !!Jimp.read;
});

testLibrary('QRCode', () => {
	return (
		'QR generator | Type: ' +
		typeof QRCode +
		' | Has toDataURL: ' +
		(typeof QRCode.toDataURL === 'function')
	);
});

// Math & Science
testOptional('math', () => {
	if (typeof math === 'undefined') return 'Not available';
	return 'MathJS | Eval 2+3*4: ' + math.evaluate('2 + 3 * 4') + ' | Type: ' + typeof math;
});

// Text & Language
testLibrary('fuzzy', () => {
	const fuse = new fuzzy(['apple', 'banana', 'cherry'], { threshold: 0.3 });
	const result = fuse.search('aple');
	return (
		'Fuse.js | Search aple: ' +
		result.length +
		' results | First: ' +
		(result[0] ? result[0].item : 'none')
	);
});

testLibrary('stringSimilarity', () => {
	const sim = stringSimilarity.compareTwoStrings('hello', 'hallo');
	return 'String similarity hello/hallo: ' + sim.toFixed(3);
});

testLibrary('slug', () => {
	const slugified = slug('Hello World Test 123');
	return 'Slugified: ' + slugified + ' | Type: ' + typeof slug;
});

testLibrary('pluralize', () => {
	const plural = pluralize('cat');
	const singular = pluralize.singular('cats');
	return 'cat -> ' + plural + ' | cats -> ' + singular;
});

// HTTP/API utilities
testLibrary('qs', () => {
	const stringified = qs.stringify({ name: 'test', value: 42, array: [1, 2, 3] });
	const parsed = qs.parse(stringified);
	return 'Query string: ' + stringified + ' | Parsed keys: ' + Object.keys(parsed).length;
});

testLibrary('FormData', () => {
	const form = new FormData();
	form.append('test', 'value');
	form.append('number', '42');
	return (
		'FormData created | Type: ' +
		typeof FormData +
		' | Has append: ' +
		(typeof form.append === 'function')
	);
});

// File formats
testLibrary('ini', () => {
	const iniStr = ini.stringify({
		database: { host: 'localhost', port: 5432 },
		app: { name: 'test' },
	});
	const parsed = ini.parse(iniStr);
	return 'INI sections: ' + Object.keys(parsed).length + ' | Host: ' + parsed.database.host;
});

testLibrary('toml', () => {
	const tomlStr = 'title = "TOML Test"\nowner = "Tom"\n[database]\nserver = "192.168.1.1"';
	const parsed = toml.parse(tomlStr);
	return 'TOML parsed | Title: ' + parsed.title + ' | DB server: ' + parsed.database.server;
});

// Utilities
testLibrary('nanoid', () => {
	// Handle nanoid wrapper structure
	const id = typeof nanoid === 'function' ? nanoid() : nanoid.nanoid ? nanoid.nanoid() : 'error';
	return 'Generated: ' + id + ' | Length: ' + id.length;
});

testOptional('ms', () => {
	if (typeof ms === 'undefined') return 'Not available';
	return 'MS converter | 1day: ' + ms('1d') + ' | 1hour: ' + ms('1h');
});

testLibrary('bytes', () => {
	const formatted = bytes(1048576);
	const parsed = bytes.parse('5MB');
	return '1MB: ' + formatted + ' | Parse 5MB: ' + parsed + ' bytes';
});

// Financial & Geographic
testLibrary('currency', () => {
	const amount = currency(1234.567);
	const added = amount.add(0.433);
	return 'Format: ' + amount.format() + ' | Add 0.433: ' + added.format();
});

testLibrary('phoneNumber', () => {
	const phone = phoneNumber.parsePhoneNumber('+14155552671', 'US');
	return (
		'Formatted: ' +
		phone.formatInternational() +
		' | Country: ' +
		phone.country +
		' | Valid: ' +
		phone.isValid()
	);
});

testLibrary('iban', () => {
	const testIban1 = 'GB29 NWBK 6016 1331 9268 19';
	const testIban2 = 'DE89 3704 0044 0532 0130 00';
	return (
		'GB IBAN valid: ' + iban.isValid(testIban1) + ' | DE IBAN valid: ' + iban.isValid(testIban2)
	);
});

// Blockchain (optional)
testOptional('ethers', () => {
	if (typeof ethers === 'undefined') return 'Not available';
	return (
		'Ethers.js | Version: ' + (ethers.version || 'unknown') + ' | Has utils: ' + !!ethers.utils
	);
});

testOptional('web3', () => {
	if (typeof web3 === 'undefined') return 'Not available';
	return 'Web3.js | Type: ' + typeof web3 + ' | Has utils: ' + !!web3.utils;
});

// YouTube & Video Processing (optional)
testOptional('ytdl', () => {
	if (typeof ytdl === 'undefined') return 'Not available';
	return 'YouTube DL | Type: ' + typeof ytdl + ' | Has getInfo: ' + !!ytdl.getInfo;
});

testOptional('ffmpeg', () => {
	if (typeof ffmpeg === 'undefined') return 'Not available';
	return 'FFmpeg fluent | Type: ' + typeof ffmpeg + ' | Constructor: ' + !!ffmpeg;
});

testOptional('ffmpegStatic', () => {
	if (typeof ffmpegStatic === 'undefined') return 'Not available';
	return (
		'FFmpeg static path | Type: ' +
		typeof ffmpegStatic +
		' | Value length: ' +
		(ffmpegStatic ? ffmpegStatic.length : 0)
	);
});

// Additional libraries that might be available
testOptional('natural', () => {
	if (typeof natural === 'undefined') return 'Not available';
	return 'Natural NLP | Type: ' + typeof natural + ' | Has stemmer: ' + !!natural.PorterStemmer;
});

testOptional('knex', () => {
	if (typeof knex === 'undefined') return 'Not available';
	return 'Knex query builder | Type: ' + typeof knex + ' | Constructor: ' + !!knex;
});

testOptional('puppeteer', () => {
	if (typeof puppeteer === 'undefined') return 'Not available';
	return 'Puppeteer | Type: ' + typeof puppeteer + ' | Has launch: ' + !!puppeteer.launch;
});

testOptional('sharp', () => {
	if (typeof sharp === 'undefined') return 'Not available';
	return 'Sharp image processor | Type: ' + typeof sharp + ' | Constructor: ' + !!sharp;
});

// Test utils object if available
testLibrary('utils', () => {
	if (typeof utils === 'undefined') return 'Utils not available';
	const memInfo = utils.memoryUsage();
	const libs = utils.getAvailableLibraries();
	return 'Memory heap: ' + memInfo.heapUsed + ' | Available libs count: ' + libs.length;
});

// Generate comprehensive summary
const workingLibs = libraryTests.filter((t) => t.status === 'WORKING');
const optionalLibs = libraryTests.filter((t) => t.status === 'OPTIONAL');
const errorLibs = libraryTests.filter((t) => t.status === 'ERROR');

// Categorize libraries
const categories = {
	coreUtils: libraryTests.filter((lib) =>
		['lodash', '_', 'dayjs', 'moment', 'uuid'].some((name) => lib.library.includes(name)),
	),
	validation: libraryTests.filter((lib) =>
		['joi', 'Joi', 'validator', 'Ajv'].some((name) => lib.library.includes(name)),
	),
	dataProcessing: libraryTests.filter((lib) =>
		['XLSX', 'xml2js', 'XMLParser', 'YAML', 'papaparse', 'Papa', 'csvParse'].some((name) =>
			lib.library.includes(name),
		),
	),
	webScraping: libraryTests.filter((lib) =>
		['axios', 'cheerio', 'puppeteer'].some((name) => lib.library.includes(name)),
	),
	security: libraryTests.filter((lib) =>
		['CryptoJS', 'bcrypt', 'jwt', 'forge'].some((name) => lib.library.includes(name)),
	),
	multimedia: libraryTests.filter((lib) =>
		['QRCode', 'Jimp', 'sharp', 'ffmpeg', 'ytdl'].some((name) => lib.library.includes(name)),
	),
	utilities: libraryTests.filter((lib) =>
		[
			'bytes',
			'ms',
			'nanoid',
			'qs',
			'FormData',
			'ini',
			'toml',
			'slug',
			'pluralize',
			'stringSimilarity',
			'fuzzy',
		].some((name) => lib.library.includes(name)),
	),
	financial: libraryTests.filter((lib) =>
		['currency', 'phoneNumber', 'iban', 'ethers', 'web3'].some((name) =>
			lib.library.includes(name),
		),
	),
	dateTime: libraryTests.filter((lib) =>
		['dateFns', 'dateFnsTz'].some((name) => lib.library.includes(name)),
	),
};

// Generate dynamic status message based on success rate
const successRate = Math.round((workingLibs.length / libraryTests.length) * 100);
let statusMessage = '';
let statusEmoji = '';

if (successRate >= 95) {
	statusMessage = '🎉 WOO! THINGS ARE WORKING AMAZINGLY! 🚀 Almost perfect library compatibility!';
	statusEmoji = '🎉🚀✨';
} else if (successRate >= 90) {
	statusMessage = '😊 EXCELLENT! Libraries are working great! 💪 Very high compatibility!';
	statusEmoji = '😊💪🔥';
} else if (successRate >= 80) {
	statusMessage = '👍 GOOD! Most libraries working well! 🎯 Solid performance!';
	statusEmoji = '👍🎯⚡';
} else if (successRate >= 70) {
	statusMessage = '⚠️ DECENT! Many libraries working! 🔧 Some issues to investigate.';
	statusEmoji = '⚠️🔧🔍';
} else if (successRate >= 50) {
	statusMessage = '😬 CONCERNING! Only half the libraries working! 🚨 Needs attention!';
	statusEmoji = '😬🚨⛔';
} else {
	statusMessage = '💥 HOUSTON WE HAVE A PROBLEM! 🆘 Major library failures detected!';
	statusEmoji = '💥🆘🔴';
}

return {
	// 🎯 SUMMARY FIRST!
	statusMessage: statusMessage,
	statusEmoji: statusEmoji,
	summary: {
		totalTested: libraryTests.length,
		working: workingLibs.length,
		optional: optionalLibs.length,
		errors: errorLibs.length,
		successRate: successRate + '%',
		workingRatio: workingLibs.length + '/' + libraryTests.length,
		message: statusMessage,
	},

	// 📊 Detailed Results
	libraryTests: libraryTests.sort((a, b) => a.library.localeCompare(b.library)),

	// 📂 Categories
	categories: {
		coreUtils: {
			count: categories.coreUtils.length,
			working: categories.coreUtils.filter((l) => l.status === 'WORKING').length,
		},
		validation: {
			count: categories.validation.length,
			working: categories.validation.filter((l) => l.status === 'WORKING').length,
		},
		dataProcessing: {
			count: categories.dataProcessing.length,
			working: categories.dataProcessing.filter((l) => l.status === 'WORKING').length,
		},
		webScraping: {
			count: categories.webScraping.length,
			working: categories.webScraping.filter((l) => l.status === 'WORKING').length,
		},
		security: {
			count: categories.security.length,
			working: categories.security.filter((l) => l.status === 'WORKING').length,
		},
		multimedia: {
			count: categories.multimedia.length,
			working: categories.multimedia.filter((l) => l.status === 'WORKING').length,
		},
		utilities: {
			count: categories.utilities.length,
			working: categories.utilities.filter((l) => l.status === 'WORKING').length,
		},
		financial: {
			count: categories.financial.length,
			working: categories.financial.filter((l) => l.status === 'WORKING').length,
		},
		dateTime: {
			count: categories.dateTime.length,
			working: categories.dateTime.filter((l) => l.status === 'WORKING').length,
		},
	},

	// 📋 Metadata
	testedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	environment: 'SuperCode v1.0.81',
};
```

## Expected Output

This will return:

- **libraryTests**: Array with each library showing name, status, result, available
- **summary**: Total counts and success rate
- **categories**: Libraries grouped by functionality
- **testedAt**: Timestamp of test execution

The test covers all embedded libraries including the optional ones that may not be available in all environments.
