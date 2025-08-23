# SuperCode v1.4.0 New Libraries - Simple Test

A simpler test that checks library availability and demonstrates basic usage.

## SuperCode JavaScript Test

```javascript
// ========================================
// CHECK LIBRARY AVAILABILITY FIRST
// ========================================

const libraryStatus = {
	franc: typeof franc !== 'undefined',
	compromise: typeof compromise !== 'undefined',
	pRetry: typeof pRetry !== 'undefined',
	pLimit: typeof pLimit !== 'undefined',
	htmlToText: typeof htmlToText !== 'undefined',
	marked: typeof marked !== 'undefined',
	jsonDiff: typeof jsonDiff !== 'undefined',
	cronParser: typeof cronParser !== 'undefined'
};

console.log('Library Availability:', libraryStatus);

const results = {
	libraryStatus: libraryStatus,
	tests: {}
};

// ========================================
// 1. LANGUAGE DETECTION TEST
// ========================================

if (libraryStatus.franc) {
	try {
		// Import the franc function properly
		const francFunc = franc.franc || franc;
		
		const testTexts = [
			"Hello world, this is an English sentence",
			"Hola mundo, esta es una oración en español",
			"Bonjour le monde, c'est une phrase en français"
		];
		
		const languageResults = testTexts.map(text => {
			const detected = typeof francFunc === 'function' ? francFunc(text) : 'function-not-found';
			return {
				text: text.substring(0, 30) + '...',
				language: detected
			};
		});
		
		results.tests.languageDetection = {
			status: 'success',
			results: languageResults
		};
	} catch (error) {
		results.tests.languageDetection = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.languageDetection = {
		status: 'library not loaded'
	};
}

// ========================================
// 2. NLP TEST WITH COMPROMISE
// ========================================

if (libraryStatus.compromise) {
	try {
		const text = "Apple Inc. was founded by Steve Jobs in Cupertino, California.";
		const doc = compromise(text);
		
		results.tests.nlp = {
			status: 'success',
			text: text,
			analysis: {
				people: doc.people ? doc.people().out('array') : [],
				places: doc.places ? doc.places().out('array') : [],
				organizations: doc.match ? doc.match('#Organization').out('array') : []
			}
		};
	} catch (error) {
		results.tests.nlp = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.nlp = {
		status: 'library not loaded'
	};
}

// ========================================
// 3. ASYNC CONTROL TEST
// ========================================

if (libraryStatus.pLimit) {
	try {
		const limitFunc = pLimit.default || pLimit;
		const limit = typeof limitFunc === 'function' ? limitFunc(2) : null;
		
		results.tests.pLimit = {
			status: 'success',
			type: typeof limitFunc,
			limitCreated: limit !== null,
			description: 'Rate limiter created with max 2 concurrent operations'
		};
	} catch (error) {
		results.tests.pLimit = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.pLimit = {
		status: 'library not loaded'
	};
}

if (libraryStatus.pRetry) {
	try {
		results.tests.pRetry = {
			status: 'success',
			type: typeof pRetry,
			hasDefault: typeof pRetry.default !== 'undefined',
			description: 'Retry library loaded for exponential backoff'
		};
	} catch (error) {
		results.tests.pRetry = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.pRetry = {
		status: 'library not loaded'
	};
}

// ========================================
// 4. HTML TO TEXT TEST
// ========================================

if (libraryStatus.htmlToText) {
	try {
		const convertFunc = htmlToText.htmlToText || htmlToText.convert || htmlToText;
		const html = '<h1>Title</h1><p>This is a <b>test</b> paragraph.</p>';
		
		let plainText = 'conversion-failed';
		if (typeof convertFunc === 'function') {
			plainText = convertFunc(html);
		} else if (typeof convertFunc === 'object' && convertFunc.htmlToText) {
			plainText = convertFunc.htmlToText(html);
		}
		
		results.tests.htmlToText = {
			status: 'success',
			originalHtml: html,
			converted: plainText,
			htmlRemoved: !plainText.includes('<h1>') && !plainText.includes('<p>')
		};
	} catch (error) {
		results.tests.htmlToText = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.htmlToText = {
		status: 'library not loaded'
	};
}

// ========================================
// 5. MARKDOWN TEST
// ========================================

if (libraryStatus.marked) {
	try {
		const markedFunc = marked.marked || marked.parse || marked;
		const markdown = '# Title\n\nThis is **bold** text.';
		
		let html = 'conversion-failed';
		if (typeof markedFunc === 'function') {
			html = markedFunc(markdown);
		} else if (typeof markedFunc === 'object' && markedFunc.marked) {
			html = markedFunc.marked(markdown);
		}
		
		results.tests.marked = {
			status: 'success',
			originalMarkdown: markdown,
			converted: html.substring(0, 100),
			hasHtml: html.includes('<h1') && html.includes('<strong>')
		};
	} catch (error) {
		results.tests.marked = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.marked = {
		status: 'library not loaded'
	};
}

// ========================================
// 6. JSON DIFF TEST
// ========================================

if (libraryStatus.jsonDiff) {
	try {
		const diffFunc = jsonDiff.diff || jsonDiff;
		
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, b: 3, c: 4 };
		
		let changes = [];
		if (typeof diffFunc === 'function') {
			changes = diffFunc(obj1, obj2);
		} else if (typeof jsonDiff === 'object' && jsonDiff.diff) {
			changes = jsonDiff.diff(obj1, obj2);
		}
		
		results.tests.jsonDiff = {
			status: 'success',
			obj1: obj1,
			obj2: obj2,
			changesFound: changes.length,
			changes: changes
		};
	} catch (error) {
		results.tests.jsonDiff = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.jsonDiff = {
		status: 'library not loaded'
	};
}

// ========================================
// 7. CRON PARSER TEST
// ========================================

if (libraryStatus.cronParser) {
	try {
		results.tests.cronParser = {
			status: 'success',
			type: typeof cronParser,
			hasClasses: cronParser.CronExpression ? true : false,
			description: 'Cron parser module loaded',
			availableProperties: Object.keys(cronParser || {}).slice(0, 5)
		};
	} catch (error) {
		results.tests.cronParser = {
			status: 'error',
			error: error.message
		};
	}
} else {
	results.tests.cronParser = {
		status: 'library not loaded'
	};
}

// ========================================
// SUMMARY
// ========================================

const loadedCount = Object.values(libraryStatus).filter(v => v).length;
const successCount = Object.values(results.tests).filter(t => t.status === 'success').length;

results.summary = {
	totalLibraries: 8,
	librariesLoaded: loadedCount,
	testsRun: Object.keys(results.tests).length,
	testsSuccessful: successCount,
	successRate: Math.round((successCount / Object.keys(results.tests).length) * 100) + '%',
	
	// Quick status
	status: loadedCount === 8 ? '✅ All libraries loaded!' : 
	        loadedCount >= 6 ? '⚠️ Most libraries loaded' : 
	        loadedCount >= 4 ? '⚡ Some libraries loaded' :
	        '❌ Libraries not loading properly',
	
	timestamp: new Date().toISOString()
};

return results;
```

## Expected Output

This simplified test will:
1. First check which libraries are actually available
2. Test each library with simple, safe operations
3. Handle cases where libraries might not be loaded
4. Provide a clear summary of what's working

Run this test first to see which libraries are actually loading in your n8n environment!