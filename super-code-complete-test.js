// ==================================================
// SUPER CODE NODE COMPLETE VALIDATION TEST
// ==================================================
// Copy this entire code into a Super Code Node in n8n
// This will test ALL 47 libraries + workflow context features

const results = {
	timestamp: new Date().toISOString(),
	summary: {
		totalLibraries: 50, // including aliases
		totalWorkflowFeatures: 8,
		libraryResults: [],
		workflowResults: [],
		passed: 0,
		failed: 0,
		errors: [],
	},
};

// ==================================================
// 1. LIBRARY TESTS (All 50 library names/aliases)
// ==================================================

const libraryTests = [
	// Core Utilities
	{ name: 'lodash', test: () => lodash.sum([1, 2, 3]) === 6 },
	{ name: '_', test: () => _.sum([1, 2, 3]) === 6 },

	// HTTP & Web
	{ name: 'axios', test: () => typeof axios === 'function' && typeof axios.get === 'function' },
	{ name: 'cheerio', test: () => typeof cheerio.load === 'function' },

	// Date/Time
	{ name: 'dayjs', test: () => dayjs().isValid() },
	{ name: 'moment', test: () => moment().isValid() },
	{ name: 'dateFns', test: () => typeof dateFns.format === 'function' },
	{ name: 'dateFnsTz', test: () => typeof dateFnsTz.format === 'function' },

	// Validation & Data
	{ name: 'joi', test: () => typeof joi.string === 'function' },
	{ name: 'Joi', test: () => typeof Joi.string === 'function' },
	{ name: 'validator', test: () => validator.isEmail('test@example.com') },
	{ name: 'uuid', test: () => typeof uuid.v4() === 'string' },
	{ name: 'Ajv', test: () => typeof Ajv === 'function' },
	{ name: 'yup', test: () => yup && typeof yup.string === 'function' },

	// Parsing & Processing
	{
		name: 'csvParse',
		test: () => typeof csvParse === 'object' && typeof csvParse.parse === 'function',
	},
	{ name: 'xml2js', test: () => typeof xml2js.parseString === 'function' },
	{ name: 'XMLParser', test: () => typeof XMLParser === 'function' },
	{ name: 'YAML', test: () => typeof YAML.parse === 'function' },
	{ name: 'papaparse', test: () => typeof papaparse.parse === 'function' },
	{ name: 'Papa', test: () => typeof Papa.parse === 'function' },

	// Templating
	{ name: 'Handlebars', test: () => typeof Handlebars.compile === 'function' },

	// Security & Crypto
	{ name: 'CryptoJS', test: () => CryptoJS.SHA256('test').toString().length === 64 },
	{ name: 'forge', test: () => forge && typeof forge.md === 'object' },
	{ name: 'jwt', test: () => typeof jwt.sign === 'function' },
	{ name: 'bcrypt', test: () => typeof bcrypt.hashSync === 'function' },
	{ name: 'bcryptjs', test: () => typeof bcryptjs.hashSync === 'function' },

	// Files & Documents
	{ name: 'XLSX', test: () => typeof XLSX.utils === 'object' },
	{ name: 'pdfLib', test: () => pdfLib && typeof pdfLib.PDFDocument === 'function' },
	{ name: 'archiver', test: () => archiver && typeof archiver === 'function' },

	// Images & Media
	{ name: 'Jimp', test: () => Jimp && typeof Jimp === 'object' && typeof Jimp.read === 'function' },
	{ name: 'QRCode', test: () => typeof QRCode.toDataURL === 'function' },

	// Math & Science
	{ name: 'math', test: () => math && math.evaluate('2 + 3') === 5 },

	// Text & Language (fuzzy is Fuse.js)
	{
		name: 'fuzzy',
		test: () => typeof fuzzy === 'function' || (fuzzy && typeof fuzzy.search === 'function'),
	},
	{
		name: 'stringSimilarity',
		test: () => typeof stringSimilarity.compareTwoStrings === 'function',
	},
	{ name: 'slug', test: () => slug('Hello World') === 'hello-world' },
	{ name: 'pluralize', test: () => pluralize('cat') === 'cats' },

	// HTTP/API utilities
	{ name: 'qs', test: () => typeof qs.stringify === 'function' },
	{ name: 'FormData', test: () => typeof FormData === 'function' },

	// File formats
	{ name: 'ini', test: () => typeof ini.parse === 'function' },
	{ name: 'toml', test: () => typeof toml.parse === 'function' },

	// Utilities
	{
		name: 'nanoid',
		test: () => typeof nanoid.nanoid === 'function' || typeof nanoid === 'function',
	},
	{ name: 'ms', test: () => ms && ms('1h') === 3600000 },
	{ name: 'bytes', test: () => typeof bytes === 'function' },

	// Financial & Geographic
	{
		name: 'currency',
		test: () => {
			try {
				const result = currency(1.23).add(0.77);
				return typeof currency === 'function' && result.value === 2;
			} catch (error) {
				return false;
			}
		},
	},
	{ name: 'phoneNumber', test: () => typeof phoneNumber.parsePhoneNumber === 'function' },
	{ name: 'iban', test: () => typeof iban.isValid === 'function' },

	// Blockchain
	{
		name: 'ethers',
		test: () =>
			ethers &&
			(typeof ethers.utils === 'object' || typeof ethers.getDefaultProvider === 'function'),
	},
	{ name: 'web3', test: () => web3 && typeof web3.Web3 === 'function' },

	// YouTube & Video
	{ name: 'ytdl', test: () => ytdl && typeof ytdl === 'function' },
	{ name: 'ffmpeg', test: () => ffmpeg && typeof ffmpeg === 'function' },
	{ name: 'ffmpegStatic', test: () => ffmpegStatic && typeof ffmpegStatic === 'string' },
];

