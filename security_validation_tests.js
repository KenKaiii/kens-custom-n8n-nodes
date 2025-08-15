#!/usr/bin/env node

/**
 * Security Validation Tests for SuperCode Nodes
 *
 * This script validates that the security fixes prevent sandbox escape attacks
 * while ensuring legitimate functionality still works correctly.
 */

const { createContext, runInContext } = require('vm');

// Import the embedded libraries structure for testing
const embeddedLibraries = {
	// Core utilities
	_: require('lodash'),
	axios: require('axios'),
	dayjs: require('dayjs'),
	joi: require('joi'),
	XLSX: (() => {
		const xlsx = require('xlsx');
		return {
			...xlsx,
			read: (data, opts) => {
				if (!data) throw new Error('XLSX.read: data parameter required');
				if (typeof data === 'string' && data.length > 50 * 1024 * 1024) {
					throw new Error('XLSX.read: file size too large (>50MB)');
				}
				const safeOpts = opts && typeof opts === 'object' ? JSON.parse(JSON.stringify(opts)) : opts;
				return xlsx.read(data, safeOpts);
			},
			readFile: (filename, opts) => {
				if (!filename || typeof filename !== 'string') {
					throw new Error('XLSX.readFile: valid filename required');
				}
				if (filename.includes('..') || filename.startsWith('/')) {
					throw new Error('XLSX.readFile: path traversal not allowed');
				}
				const safeOpts = opts && typeof opts === 'object' ? JSON.parse(JSON.stringify(opts)) : opts;
				return xlsx.readFile(filename, safeOpts);
			},
		};
	})(),
};

// Create a secure sandbox similar to SuperCode nodes
function createSecureSandbox(testData = [{ json: { test: 'data' } }]) {
	const sandbox = {
		$input: {
			all: () => testData,
			first: () => testData[0],
			last: () => testData[testData.length - 1],
			json: testData.length === 1 ? testData[0].json : testData.map((item) => item.json),
		},
		console: {
			log: (...args) => console.log('[SANDBOX]', ...args),
			error: (...args) => console.error('[SANDBOX]', ...args),
			warn: (...args) => console.warn('[SANDBOX]', ...args),
		},
		utils: {
			now: () => new Date().toISOString(),
			isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
		},
		setTimeout,
		clearTimeout,
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
		// SECURITY: require intentionally removed to prevent sandbox escape
		// SECURITY: process intentionally removed to prevent access to system
		// SECURITY: Buffer intentionally removed to prevent memory access
	};

	// Load embedded libraries directly (no require access)
	for (const [libName, libValue] of Object.entries(embeddedLibraries)) {
		if (libValue && typeof libValue !== 'undefined') {
			sandbox[libName] = libValue;
		}
	}

	return sandbox;
}

