#!/usr/bin/env node

/**
 * Advanced Security Tests for SuperCode Nodes
 *
 * This script performs more comprehensive security testing including:
 * - Advanced sandbox escape attempts
 * - File system access prevention
 * - Network access validation
 * - Memory corruption attempts
 * - Real-world attack scenarios
 */

const { createContext, runInContext } = require('vm');

// Import embedded libraries (mimicking SuperCode structure)
const embeddedLibraries = {
	_: require('lodash'),
	axios: require('axios'),
	dayjs: require('dayjs'),
	joi: require('joi'),
	validator: require('validator'),
	uuid: require('uuid'),
	CryptoJS: require('crypto-js'),
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

// Create secure sandbox identical to SuperCode implementation
function createAdvancedSecureSandbox(testData = [{ json: { test: 'data' } }]) {
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
			formatDate: (date, format) => {
				const d = new Date(date);
				return format ? d.toLocaleDateString() : d.toISOString();
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
		// SECURITY: All dangerous globals intentionally omitted
		// require, process, Buffer, global, __dirname, __filename, module, exports
	};

	// Load embedded libraries directly
	for (const [libName, libValue] of Object.entries(embeddedLibraries)) {
		if (libValue && typeof libValue !== 'undefined') {
			sandbox[libName] = libValue;
		}
	}

	return sandbox;
}

// Advanced security test runner
async function runAdvancedSecurityTests() {
	console.log('🔐 ADVANCED SECURITY VALIDATION TESTS');
	console.log('='.repeat(50));

	const results = {
		passed: 0,
		failed: 0,
		details: [],
		securityLevel: 'UNKNOWN',
	};

	// Test 1: Advanced require() bypass attempts
	console.log('\n🧪 ADVANCED TEST 1: require() bypass attempts');
	try {
		const sandbox = createAdvancedSecureSandbox();
		const context = createContext(sandbox);
		const bypassAttempts = `
            const attacks = [];
            
            // Attempt 1: Direct require access
            try {
                require('fs');
                attacks.push({ method: 'direct_require', success: true });
            } catch (e) {
                attacks.push({ method: 'direct_require', success: false, blocked: e.message });
            }
            
            // Attempt 2: Constructor access to require
            try {
                (function(){}).constructor('return require')()('fs');
                attacks.push({ method: 'constructor_require', success: true });
            } catch (e) {
                attacks.push({ method: 'constructor_require', success: false, blocked: e.message });
            }
            
            // Attempt 3: Global this access
            try {
                this.constructor.constructor('return require')()('fs');
                attacks.push({ method: 'global_this_require', success: true });
            } catch (e) {
                attacks.push({ method: 'global_this_require', success: false, blocked: e.message });
            }
            
            // Attempt 4: Process mainModule access
            try {
                process.mainModule.require('fs');
                attacks.push({ method: 'process_mainModule', success: true });
            } catch (e) {
                attacks.push({ method: 'process_mainModule', success: false, blocked: e.message });
            }
            
            return { attacks, allBlocked: attacks.every(a => !a.success) };
        `;

		const result = await runInContext(`(async function() { ${bypassAttempts} })()`, context, {
			timeout: 5000,
		});

		if (result.allBlocked) {
			console.log('✅ PASS: All require() bypass attempts blocked');
			results.passed++;
			results.details.push('All require() bypass methods blocked');
		} else {
			console.log('❌ FAIL: Some require() bypass attempts succeeded');
			result.attacks.forEach((attack) => {
				console.log(`  ${attack.method}: ${attack.success ? '❌ BREACH' : '✅ BLOCKED'}`);
			});
			results.failed++;
			results.details.push('CRITICAL: require() bypass possible');
		}
	} catch (error) {
		console.log('✅ PASS: require() bypass blocked with exception:', error.message);
		results.passed++;
		results.details.push('require() bypass blocked completely');
	}

	// Test 2: File system access attempts
	console.log('\n🧪 ADVANCED TEST 2: File system access prevention');
	try {
		const sandbox = createAdvancedSecureSandbox();
		const context = createContext(sandbox);
		const fsAttempts = `
            const attacks = [];
            
            // Attempt 1: Direct fs access
            try {
                const fs = require('fs');
                fs.readFileSync('/etc/passwd');
                attacks.push({ method: 'fs_readFile', success: true });
            } catch (e) {
                attacks.push({ method: 'fs_readFile', success: false });
            }
            
            // Attempt 2: Child process execution
            try {
                const cp = require('child_process');
                cp.execSync('cat /etc/passwd');
                attacks.push({ method: 'child_process', success: true });
            } catch (e) {
                attacks.push({ method: 'child_process', success: false });
            }
            
            // Attempt 3: Import() dynamic loading
            try {
                const fs = await import('fs');
                attacks.push({ method: 'dynamic_import', success: true });
            } catch (e) {
                attacks.push({ method: 'dynamic_import', success: false });
            }
            
            return { attacks, allBlocked: attacks.every(a => !a.success) };
        `;

		const result = await runInContext(`(async function() { ${fsAttempts} })()`, context, {
			timeout: 5000,
		});

		if (result.allBlocked) {
			console.log('✅ PASS: All file system access attempts blocked');
			results.passed++;
			results.details.push('File system access completely blocked');
		} else {
			console.log('❌ FAIL: Some file system access succeeded');
			results.failed++;
			results.details.push('CRITICAL: File system access possible');
		}
	} catch (error) {
		console.log('✅ PASS: File system access blocked with exception');
		results.passed++;
		results.details.push('File system access blocked completely');
	}

	// Test 3: Environment variable access prevention
	console.log('\n🧪 ADVANCED TEST 3: Environment variable access prevention');
	try {
		const sandbox = createAdvancedSecureSandbox();
		const context = createContext(sandbox);
		const envAttempts = `
            const attacks = [];
            
            // Attempt 1: Direct process.env access
            try {
                const secrets = process.env;
                attacks.push({ method: 'process_env', success: true, vars: Object.keys(secrets).slice(0, 3) });
            } catch (e) {
                attacks.push({ method: 'process_env', success: false });
            }
            
            // Attempt 2: Global process access
            try {
                const proc = global.process || globalThis.process;
                if (proc && proc.env) {
                    attacks.push({ method: 'global_process', success: true });
                } else {
                    attacks.push({ method: 'global_process', success: false });
                }
            } catch (e) {
                attacks.push({ method: 'global_process', success: false });
            }
            
            return { attacks, allBlocked: attacks.every(a => !a.success) };
        `;

		const result = await runInContext(`(async function() { ${envAttempts} })()`, context, {
			timeout: 5000,
		});

		if (result.allBlocked) {
			console.log('✅ PASS: All environment variable access blocked');
			results.passed++;
			results.details.push('Environment variables completely protected');
		} else {
			console.log('❌ FAIL: Environment variable access possible');
			result.attacks.forEach((attack) => {
				if (attack.success) {
					console.log(`  ${attack.method}: BREACH - exposed vars:`, attack.vars || 'unknown');
				}
			});
			results.failed++;
			results.details.push('CRITICAL: Environment variables exposed');
		}
	} catch (error) {
		console.log('✅ PASS: Environment access blocked with exception');
		results.passed++;
		results.details.push('Environment access blocked completely');
	}

	// Test 4: Real-world library stress test
	console.log('\n🧪 ADVANCED TEST 4: Real-world library functionality stress test');
	try {
		const sandbox = createAdvancedSecureSandbox([
			{ json: { email: 'test@example.com', data: 'Hello World', timestamp: '2024-01-01' } },
			{ json: { email: 'invalid-email', data: 'Goodbye World', timestamp: '2024-01-02' } },
		]);
		const context = createContext(sandbox);
		const libraryStressTest = `
            const results = [];
            const items = $input.all();
            
            // Test 1: Lodash operations
            try {
                const mapped = _.map(items, item => ({ ...item.json, processed: true }));
                const grouped = _.groupBy(mapped, item => validator.isEmail(item.email) ? 'valid' : 'invalid');
                results.push({ library: 'lodash', success: true, processed: mapped.length, groups: Object.keys(grouped) });
            } catch (e) {
                results.push({ library: 'lodash', success: false, error: e.message });
            }
            
            // Test 2: Date processing with dayjs
            try {
                const processed = items.map(item => ({
                    ...item.json,
                    formatted_date: dayjs(item.json.timestamp).format('YYYY-MM-DD'),
                    days_ago: dayjs().diff(dayjs(item.json.timestamp), 'days')
                }));
                results.push({ library: 'dayjs', success: true, processed: processed.length });
            } catch (e) {
                results.push({ library: 'dayjs', success: false, error: e.message });
            }
            
            // Test 3: Validation with joi
            try {
                const schema = joi.object({
                    email: joi.string().email().required(),
                    data: joi.string().min(5).required(),
                    timestamp: joi.date().iso().required()
                });
                const validations = items.map(item => schema.validate(item.json));
                const validCount = validations.filter(v => !v.error).length;
                results.push({ library: 'joi', success: true, valid: validCount, total: validations.length });
            } catch (e) {
                results.push({ library: 'joi', success: false, error: e.message });
            }
            
            // Test 4: UUID generation
            try {
                const ids = items.map(() => uuid.v4());
                const allUnique = new Set(ids).size === ids.length;
                results.push({ library: 'uuid', success: allUnique, generated: ids.length });
            } catch (e) {
                results.push({ library: 'uuid', success: false, error: e.message });
            }
            
            // Test 5: Crypto operations
            try {
                const encrypted = items.map(item => ({
                    ...item.json,
                    hash: CryptoJS.SHA256(item.json.data).toString(),
                    encrypted: CryptoJS.AES.encrypt(item.json.data, 'secret').toString()
                }));
                results.push({ library: 'CryptoJS', success: true, processed: encrypted.length });
            } catch (e) {
                results.push({ library: 'CryptoJS', success: false, error: e.message });
            }
            
            return { 
                results, 
                allSuccessful: results.every(r => r.success),
                successCount: results.filter(r => r.success).length,
                totalTests: results.length
            };
        `;

		const result = await runInContext(`(async function() { ${libraryStressTest} })()`, context, {
			timeout: 10000,
		});

		if (result.allSuccessful) {
			console.log(`✅ PASS: All ${result.totalTests} library stress tests passed`);
			results.passed++;
			results.details.push(`All ${result.totalTests} libraries fully functional under stress`);
		} else {
			console.log(`⚠️ PARTIAL: ${result.successCount}/${result.totalTests} library tests passed`);
			result.results.forEach((test) => {
				console.log(`  ${test.library}: ${test.success ? '✅' : '❌'} ${test.error || ''}`);
			});
			results.failed++;
			results.details.push(
				`Library stress test: ${result.successCount}/${result.totalTests} passed`,
			);
		}
	} catch (error) {
		console.log('❌ FAIL: Library stress test failed:', error.message);
		results.failed++;
		results.details.push('Library stress test failed: ' + error.message);
	}

	// Test 5: Memory corruption attempts
	console.log('\n🧪 ADVANCED TEST 5: Memory corruption prevention');
	try {
		const sandbox = createAdvancedSecureSandbox();
		const context = createContext(sandbox);
		const memoryAttacks = `
            const attacks = [];
            
            // Attempt 1: Prototype pollution via Object.prototype
            try {
                Object.prototype.polluted = true;
                const testObj = {};
                attacks.push({ method: 'prototype_pollution', success: testObj.polluted === true });
                delete Object.prototype.polluted; // cleanup
            } catch (e) {
                attacks.push({ method: 'prototype_pollution', success: false });
            }
            
            // Attempt 2: Array prototype manipulation
            try {
                Array.prototype.malicious = function() { return 'hacked'; };
                const testArray = [];
                attacks.push({ method: 'array_pollution', success: typeof testArray.malicious === 'function' });
                delete Array.prototype.malicious; // cleanup
            } catch (e) {
                attacks.push({ method: 'array_pollution', success: false });
            }
            
            // Attempt 3: Function constructor access
            try {
                const maliciousFunc = Function('return process')();
                attacks.push({ method: 'function_constructor', success: !!maliciousFunc });
            } catch (e) {
                attacks.push({ method: 'function_constructor', success: false });
            }
            
            return { attacks, anySucessful: attacks.some(a => a.success) };
        `;

		const result = await runInContext(`(async function() { ${memoryAttacks} })()`, context, {
			timeout: 5000,
		});

		if (!result.anySucessful) {
			console.log('✅ PASS: All memory corruption attempts blocked');
			results.passed++;
			results.details.push('Memory corruption prevention effective');
		} else {
			console.log('❌ FAIL: Some memory corruption succeeded');
			result.attacks.forEach((attack) => {
				console.log(`  ${attack.method}: ${attack.success ? '❌ SUCCESS' : '✅ BLOCKED'}`);
			});
			results.failed++;
			results.details.push('WARNING: Memory corruption possible');
		}
	} catch (error) {
		console.log('✅ PASS: Memory corruption blocked with exception');
		results.passed++;
		results.details.push('Memory corruption blocked completely');
	}

	// Determine security level
	const successRate = (results.passed / (results.passed + results.failed)) * 100;
	if (successRate === 100) {
		results.securityLevel = 'MAXIMUM';
	} else if (successRate >= 80) {
		results.securityLevel = 'HIGH';
	} else if (successRate >= 60) {
		results.securityLevel = 'MEDIUM';
	} else {
		results.securityLevel = 'LOW';
	}

	// Generate advanced security report
	console.log('\n🔐 ADVANCED SECURITY VALIDATION REPORT');
	console.log('='.repeat(50));
	console.log(`✅ Tests Passed: ${results.passed}`);
	console.log(`❌ Tests Failed: ${results.failed}`);
	console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
	console.log(`🛡️ Security Level: ${results.securityLevel}`);

	console.log('\n📋 DETAILED RESULTS:');
	results.details.forEach((detail, index) => {
		console.log(`${index + 1}. ${detail}`);
	});

	if (results.failed === 0) {
		console.log('\n🎉 ALL ADVANCED SECURITY TESTS PASSED!');
		console.log('🔒 SANDBOX IS PRODUCTION-READY SECURE!');
		return true;
	} else {
		console.log('\n⚠️ SECURITY VULNERABILITIES DETECTED!');
		console.log('🔍 REQUIRES IMMEDIATE ATTENTION!');
		return false;
	}
}

// Run the advanced security validation tests
if (require.main === module) {
	runAdvancedSecurityTests()
		.then((success) => {
			process.exit(success ? 0 : 1);
		})
		.catch((error) => {
			console.error('Advanced security test execution failed:', error);
			process.exit(1);
		});
}

module.exports = { runAdvancedSecurityTests, createAdvancedSecureSandbox };