// Run library tests
for (const libTest of libraryTests) {
	try {
		const passed = libTest.test();
		results.summary.libraryResults.push({
			name: libTest.name,
			status: passed ? 'PASS' : 'FAIL',
			available: true,
		});
		if (passed) results.summary.passed++;
		else results.summary.failed++;
	} catch (error) {
		results.summary.libraryResults.push({
			name: libTest.name,
			status: 'ERROR',
			available: false,
			error: error.message,
		});
		results.summary.failed++;
		results.summary.errors.push(`${libTest.name}: ${error.message}`);
	}
}

// ==================================================
// 2. WORKFLOW CONTEXT TESTS (Features we fixed)
// ==================================================

const workflowTests = [
	{
		name: '$() Function (Node Referencing)',
		test: () => typeof $ === 'function',
		critical: true,
	},
	{
		name: 'global Object',
		test: () => typeof global === 'object',
		critical: true,
	},
	{
		name: 'Buffer Object',
		test: () => typeof Buffer === 'function',
		critical: true,
	},
	{
		name: '$input Access',
		test: () => typeof $input === 'object' && typeof $input.first === 'function',
		critical: true,
	},
	{
		name: '$getNodeParameter Function',
		test: () => typeof $getNodeParameter === 'function',
		critical: true,
	},
	{
		name: '$getWorkflowStaticData Function',
		test: () => typeof $getWorkflowStaticData === 'function',
		critical: true,
	},
	{
		name: 'helpers Object',
		test: () => typeof helpers === 'object',
		critical: true,
	},
	{
		name: 'n8n Workflow Globals',
		test: () => {
			const globals = [];
			if (typeof $env !== 'undefined') globals.push('$env');
			if (typeof $workflow !== 'undefined') globals.push('$workflow');
			if (typeof $execution !== 'undefined') globals.push('$execution');
			if (typeof $now !== 'undefined') globals.push('$now');
			if (typeof $today !== 'undefined') globals.push('$today');
			if (typeof $jmespath !== 'undefined') globals.push('$jmespath');
			return globals.length > 0;
		},
		critical: false,
	},
];

// Run workflow context tests
for (const workflowTest of workflowTests) {
	try {
		const passed = workflowTest.test();
		results.summary.workflowResults.push({
			name: workflowTest.name,
			status: passed ? 'PASS' : 'FAIL',
			critical: workflowTest.critical,
			available: passed,
		});
		if (passed) results.summary.passed++;
		else results.summary.failed++;
	} catch (error) {
		results.summary.workflowResults.push({
			name: workflowTest.name,
			status: 'ERROR',
			critical: workflowTest.critical,
			available: false,
			error: error.message,
		});
		results.summary.failed++;
		results.summary.errors.push(`${workflowTest.name}: ${error.message}`);
	}
}

// ==================================================
// 3. FINAL RESULTS
// ==================================================

const totalTests = results.summary.libraryResults.length + results.summary.workflowResults.length;
const passRate = Math.round((results.summary.passed / totalTests) * 100);

results.summary.totalTests = totalTests;
results.summary.passRate = `${passRate}%`;

// Critical failures (workflow context features)
const criticalFailures = results.summary.workflowResults.filter(
	(r) => r.critical && (r.status === 'FAIL' || r.status === 'ERROR'),
);

// Determine verdict based on critical failures and pass rate
let verdict = 'CRITICAL_ISSUES';
if (criticalFailures.length === 0) {
	if (passRate >= 90) {
		verdict = 'EXCELLENT';
	} else if (passRate >= 80) {
		verdict = 'GOOD';
	} else {
		verdict = 'NEEDS_WORK';
	}
}
results.summary.verdict = verdict;

// Quick summary for display
results.quickSummary = {
	version: 'Super Code Node v1.1.1',
	totalTests: totalTests,
	passed: results.summary.passed,
	failed: results.summary.failed,
	passRate: results.summary.passRate,
	librariesWorking: results.summary.libraryResults.filter((r) => r.status === 'PASS').length,
	workflowFeaturesWorking: results.summary.workflowResults.filter((r) => r.status === 'PASS')
		.length,
	criticalIssues: criticalFailures.length,
	verdict: results.summary.verdict,
};

// Return the complete results
return results;
