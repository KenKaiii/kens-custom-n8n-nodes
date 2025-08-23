# SuperCode Complete Library Test v1.4.3
## All Libraries with Sample Outputs

### Test All Libraries Comprehensively

```javascript
// ========================================
// COMPLETE LIBRARY TEST WITH SAMPLE OUTPUTS
// ========================================

const results = {
    metadata: {
        version: '1.4.3',
        timestamp: new Date().toISOString(),
        totalLibraries: 0,
        successCount: 0,
        failureCount: 0
    },
    libraries: {}
};

// Helper function to safely test a library
function testLibrary(name, testFunc) {
    try {
        const result = testFunc();
        results.libraries[name] = {
            status: 'success',
            ...result
        };
        results.metadata.successCount++;
        return true;
    } catch (error) {
        results.libraries[name] = {
            status: 'failed',
            error: error.message
        };
        results.metadata.failureCount++;
        return false;
    }
}

// ========================================
// CORE UTILITIES
// ========================================

// 1. Lodash
testLibrary('lodash', () => {
    const arr = [1, 2, 3, 4, 5];
    return {
        available: typeof _ !== 'undefined',
        sample: {
            map: _.map(arr, n => n * 2),
            filter: _.filter(arr, n => n > 2),
            chunk: _.chunk(arr, 2),
            uniq: _.uniq([1, 1, 2, 3, 3])
        }
    };
});

// ========================================
// DATE/TIME LIBRARIES
// ========================================

// 2. Moment
testLibrary('moment', () => {
    const now = moment();
    return {
        available: typeof moment !== 'undefined',
        sample: {
            current: now.format('YYYY-MM-DD HH:mm:ss'),
            addDays: now.add(7, 'days').format('YYYY-MM-DD'),
            timezone: moment.tz('2024-01-01', 'America/New_York').format(),
            fromNow: moment('2024-01-01').fromNow()
        }
    };
});

// 3. Dayjs
testLibrary('dayjs', () => {
    const now = dayjs();
    return {
        available: typeof dayjs !== 'undefined',
        sample: {
            current: now.format('YYYY-MM-DD HH:mm:ss'),
            addDays: now.add(7, 'day').format('YYYY-MM-DD'),
            diff: dayjs('2024-12-31').diff(now, 'day'),
            isValid: dayjs('2024-01-01').isValid()
        }
    };
});

// 4. Date-fns
testLibrary('dateFns', () => {
    const now = new Date();
    return {
        available: typeof dateFns !== 'undefined',
        sample: {
            format: dateFns.format(now, 'yyyy-MM-dd'),
            addDays: dateFns.format(dateFns.addDays(now, 7), 'yyyy-MM-dd'),
            differenceInDays: dateFns.differenceInDays(new Date('2024-12-31'), now),
            isAfter: dateFns.isAfter(now, new Date('2020-01-01'))
        }
    };
});

// ========================================
// HTTP & WEB SCRAPING
// ========================================

// 5. Axios
testLibrary('axios', () => {
    return {
        available: typeof axios !== 'undefined',
        type: typeof axios,
        methods: axios ? ['get', 'post', 'put', 'delete'].filter(m => typeof axios[m] === 'function') : [],
        sample: {
            description: 'HTTP client for API requests',
            usage: 'await axios.get("https://api.example.com/data")'
        }
    };
});

// 6. Cheerio
testLibrary('cheerio', () => {
    const html = '<div><h1>Title</h1><p class="text">Hello World</p></div>';
    const $ = cheerio.load(html);
    return {
        available: typeof cheerio !== 'undefined',
        sample: {
            h1Text: $('h1').text(),
            pText: $('.text').text(),
            elementCount: $('*').length,
            hasClass: $('p').hasClass('text')
        }
    };
});

// ========================================
// VALIDATION & DATA
// ========================================

// 7. Joi
testLibrary('joi', () => {
    const schema = joi.object({
        name: joi.string().required(),
        age: joi.number().min(0).max(120)
    });
    return {
        available: typeof joi !== 'undefined',
        sample: {
            validData: schema.validate({ name: 'John', age: 30 }).error === undefined,
            invalidData: schema.validate({ age: 150 }).error !== undefined,
            errorMessage: schema.validate({ age: 150 }).error?.message || 'No error'
        }
    };
});

// 8. Yup
testLibrary('yup', () => {
    const schema = yup.object({
        email: yup.string().email(),
        age: yup.number().positive().integer()
    });
    return {
        available: typeof yup !== 'undefined',
        sample: {
            validEmail: schema.isValidSync({ email: 'test@example.com', age: 25 }),
            invalidEmail: schema.isValidSync({ email: 'not-an-email', age: 25 }) === false,
            schemaFields: Object.keys(schema.fields || {})
        }
    };
});

// 9. Zod
testLibrary('zod', () => {
    const schema = z.object({
        name: z.string(),
        age: z.number().min(0)
    });
    return {
        available: typeof z !== 'undefined',
        sample: {
            validParse: schema.safeParse({ name: 'Alice', age: 25 }).success,
            invalidParse: schema.safeParse({ name: 123, age: -5 }).success === false,
            description: 'TypeScript-first schema validation'
        }
    };
});

// ========================================
// CRYPTO & SECURITY
// ========================================

// 10. Crypto-js
testLibrary('cryptoJs', () => {
    const message = 'Hello World';
    const secret = 'mySecret123';
    return {
        available: typeof CryptoJS !== 'undefined',
        sample: {
            md5: CryptoJS.MD5(message).toString(),
            sha256: CryptoJS.SHA256(message).toString().substring(0, 16) + '...',
            hmac: CryptoJS.HmacSHA256(message, secret).toString().substring(0, 16) + '...',
            aesEncrypt: CryptoJS.AES.encrypt(message, secret).toString().substring(0, 20) + '...'
        }
    };
});

// 11. UUID
testLibrary('uuid', () => {
    return {
        available: typeof uuid !== 'undefined',
        sample: {
            v4: uuid.v4(),
            v1: uuid.v1(),
            validate: uuid.validate('550e8400-e29b-41d4-a716-446655440000'),
            nil: uuid.NIL
        }
    };
});

// 12. JWT
testLibrary('jsonwebtoken', () => {
    const payload = { userId: 123, role: 'admin' };
    const secret = 'testSecret';
    const token = jwt.sign(payload, secret);
    return {
        available: typeof jwt !== 'undefined',
        sample: {
            token: token.substring(0, 50) + '...',
            decoded: jwt.decode(token),
            verified: jwt.verify(token, secret) !== undefined
        }
    };
});

// ========================================
// DATA FORMATS
// ========================================

// 13. XML2JS
testLibrary('xml2js', () => {
    const xml = '<root><item id="1">Test</item></root>';
    let parsed = null;
    xml2js.parseString(xml, (err, result) => {
        if (!err) parsed = result;
    });
    return {
        available: typeof xml2js !== 'undefined',
        sample: {
            parsed: parsed,
            builder: new xml2js.Builder().buildObject({ test: { value: 'hello' } })
        }
    };
});

// 14. YAML
testLibrary('yaml', () => {
    const obj = { name: 'test', items: [1, 2, 3] };
    const yamlStr = 'name: test\nitems:\n  - 1\n  - 2';
    return {
        available: typeof YAML !== 'undefined',
        sample: {
            stringify: YAML.stringify(obj),
            parse: YAML.parse(yamlStr),
            isValid: true
        }
    };
});

// 15. CSV-parse
testLibrary('csvParse', () => {
    const csv = 'name,age\nJohn,30\nJane,25';
    let parsed = [];
    csvParse(csv, { columns: true }, (err, records) => {
        if (!err) parsed = records;
    });
    return {
        available: typeof csvParse !== 'undefined',
        sample: {
            parsed: parsed,
            rowCount: parsed.length,
            columns: parsed[0] ? Object.keys(parsed[0]) : []
        }
    };
});

// 16. Papa Parse
testLibrary('papaParse', () => {
    const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
    const result = Papa.parse(csv, { header: true });
    return {
        available: typeof Papa !== 'undefined',
        sample: {
            data: result.data,
            fields: result.meta?.fields,
            rowCount: result.data?.length
        }
    };
});

// ========================================
// FILE PROCESSING
// ========================================

// 17. XLSX
testLibrary('xlsx', () => {
    return {
        available: typeof xlsx !== 'undefined',
        sample: {
            description: 'Excel file processing',
            functions: xlsx ? ['read', 'write', 'utils'].filter(f => xlsx[f]) : [],
            sheetToJson: typeof xlsx?.utils?.sheet_to_json === 'function'
        }
    };
});

// 18. PDF-lib
testLibrary('pdfLib', () => {
    return {
        available: typeof pdfLib !== 'undefined',
        sample: {
            PDFDocument: typeof pdfLib?.PDFDocument === 'function',
            rgb: typeof pdfLib?.rgb === 'function',
            degrees: typeof pdfLib?.degrees === 'function',
            description: 'PDF creation and manipulation'
        }
    };
});

// 19. Archiver
testLibrary('archiver', () => {
    return {
        available: typeof archiver !== 'undefined',
        type: typeof archiver,
        sample: {
            description: 'Create ZIP and TAR archives',
            usage: 'archiver("zip", { zlib: { level: 9 } })'
        }
    };
});

// ========================================
// IMAGE & MEDIA
// ========================================

// 20. Jimp
testLibrary('jimp', () => {
    return {
        available: typeof Jimp !== 'undefined',
        sample: {
            description: 'Image processing in pure JavaScript',
            methods: Jimp ? ['read', 'create', 'loadFont'].filter(m => typeof Jimp[m] === 'function') : []
        }
    };
});

// 21. QRCode
testLibrary('qrcode', () => {
    return {
        available: typeof QRCode !== 'undefined',
        sample: {
            description: 'QR code generation',
            methods: QRCode ? ['toDataURL', 'toString', 'toCanvas'].filter(m => typeof QRCode[m] === 'function') : []
        }
    };
});

// ========================================
// MATH & SCIENCE
// ========================================

// 22. Math.js
testLibrary('mathjs', () => {
    return {
        available: typeof math !== 'undefined',
        sample: {
            evaluate: math ? math.evaluate('2 + 3 * 4') : null,
            sqrt: math ? math.sqrt(16) : null,
            factorial: math ? math.factorial(5) : null,
            matrix: math ? math.matrix([[1, 2], [3, 4]]).size() : null
        }
    };
});

// ========================================
// TEXT & STRING PROCESSING
// ========================================

// 23. String Similarity
testLibrary('stringSimilarity', () => {
    const similarity = stringSimilarity.compareTwoStrings('hello world', 'hello earth');
    const matches = stringSimilarity.findBestMatch('hello', ['hi', 'hello', 'hola']);
    return {
        available: typeof stringSimilarity !== 'undefined',
        sample: {
            similarity: similarity,
            bestMatch: matches.bestMatch,
            ratings: matches.ratings?.slice(0, 2)
        }
    };
});

// 24. Fuse.js
testLibrary('fuse', () => {
    const list = [{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }];
    const fuse = new fuzzy(list, { keys: ['name'] });
    const result = fuse.search('jan');
    return {
        available: typeof fuzzy !== 'undefined',
        sample: {
            searchResult: result[0]?.item,
            resultCount: result.length,
            description: 'Fuzzy search library'
        }
    };
});

// 25. Slug
testLibrary('slug', () => {
    return {
        available: typeof slug !== 'undefined',
        sample: {
            basic: slug('Hello World!'),
            unicode: slug('北京 2024'),
            custom: slug('Hello/World', { replacement: '_' })
        }
    };
});

// 26. Pluralize
testLibrary('pluralize', () => {
    return {
        available: typeof pluralize !== 'undefined',
        sample: {
            plural: pluralize('apple', 5),
            singular: pluralize.singular('apples'),
            isPlural: pluralize.isPlural('apples'),
            isSingular: pluralize.isSingular('apple')
        }
    };
});

// ========================================
// UTILITIES
// ========================================

// 27. Nanoid
testLibrary('nanoid', () => {
    const id = typeof nanoid === 'function' ? nanoid() : 
               typeof nanoid === 'object' && nanoid.nanoid ? nanoid.nanoid() : 'not-available';
    return {
        available: typeof nanoid !== 'undefined',
        sample: {
            id: id,
            length: id.length,
            description: 'Tiny, secure URL-safe unique ID generator'
        }
    };
});

// 28. MS (time conversion)
testLibrary('ms', () => {
    return {
        available: typeof ms !== 'undefined',
        sample: {
            toMs: ms('2 hours'),
            toString: ms(60000),
            days: ms('10 days'),
            complex: ms('1h 30m')
        }
    };
});

// 29. Bytes
testLibrary('bytes', () => {
    return {
        available: typeof bytes !== 'undefined',
        sample: {
            parse: bytes('1KB'),
            format: bytes(1024),
            formatOptions: bytes(1500, { unitSeparator: ' ' })
        }
    };
});

// 30. Currency.js
testLibrary('currency', () => {
    const value = currency(123.45);
    return {
        available: typeof currency !== 'undefined',
        sample: {
            add: value.add(10).value(),
            multiply: value.multiply(2).value(),
            format: value.format(),
            cents: currency(1.23).cents()
        }
    };
});

// ========================================
// FORM & HTTP UTILITIES
// ========================================

// 31. QS (Query String)
testLibrary('qs', () => {
    const obj = { name: 'John', age: 30, tags: ['js', 'node'] };
    return {
        available: typeof qs !== 'undefined',
        sample: {
            stringify: qs.stringify(obj),
            parse: qs.parse('name=John&age=30'),
            nested: qs.stringify({ user: { name: 'Jane' } })
        }
    };
});

// 32. FormData
testLibrary('formData', () => {
    const form = new FormData();
    form.append('name', 'John');
    form.append('file', 'content', 'file.txt');
    return {
        available: typeof FormData !== 'undefined',
        sample: {
            type: typeof FormData,
            canAppend: typeof form.append === 'function',
            canGetHeaders: typeof form.getHeaders === 'function'
        }
    };
});

// ========================================
// FILE FORMATS
// ========================================

// 33. INI
testLibrary('ini', () => {
    const config = { database: { host: 'localhost', port: 3306 } };
    const iniString = '[database]\nhost=localhost\nport=3306';
    return {
        available: typeof ini !== 'undefined',
        sample: {
            stringify: ini.stringify(config),
            parse: ini.parse(iniString),
            sections: Object.keys(ini.parse(iniString))
        }
    };
});

// 34. TOML
testLibrary('toml', () => {
    const tomlString = 'title = "Example"\n[database]\nhost = "localhost"';
    return {
        available: typeof toml !== 'undefined',
        sample: {
            parsed: toml.parse(tomlString),
            title: toml.parse(tomlString).title,
            hasDatabase: 'database' in toml.parse(tomlString)
        }
    };
});

// ========================================
// INTERNATIONAL
// ========================================

// 35. LibPhoneNumber
testLibrary('phoneNumber', () => {
    const parsed = phoneNumber.parsePhoneNumber('+14155552671', 'US');
    return {
        available: typeof phoneNumber !== 'undefined',
        sample: {
            isValid: parsed?.isValid(),
            country: parsed?.country,
            nationalNumber: parsed?.nationalNumber,
            format: parsed?.format('INTERNATIONAL')
        }
    };
});

// 36. IBAN
testLibrary('iban', () => {
    const testIban = 'DE89370400440532013000';
    return {
        available: typeof iban !== 'undefined',
        sample: {
            isValid: iban.isValid(testIban),
            country: iban.isValid(testIban) ? testIban.substring(0, 2) : null,
            printFormat: iban.printFormat(testIban)
        }
    };
});

// ========================================
// BLOCKCHAIN (Optional)
// ========================================

// 37. Ethers
testLibrary('ethers', () => {
    return {
        available: typeof ethers !== 'undefined',
        sample: {
            hasWallet: ethers ? typeof ethers.Wallet === 'function' : false,
            hasUtils: ethers ? typeof ethers.utils === 'object' : false,
            description: 'Ethereum blockchain interaction'
        }
    };
});

// 38. Web3
testLibrary('web3', () => {
    return {
        available: typeof web3 !== 'undefined',
        sample: {
            type: typeof web3,
            description: 'Ethereum JavaScript API'
        }
    };
});

// ========================================
// MEDIA PROCESSING
// ========================================

// 39. YTDL (YouTube Download)
testLibrary('ytdl', () => {
    return {
        available: typeof ytdl !== 'undefined',
        sample: {
            type: typeof ytdl,
            description: 'YouTube video downloader',
            usage: 'ytdl(url, { quality: "highest" })'
        }
    };
});

// 40. FFmpeg
testLibrary('ffmpeg', () => {
    return {
        available: typeof ffmpeg !== 'undefined',
        sample: {
            type: typeof ffmpeg,
            description: 'Video/audio processing',
            usage: 'ffmpeg(inputPath).output(outputPath)'
        }
    };
});

// ========================================
// NEW LIBRARIES (v1.4.x)
// ========================================

// 41. Franc (Language Detection)
testLibrary('franc', () => {
    const francFunc = franc.franc || franc;
    return {
        available: typeof franc !== 'undefined',
        sample: {
            english: francFunc('Hello world, this is a test'),
            spanish: francFunc('Hola mundo, esto es una prueba'),
            french: francFunc('Bonjour le monde, ceci est un test'),
            german: francFunc('Hallo Welt, das ist ein Test'),
            detection: francFunc('The quick brown fox jumps over the lazy dog')
        }
    };
});

// 42. Compromise (NLP)
testLibrary('compromise', () => {
    const doc = compromise('Apple Inc. was founded by Steve Jobs in Cupertino, California.');
    return {
        available: typeof compromise !== 'undefined',
        sample: {
            people: doc.people().out('array'),
            places: doc.places().out('array'),
            organizations: doc.match('#Organization').out('array'),
            verbs: doc.verbs().out('array'),
            nouns: doc.nouns().out('array').slice(0, 3)
        }
    };
});

// 43. P-Retry
testLibrary('pRetry', () => {
    const retryFunc = pRetry.default || pRetry;
    return {
        available: typeof pRetry !== 'undefined',
        type: typeof retryFunc,
        sample: {
            description: 'Retry failed promises with exponential backoff',
            hasAbortError: typeof pRetry.AbortError === 'function',
            usage: 'await pRetry(asyncFunc, { retries: 3 })'
        }
    };
});

// 44. P-Limit
testLibrary('pLimit', () => {
    const limitFunc = pLimit.default || pLimit;
    const limit = typeof limitFunc === 'function' ? limitFunc(2) : null;
    return {
        available: typeof pLimit !== 'undefined',
        sample: {
            type: typeof limitFunc,
            limitCreated: limit !== null,
            activeCount: limit?.activeCount || 0,
            pendingCount: limit?.pendingCount || 0,
            description: 'Run async functions with limited concurrency'
        }
    };
});

// 45. HTML to Text
testLibrary('htmlToText', () => {
    const html = '<h1>Title</h1><p>This is <strong>bold</strong> text.</p><a href="#">Link</a>';
    const convertFunc = htmlToText.htmlToText || htmlToText.convert || htmlToText;
    let result = 'conversion-failed';
    
    if (typeof convertFunc === 'function') {
        result = convertFunc(html);
    } else if (htmlToText && typeof htmlToText.htmlToText === 'function') {
        result = htmlToText.htmlToText(html);
    }
    
    return {
        available: typeof htmlToText !== 'undefined',
        sample: {
            input: html,
            output: result,
            hasNoHtml: !result.includes('<h1>') && !result.includes('<p>')
        }
    };
});

// 46. Marked (Markdown)
testLibrary('marked', () => {
    const markdown = '# Title\n\n**Bold** and *italic* text.\n\n- Item 1\n- Item 2';
    const markedFunc = marked.marked || marked.parse || marked;
    let html = 'conversion-failed';
    
    if (typeof markedFunc === 'function') {
        html = markedFunc(markdown);
    } else if (marked && typeof marked.marked === 'function') {
        html = marked.marked(markdown);
    }
    
    return {
        available: typeof marked !== 'undefined',
        sample: {
            input: markdown,
            output: html.substring(0, 100) + '...',
            hasHtml: html.includes('<h1') && html.includes('<strong>')
        }
    };
});

// 47. JSON Diff
testLibrary('jsonDiff', () => {
    const obj1 = { a: 1, b: 2, c: { d: 3 } };
    const obj2 = { a: 1, b: 3, c: { d: 3, e: 4 }, f: 5 };
    
    let diff = null;
    if (jsonDiff && typeof jsonDiff.diff === 'function') {
        diff = jsonDiff.diff(obj1, obj2);
    } else if (typeof jsonDiff === 'function') {
        diff = jsonDiff(obj1, obj2);
    }
    
    return {
        available: typeof jsonDiff !== 'undefined',
        sample: {
            obj1: obj1,
            obj2: obj2,
            differences: diff,
            hasChanges: diff !== null && (Array.isArray(diff) ? diff.length > 0 : true)
        }
    };
});

// 48. Cron Parser
testLibrary('cronParser', () => {
    let parsed = null;
    let nextDates = [];
    
    try {
        if (cronParser && cronParser.parseExpression) {
            const interval = cronParser.parseExpression('0 0 * * *');
            parsed = true;
            nextDates = [
                interval.next().toString(),
                interval.next().toString(),
                interval.next().toString()
            ];
        }
    } catch (e) {
        parsed = false;
    }
    
    return {
        available: typeof cronParser !== 'undefined',
        sample: {
            expression: '0 0 * * * (daily at midnight)',
            parsed: parsed,
            nextRuns: nextDates.slice(0, 3),
            hasParser: typeof cronParser?.parseExpression === 'function'
        }
    };
});

// ========================================
// SUMMARY
// ========================================

results.metadata.totalLibraries = Object.keys(results.libraries).length;

// Group libraries by category
const categories = {
    'Core Utilities': ['lodash'],
    'Date/Time': ['moment', 'dayjs', 'dateFns'],
    'HTTP & Web': ['axios', 'cheerio'],
    'Validation': ['joi', 'yup', 'zod'],
    'Crypto & Security': ['cryptoJs', 'uuid', 'jsonwebtoken'],
    'Data Formats': ['xml2js', 'yaml', 'csvParse', 'papaParse'],
    'File Processing': ['xlsx', 'pdfLib', 'archiver'],
    'Image & Media': ['jimp', 'qrcode'],
    'Math': ['mathjs'],
    'Text Processing': ['stringSimilarity', 'fuse', 'slug', 'pluralize'],
    'Utilities': ['nanoid', 'ms', 'bytes', 'currency'],
    'Form & HTTP': ['qs', 'formData'],
    'File Formats': ['ini', 'toml'],
    'International': ['phoneNumber', 'iban'],
    'Blockchain': ['ethers', 'web3'],
    'Media': ['ytdl', 'ffmpeg'],
    'NLP & Language (NEW)': ['franc', 'compromise'],
    'Async Control (NEW)': ['pRetry', 'pLimit'],
    'Text Conversion (NEW)': ['htmlToText', 'marked'],
    'Data Operations (NEW)': ['jsonDiff', 'cronParser']
};

const summary = {
    overall: {
        total: results.metadata.totalLibraries,
        success: results.metadata.successCount,
        failed: results.metadata.failureCount,
        successRate: Math.round((results.metadata.successCount / results.metadata.totalLibraries) * 100) + '%'
    },
    byCategory: {}
};

for (const [category, libs] of Object.entries(categories)) {
    const categoryResults = libs.map(lib => ({
        name: lib,
        status: results.libraries[lib]?.status || 'not tested'
    }));
    
    summary.byCategory[category] = {
        total: categoryResults.length,
        success: categoryResults.filter(r => r.status === 'success').length,
        failed: categoryResults.filter(r => r.status === 'failed').length,
        libraries: categoryResults
    };
}

// Add summary to results
results.summary = summary;

// Highlight new v1.4.x libraries
results.newLibrariesStatus = {
    message: 'Version 1.4.x Added Libraries',
    libraries: {
        'franc': results.libraries.franc?.status,
        'compromise': results.libraries.compromise?.status,
        'pRetry': results.libraries.pRetry?.status,
        'pLimit': results.libraries.pLimit?.status,
        'htmlToText': results.libraries.htmlToText?.status,
        'marked': results.libraries.marked?.status,
        'jsonDiff': results.libraries.jsonDiff?.status,
        'cronParser': results.libraries.cronParser?.status
    },
    allWorking: Object.values(results.libraries)
        .filter(lib => ['franc', 'compromise', 'pRetry', 'pLimit', 'htmlToText', 'marked', 'jsonDiff', 'cronParser']
            .includes(lib.name))
        .every(lib => lib.status === 'success')
};

return results;
```

