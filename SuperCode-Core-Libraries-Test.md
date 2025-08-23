# SuperCode Core Libraries Test - Verify Basic Loading

Test the core libraries that have been in SuperCode for a while to verify they're loading.

## SuperCode JavaScript Test

```javascript
// ========================================
// TEST CORE LIBRARIES THAT SHOULD WORK
// ========================================

const results = {
	libraryChecks: {},
	tests: {},
	timestamp: new Date().toISOString()
};

// Check 10 core libraries that have been working
const coreLibraries = [
	'_',           // lodash (underscore alias)
	'lodash',      // lodash
	'dayjs',       // date library
	'moment',      // moment timezone
	'cheerio',     // HTML parsing
	'uuid',        // UUID generation
	'CryptoJS',    // Crypto functions
	'XLSX',        // Excel processing
	'joi',         // Validation
	'validator'    // String validation
];

// Check if each library exists
coreLibraries.forEach(libName => {
	results.libraryChecks[libName] = {
		exists: typeof eval(libName) !== 'undefined',
		type: typeof eval(libName)
	};
});

// ========================================
// 1. LODASH TEST
// ========================================

try {
	const lodashTest = _.sum([1, 2, 3, 4, 5]);
	const lodashUniq = _.uniq([1, 1, 2, 2, 3]);
	
	results.tests.lodash = {
		status: 'success',
		sum: lodashTest,
		uniq: lodashUniq,
		works: lodashTest === 15
	};
} catch (error) {
	results.tests.lodash = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 2. DAYJS TEST
// ========================================

try {
	const now = dayjs();
	const formatted = now.format('YYYY-MM-DD HH:mm:ss');
	
	results.tests.dayjs = {
		status: 'success',
		formatted: formatted,
		year: now.year(),
		works: true
	};
} catch (error) {
	results.tests.dayjs = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 3. MOMENT TEST
// ========================================

try {
	const momentNow = moment();
	const momentFormatted = momentNow.format('YYYY-MM-DD');
	
	results.tests.moment = {
		status: 'success',
		formatted: momentFormatted,
		works: true
	};
} catch (error) {
	results.tests.moment = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 4. CHEERIO TEST
// ========================================

try {
	const $ = cheerio.load('<h1>Test</h1><p>Content</p>');
	const h1Text = $('h1').text();
	
	results.tests.cheerio = {
		status: 'success',
		h1Text: h1Text,
		works: h1Text === 'Test'
	};
} catch (error) {
	results.tests.cheerio = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 5. UUID TEST
// ========================================

try {
	const uuidV4 = uuid.v4();
	
	results.tests.uuid = {
		status: 'success',
		generated: uuidV4,
		length: uuidV4.length,
		works: uuidV4.includes('-')
	};
} catch (error) {
	results.tests.uuid = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 6. CRYPTOJS TEST
// ========================================

try {
	const hash = CryptoJS.SHA256('test').toString();
	
	results.tests.cryptojs = {
		status: 'success',
		hash: hash.substring(0, 16) + '...',
		length: hash.length,
		works: hash.length === 64
	};
} catch (error) {
	results.tests.cryptojs = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 7. XLSX TEST
// ========================================

try {
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 2]]);
	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
	
	results.tests.xlsx = {
		status: 'success',
		sheetCount: wb.SheetNames.length,
		sheetName: wb.SheetNames[0],
		works: wb.SheetNames[0] === 'Sheet1'
	};
} catch (error) {
	results.tests.xlsx = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 8. JOI TEST
// ========================================

try {
	const schema = joi.string().email();
	const validation = schema.validate('test@example.com');
	
	results.tests.joi = {
		status: 'success',
		isValid: !validation.error,
		value: validation.value,
		works: !validation.error
	};
} catch (error) {
	results.tests.joi = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 9. VALIDATOR TEST
// ========================================

try {
	const emailValid = validator.isEmail('test@example.com');
	const urlValid = validator.isURL('https://example.com');
	
	results.tests.validator = {
		status: 'success',
		emailValid: emailValid,
		urlValid: urlValid,
		works: emailValid && urlValid
	};
} catch (error) {
	results.tests.validator = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// 10. PAPAPARSE TEST
// ========================================

try {
	const csv = 'name,age\nJohn,30\nJane,25';
	const parsed = Papa.parse(csv, { header: true });
	
	results.tests.papaparse = {
		status: 'success',
		rowCount: parsed.data.length,
		firstRow: parsed.data[0],
		works: parsed.data.length === 2
	};
} catch (error) {
	results.tests.papaparse = {
		status: 'error',
		error: error.message
	};
}

// ========================================
// SUMMARY
// ========================================

const workingLibs = Object.values(results.libraryChecks).filter(l => l.exists).length;
const workingTests = Object.values(results.tests).filter(t => t.status === 'success').length;

results.summary = {
	coreLibrariesChecked: coreLibraries.length,
	librariesFound: workingLibs,
	testsRun: Object.keys(results.tests).length,
	testsSuccessful: workingTests,
	
	// List which ones work
	working: coreLibraries.filter(lib => results.libraryChecks[lib].exists),
	notWorking: coreLibraries.filter(lib => !results.libraryChecks[lib].exists),
	
	// Status message
	status: workingLibs === 10 ? '✅ All core libraries loaded!' :
	        workingLibs >= 8 ? '⚠️ Most core libraries loaded' :
	        workingLibs >= 5 ? '⚡ Some core libraries loaded' :
	        '❌ Core libraries not loading!',
	
	message: workingLibs < 10 ? 
		'Some core libraries are not loading. This might be a bundling issue with the webpack configuration.' :
		'All core libraries are working. Now we can test the new ones.'
};

// ========================================
// ALSO CHECK NEW LIBRARIES
// ========================================

const newLibraries = [
	'franc',
	'compromise', 
	'pRetry',
	'pLimit',
	'htmlToText',
	'marked',
	'jsonDiff',
	'cronParser'
];

results.newLibraryChecks = {};
newLibraries.forEach(libName => {
	try {
		results.newLibraryChecks[libName] = {
			exists: typeof eval(libName) !== 'undefined',
			type: typeof eval(libName)
		};
	} catch (e) {
		results.newLibraryChecks[libName] = {
			exists: false,
			type: 'error'
		};
	}
});

const newWorkingLibs = Object.values(results.newLibraryChecks).filter(l => l.exists).length;

results.newLibrarySummary = {
	checked: newLibraries.length,
	found: newWorkingLibs,
	working: newLibraries.filter(lib => results.newLibraryChecks[lib] && results.newLibraryChecks[lib].exists),
	notWorking: newLibraries.filter(lib => !results.newLibraryChecks[lib] || !results.newLibraryChecks[lib].exists),
	status: newWorkingLibs === 8 ? '✅ All new libraries loaded!' :
	        newWorkingLibs >= 6 ? '⚠️ Most new libraries loaded' :
	        newWorkingLibs >= 4 ? '⚡ Some new libraries loaded' :
	        '❌ New libraries not loading!'
};

return results;
```

## Expected Output

This test will tell you:
1. Which of the 10 core libraries are loading
2. Which of the 8 new libraries are loading
3. Whether the basic functionality works for each core library

Run this to diagnose if there's a general loading issue or if it's specific to the new libraries!