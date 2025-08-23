# SuperCode Debug Test - Working vs Problematic Library

## Test 1: Check Library Availability

```javascript
// Simple availability check
const results = {
    lodash: {
        available: typeof _ !== 'undefined',
        type: typeof _,
        hasFunction: typeof _ === 'object' && typeof _.map === 'function'
    },
    franc: {
        available: typeof franc !== 'undefined',
        type: typeof franc,
        hasFunction: typeof franc === 'object' && typeof franc.franc === 'function'
    }
};

console.log('Library Check Results:', JSON.stringify(results, null, 2));

return results;
```

## Test 2: Try to Use Working Library (Lodash)

```javascript
// Test lodash functionality
try {
    const testArray = [1, 2, 3, 4, 5];
    const doubled = _.map(testArray, n => n * 2);
    
    return {
        library: 'lodash',
        status: 'success',
        input: testArray,
        output: doubled,
        result: 'Working correctly!'
    };
} catch (error) {
    return {
        library: 'lodash',
        status: 'error',
        error: error.message
    };
}
```

## Test 3: Try to Use Problematic Library (Franc)

```javascript
// Test franc functionality
try {
    // Check if franc exists
    if (typeof franc === 'undefined') {
        return {
            library: 'franc',
            status: 'not loaded',
            message: 'franc is undefined'
        };
    }
    
    // Try different ways to access franc
    const testText = "Hello world, this is English text";
    let result = null;
    
    // Method 1: Direct call
    if (typeof franc === 'function') {
        result = franc(testText);
        return {
            library: 'franc',
            status: 'success',
            method: 'direct function call',
            text: testText,
            detected: result
        };
    }
    
    // Method 2: franc.franc
    if (typeof franc === 'object' && typeof franc.franc === 'function') {
        result = franc.franc(testText);
        return {
            library: 'franc',
            status: 'success',
            method: 'franc.franc()',
            text: testText,
            detected: result
        };
    }
    
    // Method 3: Check what franc actually is
    return {
        library: 'franc',
        status: 'loaded but not callable',
        type: typeof franc,
        keys: typeof franc === 'object' ? Object.keys(franc).slice(0, 10) : 'not an object',
        stringify: JSON.stringify(franc).substring(0, 100)
    };
    
} catch (error) {
    return {
        library: 'franc',
        status: 'error',
        error: error.message,
        stack: error.stack
    };
}
```

## Test 4: Check Global Scope

```javascript
// Check what's available in global scope
const globalCheck = {
    // Working libraries
    lodash: typeof _ !== 'undefined',
    moment: typeof moment !== 'undefined',
    axios: typeof axios !== 'undefined',
    cheerio: typeof cheerio !== 'undefined',
    dayjs: typeof dayjs !== 'undefined',
    
    // New problematic libraries
    franc: typeof franc !== 'undefined',
    compromise: typeof compromise !== 'undefined',
    pRetry: typeof pRetry !== 'undefined',
    pLimit: typeof pLimit !== 'undefined',
    htmlToText: typeof htmlToText !== 'undefined',
    marked: typeof marked !== 'undefined',
    jsonDiff: typeof jsonDiff !== 'undefined',
    cronParser: typeof cronParser !== 'undefined'
};

const workingCount = Object.values(globalCheck).slice(0, 5).filter(v => v).length;
const problematicCount = Object.values(globalCheck).slice(5).filter(v => v).length;

return {
    globalCheck,
    summary: {
        workingLibraries: workingCount + '/5',
        problematicLibraries: problematicCount + '/8',
        analysis: problematicCount === 0 ? 'Libraries not being loaded into sandbox' : 'Some libraries loaded'
    }
};
```

## Test 5: Direct Library Test

```javascript
// Let's try to see what's happening with library loading
const debugInfo = {
    // Check if bundledLibraries exists (for debugging)
    hasBundledLibraries: typeof bundledLibraries !== 'undefined',
    
    // Try to check library loading
    lodashCheck: {
        globalAvailable: typeof _ !== 'undefined',
        canUse: false
    },
    francCheck: {
        globalAvailable: typeof franc !== 'undefined',
        canUse: false
    }
};

// Try to actually use them
try {
    debugInfo.lodashCheck.canUse = _.isArray([1, 2, 3]);
} catch (e) {
    debugInfo.lodashCheck.error = e.message;
}

try {
    if (typeof franc !== 'undefined') {
        debugInfo.francCheck.canUse = true;
        debugInfo.francCheck.type = typeof franc;
    }
} catch (e) {
    debugInfo.francCheck.error = e.message;
}

return debugInfo;
```

## Instructions

Run each test separately in your SuperCode node to see:
1. Which libraries are available in the global scope
2. Whether working libraries (like lodash) function correctly
3. What happens when trying to use problematic libraries (like franc)
4. The exact error or undefined state of new libraries

This will help us understand if:
- The libraries are bundled but not exposed to sandbox
- The libraries are exposed but with wrong names/structure
- There's a different issue with how n8n loads the bundled code