## Expected Output Structure

Each library will show:
- **status**: "success" or "failed"
- **available**: true/false
- **sample**: Actual output examples from using the library

The summary will show:
- Total libraries tested
- Success/failure counts
- Breakdown by category
- Special section for new v1.4.x libraries

## Quick Status Check

If you just want to check the new libraries quickly:

```javascript
// Quick test for just the new v1.4.x libraries
const quickTest = {
    'franc': typeof franc !== 'undefined' ? franc.franc('Hello world') : 'NOT LOADED',
    'compromise': typeof compromise !== 'undefined' ? compromise('Test').out() : 'NOT LOADED',
    'pRetry': typeof pRetry !== 'undefined' ? 'LOADED' : 'NOT LOADED',
    'pLimit': typeof pLimit !== 'undefined' ? 'LOADED' : 'NOT LOADED',
    'htmlToText': typeof htmlToText !== 'undefined' ? 'LOADED' : 'NOT LOADED',
    'marked': typeof marked !== 'undefined' ? 'LOADED' : 'NOT LOADED',
    'jsonDiff': typeof jsonDiff !== 'undefined' ? 'LOADED' : 'NOT LOADED',
    'cronParser': typeof cronParser !== 'undefined' ? 'LOADED' : 'NOT LOADED'
};

return quickTest;
```

Run this comprehensive test to verify all libraries are working correctly with sample outputs!