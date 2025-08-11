# Super Code Tool for AI Agents

A standalone CLI tool that provides the same functionality as SuperCodeNode - execute JavaScript/Python with 34+ enhanced libraries, designed for AI agent integration.

## ✨ Key Features

- **Same exact functionality** as SuperCodeNode
- **34+ JavaScript libraries** with VM-Safe lazy loading
- **30+ Python libraries** pre-imported and ready
- **CLI interface** perfect for AI agent automation
- **JSON output** for easy parsing
- **LLM-friendly errors** with detailed diagnostics
- **Standalone** - no n8n dependency required

## 🚀 Quick Start

```bash
# Basic JavaScript execution
node super-code-tool.js --lang=javascript --code="return {result: 'hello'}"

# Python execution
node super-code-tool.js --lang=python --code="result = {'message': 'hello'}"

# Execute from file
node super-code-tool.js --file=script.js --lang=javascript

# With input data
node super-code-tool.js --input='[{"name":"test"}]' --code="return $input.json"
```

## 📋 Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--lang=LANGUAGE` | Language to execute (javascript/python) | `--lang=python` |
| `--code=CODE` | Code to execute | `--code="return {result: 'test'}"` |
| `--file=FILE` | File containing code to execute | `--file=script.js` |
| `--input=JSON` | Input data as JSON array | `--input='[{"id":1}]'` |
| `--timeout=SECONDS` | Execution timeout (default: 30) | `--timeout=60` |
| `--help`, `-h` | Show help message | `--help` |

## 📚 Available Libraries

### JavaScript Libraries (34+)
```javascript
// Core Data Libraries
lodash (_), axios, dayjs, joi, validator, uuid

// Data Processing
csv-parse (csvParse), xml2js, yaml (YAML), mathjs (math)

// Web & Scraping  
cheerio, puppeteer-core (puppeteer)

// File Processing
xlsx (XLSX), pdf-lib (pdfLib), sharp, jimp (Jimp), archiver

// Crypto & Security
crypto-js (CryptoJS), bcrypt, jsonwebtoken (jwt), node-forge (forge)

// Blockchain
ethers, web3

// Templating & Utilities
handlebars (Handlebars), qrcode (QRCode), natural

// International
libphonenumber-js (phoneNumber), currency.js (currency), iban

// Advanced
fuse.js (fuzzy), fast-xml-parser (XMLParser), moment-timezone (moment)
```

### Python Libraries (30+)
```python
# Pre-imported and ready to use
pandas as pd, numpy as np, requests, datetime, json, sys
urllib.parse, re, hashlib, base64, uuid, os

# Plus many more available via import
```

## 🤖 AI Agent Integration Examples

### Basic Usage
```bash
# Simple calculation
node super-code-tool.js --lang=javascript --code="return {result: 2 + 2}"

# Data transformation with lodash
node super-code-tool.js --lang=javascript --code="return {result: _.map([1,2,3], x => x * 2)}"

# HTTP request with axios
node super-code-tool.js --lang=javascript --code="const data = await axios.get('https://api.github.com'); return {status: data.status}"
```

### Processing Input Data
```bash
# Transform input data
node super-code-tool.js --input='[{"name":"john"},{"name":"jane"}]' --code="return $input.json.map(item => ({...item, greeting: 'Hello ' + item.name}))"

# Python data analysis
node super-code-tool.js --lang=python --input='[{"value":1},{"value":2},{"value":3}]' --code="
import pandas as pd
df = pd.DataFrame(data)
result = {
    'mean': df['value'].mean(),
    'sum': df['value'].sum(),
    'count': len(df)
}
"
```

### File Processing
```bash
# Create script file
echo "return {message: 'Hello from file!', time: new Date().toISOString()}" > test-script.js

# Execute from file
node super-code-tool.js --file=test-script.js --lang=javascript
```

## 🔧 Advanced Examples

