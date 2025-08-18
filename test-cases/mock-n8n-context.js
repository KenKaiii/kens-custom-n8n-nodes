// MOCK N8N CONTEXT FOR TESTING
// This file demonstrates how the test should behave when workflow context is available
// Used to validate expected behavior in n8n environment

console.log('🧪 Mock n8n Context Test - Simulating Super Code Node Environment');

// Mock the workflow context that should be available in Super Code Node
const mockWorkflowContext = {
    // Core $() function for node referencing
    $: function(nodeName, outputIndex = 0, runIndex = 0) {
        console.log(`Mock $() called with: node=${nodeName}, output=${outputIndex}, run=${runIndex}`);
        return [
            { json: { mockData: 'from previous node', timestamp: new Date().toISOString() } }
        ];
    },
    
    // Enhanced $input object
    $input: {
        all: () => [
            { json: { id: 1, name: 'Test Item 1' } },
            { json: { id: 2, name: 'Test Item 2' } }
        ],
        first: () => ({ json: { id: 1, name: 'Test Item 1' } }),
        last: () => ({ json: { id: 2, name: 'Test Item 2' } }),
        json: [
            { id: 1, name: 'Test Item 1' },
            { id: 2, name: 'Test Item 2' }
        ]
    },
    
    // Workflow helper functions
    $getNodeParameter: function(paramName, fallback) {
        console.log(`Mock $getNodeParameter called: ${paramName}`);
        return fallback || `mock-${paramName}`;
    },
    
    $getWorkflowStaticData: function(type) {
        console.log(`Mock $getWorkflowStaticData called: ${type}`);
        return { mockStaticData: true, type: type };
    },
    
    // Helpers object
    helpers: {
        httpRequest: function(options) {
            console.log('Mock helpers.httpRequest called');
            return Promise.resolve({ data: 'mock response' });
        },
        httpRequestWithAuthentication: function(credentialsType, requestOptions) {
            console.log('Mock helpers.httpRequestWithAuthentication called');
            return Promise.resolve({ data: 'mock authenticated response' });
        },
        constructExecutionMetaData: function(inputData, options) {
            console.log('Mock helpers.constructExecutionMetaData called');
            return { json: inputData, pairedItem: options?.pairedItem || 0 };
        }
    },
    
    // Mock pre-loaded libraries (simplified versions)
    _: {
        map: (arr, fn) => arr.map(fn),
        filter: (arr, fn) => arr.filter(fn),
        get: (obj, path, defaultVal) => obj?.[path] ?? defaultVal
    },
    lodash: { map: () => 'mock lodash' },
    
    dayjs: function(date) {
        return {
            toISOString: () => new Date(date || Date.now()).toISOString(),
            format: (fmt) => `mock formatted date: ${fmt}`
        };
    },
    
    uuid: {
        v4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    },
    
    validator: {
        isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        isURL: (url) => {
            try { new URL(url); return true; } catch { return false; }
        }
    },
    
    joi: {
        string: () => ({
            email: () => ({ validate: () => ({ error: null, value: 'test@example.com' }) })
        })
    },
    
    moment: function(date) {
        return {
            format: (fmt) => `mock moment formatted: ${fmt}`,
            toISOString: () => new Date(date || Date.now()).toISOString()
        };
    },
    
    cheerio: {
        load: (html) => ({
            find: (selector) => ({
                text: () => `mock cheerio text for ${selector}`,
                attr: (attr) => `mock-${attr}`
            })
        })
    }
};

// Inject mock context into global scope
Object.assign(global, mockWorkflowContext);

// Now run a simplified version of our validation test
console.log('\n🔧 Testing Mock Context...');

const mockTests = [
    {
        name: '$() Function',
        test: () => {
            const result = $('previousNode');
            return { 
                success: typeof result === 'object' && Array.isArray(result),
                details: `$() returned: ${typeof result}, isArray: ${Array.isArray(result)}`
            };
        }
    },
    {
        name: '$input Enhanced Methods',
        test: () => {
            const hasAll = typeof $input.all === 'function';
            const hasFirst = typeof $input.first === 'function';
            const hasLast = typeof $input.last === 'function';
            return {
                success: hasAll && hasFirst && hasLast,
                details: `all: ${hasAll}, first: ${hasFirst}, last: ${hasLast}`
            };
        }
    },
    {
        name: 'Workflow Helpers',
        test: () => {
            const param = $getNodeParameter('testParam', 'default');
            const staticData = $getWorkflowStaticData('global');
            return {
                success: param !== undefined && staticData !== undefined,
                details: `getNodeParameter: ${!!param}, getWorkflowStaticData: ${!!staticData}`
            };
        }
    },
    {
        name: 'Pre-loaded Libraries Sample',
        test: () => {
            const lodashWorks = typeof _.map === 'function';
            const dayjsWorks = typeof dayjs === 'function';
            const uuidWorks = typeof uuid.v4 === 'function';
            return {
                success: lodashWorks && dayjsWorks && uuidWorks,
                details: `lodash: ${lodashWorks}, dayjs: ${dayjsWorks}, uuid: ${uuidWorks}`
            };
        }
    }
];

let passed = 0;
mockTests.forEach(test => {
    try {
        const result = test.test();
        if (result.success) {
            console.log(`✅ ${test.name}: PASS`);
            console.log(`   📝 ${result.details}`);
            passed++;
        } else {
            console.log(`❌ ${test.name}: FAIL`);
            console.log(`   📝 ${result.details}`);
        }
    } catch (error) {
        console.log(`❌ ${test.name}: ERROR`);
        console.log(`   🐛 ${error.message}`);
    }
});

console.log(`\n📊 Mock Test Results: ${passed}/${mockTests.length} passed`);
console.log('✨ This demonstrates expected behavior when workflow context is available');

// Return test results
return {
    mockTestSuite: 'n8n Context Simulation',
    passed: passed,
    total: mockTests.length,
    message: passed === mockTests.length 
        ? 'All mock tests passed - context injection working as expected'
        : 'Some mock tests failed - potential issues with context setup'
};