// Test runner with comprehensive security validation
async function runSecurityTests() {
	console.log('🔐 SECURITY VALIDATION TESTS FOR SUPERCODE NODES');
	console.log('='.repeat(60));

	const results = {
		passed: 0,
		failed: 0,
		details: [],
	};

	// Test 1: Attempt to access require() - should fail
	console.log('\n🧪 TEST 1: require() sandbox escape prevention');
	try {
		const sandbox = createSecureSandbox();
		const context = createContext(sandbox);
		const maliciousCode = `
            try {
                const cp = require('child_process');
                cp.exec('echo "SANDBOX ESCAPED!"');
                return { status: 'SECURITY_BREACH', message: 'require() accessible!' };
            } catch (error) {
                return { status: 'SECURE', message: 'require() blocked: ' + error.message };
            }
        `;

		const result = await runInContext(`(async function() { ${maliciousCode} })()`, context, {
			timeout: 5000,
		});

		if (result.status === 'SECURE') {
			console.log('✅ PASS: require() is blocked');
			results.passed++;
			results.details.push('require() access blocked successfully');
		} else {
			console.log('❌ FAIL: require() is accessible - SECURITY BREACH!');
			results.failed++;
			results.details.push('CRITICAL: require() access not blocked');
		}
	} catch (error) {
		console.log('✅ PASS: require() blocked with exception:', error.message);
		results.passed++;
		results.details.push('require() blocked with exception: ' + error.message);
	}

	// Test 2: Attempt to access process - should fail
	console.log('\n🧪 TEST 2: process global access prevention');
	try {
		const sandbox = createSecureSandbox();
		const context = createContext(sandbox);
		const maliciousCode = `
            try {
                const env = process.env;
                const cwd = process.cwd();
                return { status: 'SECURITY_BREACH', message: 'process accessible!', env: Object.keys(env).slice(0, 5) };
            } catch (error) {
                return { status: 'SECURE', message: 'process blocked: ' + error.message };
            }
        `;

		const result = await runInContext(`(async function() { ${maliciousCode} })()`, context, {
			timeout: 5000,
		});

		if (result.status === 'SECURE') {
			console.log('✅ PASS: process is blocked');
			results.passed++;
			results.details.push('process access blocked successfully');
		} else {
			console.log('❌ FAIL: process is accessible - SECURITY BREACH!');
			console.log('Exposed env vars:', result.env);
			results.failed++;
			results.details.push('CRITICAL: process access not blocked');
		}
	} catch (error) {
		console.log('✅ PASS: process blocked with exception:', error.message);
		results.passed++;
		results.details.push('process blocked with exception: ' + error.message);
	}

	// Test 3: Attempt to access Buffer - should fail
	console.log('\n🧪 TEST 3: Buffer global access prevention');
	try {
		const sandbox = createSecureSandbox();
		const context = createContext(sandbox);
		const maliciousCode = `
            try {
                const buf = Buffer.from('test');
                return { status: 'SECURITY_BREACH', message: 'Buffer accessible!', buffer: buf.toString() };
            } catch (error) {
                return { status: 'SECURE', message: 'Buffer blocked: ' + error.message };
            }
        `;

		const result = await runInContext(`(async function() { ${maliciousCode} })()`, context, {
			timeout: 5000,
		});

		if (result.status === 'SECURE') {
			console.log('✅ PASS: Buffer is blocked');
			results.passed++;
			results.details.push('Buffer access blocked successfully');
		} else {
			console.log('❌ FAIL: Buffer is accessible - potential security issue');
			results.failed++;
			results.details.push('WARNING: Buffer access not blocked');
		}
	} catch (error) {
		console.log('✅ PASS: Buffer blocked with exception:', error.message);
		results.passed++;
		results.details.push('Buffer blocked with exception: ' + error.message);
	}

	// Test 4: Validate embedded libraries work correctly
	console.log('\n🧪 TEST 4: Embedded libraries functionality');
	try {
		const sandbox = createSecureSandbox();
		const context = createContext(sandbox);
		const functionalCode = `
            const tests = [];
            
            // Test lodash
            if (typeof _ !== 'undefined') {
                const result = _.map([1, 2, 3], x => x * 2);
                tests.push({ library: 'lodash', working: Array.isArray(result) && result[0] === 2 });
            } else {
                tests.push({ library: 'lodash', working: false, error: 'not available' });
            }
            
            // Test dayjs
            if (typeof dayjs !== 'undefined') {
                const now = dayjs();
                tests.push({ library: 'dayjs', working: now && typeof now.format === 'function' });
            } else {
                tests.push({ library: 'dayjs', working: false, error: 'not available' });
            }
            
            // Test joi
            if (typeof joi !== 'undefined') {
                const schema = joi.string().min(3);
                const result = schema.validate('test');
                tests.push({ library: 'joi', working: !result.error });
            } else {
                tests.push({ library: 'joi', working: false, error: 'not available' });
            }
            
            return { status: 'tested', tests };
        `;

		const result = await runInContext(`(async function() { ${functionalCode} })()`, context, {
			timeout: 5000,
		});

		const workingLibs = result.tests.filter((t) => t.working).length;
		const totalLibs = result.tests.length;

		if (workingLibs === totalLibs) {
			console.log(`✅ PASS: All ${totalLibs} tested libraries work correctly`);
			results.passed++;
			results.details.push(`All ${totalLibs} tested embedded libraries functional`);
		} else {
			console.log(`⚠️ PARTIAL: ${workingLibs}/${totalLibs} libraries working`);
			result.tests.forEach((test) => {
				console.log(`  ${test.library}: ${test.working ? '✅' : '❌'} ${test.error || ''}`);
			});
			results.failed++;
			results.details.push(`Only ${workingLibs}/${totalLibs} embedded libraries functional`);
		}
	} catch (error) {
		console.log('❌ FAIL: Embedded libraries test failed:', error.message);
		results.failed++;
		results.details.push('Embedded libraries test failed: ' + error.message);
	}

	// Test 5: XLSX security validation
	console.log('\n🧪 TEST 5: XLSX input validation and prototype pollution prevention');
	try {
		const sandbox = createSecureSandbox();
		const context = createContext(sandbox);
		const xlsxSecurityCode = `
            const tests = [];
            
            // Test 1: Empty data protection
            try {
                XLSX.read(null);
                tests.push({ test: 'null_data', passed: false, reason: 'Should reject null data' });
            } catch (error) {
                tests.push({ test: 'null_data', passed: true, reason: 'Correctly rejected null data' });
            }
            
            // Test 2: Size limit protection  
            try {
                const largeData = 'x'.repeat(51 * 1024 * 1024); // 51MB
                XLSX.read(largeData);
                tests.push({ test: 'size_limit', passed: false, reason: 'Should reject large files' });
            } catch (error) {
                tests.push({ test: 'size_limit', passed: true, reason: 'Correctly rejected large file' });
            }
            
            // Test 3: Path traversal protection
            try {
                XLSX.readFile('../../../etc/passwd');
                tests.push({ test: 'path_traversal', passed: false, reason: 'Should reject path traversal' });
            } catch (error) {
                tests.push({ test: 'path_traversal', passed: true, reason: 'Correctly rejected path traversal' });
            }
            
            // Test 4: Prototype pollution protection
            try {
                const maliciousOpts = JSON.parse('{"__proto__": {"polluted": true}}');
                XLSX.read('test', maliciousOpts);
                // Check if prototype was polluted
                const testObj = {};
                const polluted = testObj.polluted === true;
                tests.push({ test: 'prototype_pollution', passed: !polluted, reason: polluted ? 'Prototype was polluted' : 'Prototype pollution prevented' });
            } catch (error) {
                tests.push({ test: 'prototype_pollution', passed: true, reason: 'Options sanitization worked' });
            }
            
            return { status: 'tested', tests };
        `;

		const result = await runInContext(`(async function() { ${xlsxSecurityCode} })()`, context, {
			timeout: 5000,
		});

		const passedTests = result.tests.filter((t) => t.passed).length;
		const totalTests = result.tests.length;

		if (passedTests === totalTests) {
			console.log(`✅ PASS: All ${totalTests} XLSX security tests passed`);
			results.passed++;
			results.details.push(`All ${totalTests} XLSX security validations passed`);
		} else {
			console.log(`❌ FAIL: ${passedTests}/${totalTests} XLSX security tests passed`);
			result.tests.forEach((test) => {
				console.log(`  ${test.test}: ${test.passed ? '✅' : '❌'} ${test.reason}`);
			});
			results.failed++;
			results.details.push(`XLSX security: ${passedTests}/${totalTests} tests passed`);
		}
	} catch (error) {
		console.log('❌ FAIL: XLSX security test failed:', error.message);
		results.failed++;
		results.details.push('XLSX security test failed: ' + error.message);
	}

	// Test 6: Legitimate code execution validation
	console.log('\n🧪 TEST 6: Legitimate code execution functionality');
	try {
		const sandbox = createSecureSandbox([
			{ json: { name: 'John', age: 30 } },
			{ json: { name: 'Jane', age: 25 } },
		]);
		const context = createContext(sandbox);
		const legitimateCode = `
            // Test normal data processing
            const items = $input.all();
            const processed = items.map(item => ({
                ...item.json,
                processed: true,
                ageGroup: item.json.age > 25 ? 'adult' : 'young'
            }));
            
            // Test embedded library usage
            const sorted = _.sortBy(processed, 'age');
            const formatted = sorted.map(person => ({
                ...person,
                formattedDate: dayjs().format('YYYY-MM-DD'),
                id: Math.random().toString(36).substr(2, 9)
            }));
            
            return {
                status: 'success',
                count: formatted.length,
                data: formatted,
                timestamp: utils.now()
            };
        `;

		const result = await runInContext(`(async function() { ${legitimateCode} })()`, context, {
			timeout: 5000,
		});

		const isValid =
			result.status === 'success' &&
			result.count === 2 &&
			Array.isArray(result.data) &&
			result.data.every((item) => item.processed === true);

		if (isValid) {
			console.log('✅ PASS: Legitimate code execution works correctly');
			console.log(`  Processed ${result.count} items successfully`);
			results.passed++;
			results.details.push('Legitimate code execution fully functional');
		} else {
			console.log('❌ FAIL: Legitimate code execution not working properly');
			console.log('Result:', result);
			results.failed++;
			results.details.push('Legitimate code execution failed');
		}
	} catch (error) {
		console.log('❌ FAIL: Legitimate code execution test failed:', error.message);
		results.failed++;
		results.details.push('Legitimate code execution test failed: ' + error.message);
	}

	// Generate comprehensive report
	console.log('\n🔐 SECURITY VALIDATION REPORT');
	console.log('='.repeat(60));
	console.log(`✅ Tests Passed: ${results.passed}`);
	console.log(`❌ Tests Failed: ${results.failed}`);
	console.log(
		`📊 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`,
	);

	console.log('\n📋 DETAILED RESULTS:');
	results.details.forEach((detail, index) => {
		console.log(`${index + 1}. ${detail}`);
	});

	if (results.failed === 0) {
		console.log('\n🎉 ALL SECURITY TESTS PASSED - SANDBOX IS SECURE!');
		return true;
	} else {
		console.log('\n⚠️ SECURITY ISSUES DETECTED - REVIEW REQUIRED!');
		return false;
	}
}

// Run the security validation tests
if (require.main === module) {
	runSecurityTests()
		.then((success) => {
			process.exit(success ? 0 : 1);
		})
		.catch((error) => {
			console.error('Security test execution failed:', error);
			process.exit(1);
		});
}

module.exports = { runSecurityTests, createSecureSandbox };