### Web Scraping
```bash
node super-code-tool.js --lang=javascript --code="
const response = await axios.get('https://httpbin.org/json');
const data = response.data;
return {
  source: 'httpbin',
  data: data,
  timestamp: new Date().toISOString()
};
"
```

### Data Processing with Libraries
```bash
node super-code-tool.js --lang=javascript --code="
const data = [
  {name: 'Apple', price: 1.5},
  {name: 'Banana', price: 0.8},
  {name: 'Orange', price: 2.0}
];
const total = _.sumBy(data, 'price');
const avgPrice = _.meanBy(data, 'price');
return {
  items: data.length,
  total: total,
  average: avgPrice,
  formatted: \`Total: \${total.toFixed(2)}\`
};
"
```

### Crypto & Security
```bash
node super-code-tool.js --lang=javascript --code="
const input = 'Hello World';
const hash = CryptoJS.SHA256(input).toString();
const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
return {
  original: input,
  sha256: hash,
  base64: encoded
};
"
```

## 🎯 AI Agent Integration Patterns

### 1. Direct Command Execution
```javascript
const { exec } = require('child_process');

function executeCode(language, code, inputData = []) {
  return new Promise((resolve, reject) => {
    const input = JSON.stringify(inputData);
    const command = `node super-code-tool.js --lang=${language} --input='${input}' --code="${code}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      }
    });
  });
}
```

### 2. Batch Processing
```bash
# Process multiple operations
for operation in "math" "data" "web"; do
  node super-code-tool.js --file="operations/${operation}.js" --lang=javascript
done
```

### 3. API Integration
```bash
# Use as microservice
curl -X POST localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript", 
    "code": "return {result: _.random(1, 100)}"
  }' | jq '.'
```

## 🛠️ Error Handling

The tool provides LLM-friendly error messages with specific error codes:

```bash
# Example error output
{
  "error": "🤖 LLM-FRIENDLY ERROR [E005]\n📍 Library: axios\n🔍 Issue: Cannot read property 'get' of undefined\n💡 Fix: Add await before async operations: await axios.get()\n📝 Context: {...}\n🔗 Stack: ..."
}
```

## 🔒 Security Features

- **VM sandboxing** for JavaScript execution
- **Process isolation** for Python execution
- **Timeout protection** (configurable)
- **Memory limits** (built-in monitoring)
- **Input sanitization** (utility functions available)

## 📦 Installation Requirements

Ensure you have all dependencies installed:

```bash
# Install JavaScript libraries
npm install lodash axios dayjs joi validator uuid csv-parse handlebars cheerio crypto-js xlsx pdf-lib mathjs xml2js yaml sharp jimp qrcode natural archiver puppeteer-core knex node-forge moment-timezone fast-xml-parser jsonwebtoken bcrypt ethers web3 libphonenumber-js currency.js iban fuse.js

# Install Python dependencies (if using Python)
pip3 install pandas numpy requests
```

## 💡 Tips for AI Agents

1. **Always parse JSON output** - The tool returns structured JSON
2. **Handle timeouts gracefully** - Use `--timeout` for long operations
3. **Batch similar operations** - More efficient than individual calls
4. **Use file execution** - For complex, reusable scripts
5. **Monitor memory usage** - Use `utils.memoryUsage()` in JavaScript
6. **Leverage error codes** - Parse LLM-friendly error messages for debugging

## 🚀 Performance Notes

- **First library load** takes longer (lazy loading)
- **Subsequent calls** use cached libraries
- **Python startup** has ~200ms overhead
- **JavaScript VM** is faster for simple operations
- **Memory cleanup** available via `utils.cleanup()`

## 🔍 Troubleshooting

### Common Issues
- **Python not found**: Ensure `python3` is in PATH
- **Library missing**: Check npm/pip installation  
- **Timeout errors**: Increase `--timeout` value
- **JSON parsing**: Ensure code returns valid data structure

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* node super-code-tool.js --lang=javascript --code="return {debug: true}"
```

---

Perfect for AI agents that need powerful, sandboxed code execution with extensive library support! 🤖✨