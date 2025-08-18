// Debug test for failing libraries - copy this into Super Code Node
// This will help us understand exactly what's wrong with ms and currency

const debugResults = {
	timestamp: new Date().toISOString(),
	ms_debug: {},
	currency_debug: {},
	environment_info: {},
};

// =================================
// MS LIBRARY DEBUG
// =================================
debugResults.ms_debug = {
	exists: typeof ms !== 'undefined',
	type: typeof ms,
	is_function: typeof ms === 'function',
	test_attempts: {},
};

if (typeof ms !== 'undefined') {
	try {
		debugResults.ms_debug.test_attempts.direct_call = ms('1h');
	} catch (error) {
		debugResults.ms_debug.test_attempts.direct_call_error = error.message;
	}

	try {
		debugResults.ms_debug.test_attempts.string_test = ms('1 hour');
	} catch (error) {
		debugResults.ms_debug.test_attempts.string_test_error = error.message;
	}

	try {
		debugResults.ms_debug.test_attempts.number_test = ms(3600000);
	} catch (error) {
		debugResults.ms_debug.test_attempts.number_test_error = error.message;
	}

	// Check properties
	debugResults.ms_debug.properties = Object.getOwnPropertyNames(ms);
	debugResults.ms_debug.length = ms.length;
} else {
	debugResults.ms_debug.error = 'ms is not defined';
}

// =================================
// CURRENCY LIBRARY DEBUG
// =================================
debugResults.currency_debug = {
	exists: typeof currency !== 'undefined',
	type: typeof currency,
	is_function: typeof currency === 'function',
	test_attempts: {},
};

if (typeof currency !== 'undefined') {
	try {
		const curr1 = currency(1.23);
		debugResults.currency_debug.test_attempts.create_instance = {
			success: true,
			type: typeof curr1,
			value: curr1.value,
			has_add_method: typeof curr1.add === 'function',
		};

		const curr2 = curr1.add(0.77);
		debugResults.currency_debug.test_attempts.add_operation = {
			success: true,
			result_value: curr2.value,
			result_type: typeof curr2.value,
		};
	} catch (error) {
		debugResults.currency_debug.test_attempts.error = error.message;
		debugResults.currency_debug.test_attempts.stack = error.stack;
	}

	// Check properties
	debugResults.currency_debug.properties = Object.getOwnPropertyNames(currency);
	debugResults.currency_debug.length = currency.length;
} else {
	debugResults.currency_debug.error = 'currency is not defined';
}

// =================================
// ENVIRONMENT INFO
// =================================
debugResults.environment_info = {
	available_globals: Object.keys(this).slice(0, 20),
	has_require: typeof require !== 'undefined',
	has_module: typeof module !== 'undefined',
	has_exports: typeof exports !== 'undefined',
	has_global: typeof global !== 'undefined',
	has_process: typeof process !== 'undefined',
	nodejs_version: typeof process !== 'undefined' && process.version ? process.version : 'N/A',
};

// Test other working libraries for comparison
debugResults.working_library_samples = {
	lodash: {
		exists: typeof _ !== 'undefined',
		test: typeof _ !== 'undefined' ? _.sum([1, 2, 3]) : 'N/A',
	},
	dayjs: {
		exists: typeof dayjs !== 'undefined',
		test: typeof dayjs !== 'undefined' ? dayjs().format() : 'N/A',
	},
	uuid: {
		exists: typeof uuid !== 'undefined',
		test: typeof uuid !== 'undefined' && uuid.v4 ? uuid.v4().length : 'N/A',
	},
};

return debugResults;
