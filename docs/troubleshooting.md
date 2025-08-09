# Troubleshooting n8n Custom Nodes (2025)

Complete guide for diagnosing and fixing common issues with custom n8n node development.

## 🚨 Node Not Showing Up in n8n

### Symptom
After building and installing your custom node, it doesn't appear in the n8n node palette.

### Diagnosis Steps
```bash
# 1. Verify build completed successfully
npm run build
ls -la dist/

# 2. Check package.json registration
cat package.json | grep -A 15 '"n8n"'

# 3. Verify file paths exist
ls -la dist/nodes/YourNode/YourNode.node.js

# 4. Check n8n logs for loading errors
tail -f ~/.n8n/logs/n8n.log | grep -i "error\|warning"
```

### Common Causes & Solutions

#### ❌ Issue: Wrong file paths in package.json
```json
// Wrong
"nodes": [
  "dist/nodes/YourNode.node.js"  // Missing directory
]

// Correct
"nodes": [
  "dist/nodes/YourNode/YourNode.node.js"
]
```

#### ❌ Issue: Missing n8n keyword
```json
// Add to package.json keywords
"keywords": [
  "n8n-community-node-package",  // This is required!
  "n8n"
]
```

#### ❌ Issue: TypeScript compilation errors
```bash
# Check for build errors
npm run build 2>&1 | grep -i error

# Common fixes:
npm install --save-dev @types/node
npm install --save-dev n8n-workflow
```

#### ❌ Issue: Node not reloaded after changes
```bash
# Restart n8n completely
# Ctrl+C to stop, then:
n8n start --tunnel

# Or for docker:
docker-compose restart
```

## 🔐 Authentication Issues

### Symptom
Node fails with authentication errors, "Unauthorized", or credential-related errors.

### Diagnosis Steps
```typescript
// Add debug logging to your node
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  try {
    const credentials = await this.getCredentials('yourCredentialType');
    console.log('🔑 Available credential fields:', Object.keys(credentials));
    
    // Test basic request
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
      },
    });
    
    console.log('✅ Auth test successful');
  } catch (error) {
    console.error('🚫 Auth error:', error.message);
    console.error('🚫 Full error:', error);
  }
}
```

### Common Causes & Solutions

#### ❌ Issue: Credential type mismatch
```typescript
// In your node file - make sure these match
credentials: [
  {
    name: 'yourServiceApi',  // Must match credential file name
    required: true,
  },
],

// In credentials file
export class YourServiceApi implements ICredentialType {
  name = 'yourServiceApi';  // Must match exactly
}
```

#### ❌ Issue: Wrong authentication method
```typescript
// ✅ Using n8n's auth helpers
const response = await this.helpers.httpRequestWithAuthentication.call(
  this,
  'yourServiceApi',
  requestOptions,
);

// ❌ Manual auth (harder to debug)
const credentials = await this.getCredentials('yourServiceApi');
const response = await this.helpers.httpRequest({
  headers: { 'Authorization': `Bearer ${credentials.apiKey}` },
  ...requestOptions
});
```

#### ❌ Issue: Credential not registered
```json
// Add to package.json
"n8n": {
  "credentials": [
    "dist/credentials/YourServiceApi.credentials.js"
  ]
}
```

## 📊 Data Processing Errors

### Symptom
Node fails with data-related errors: "Cannot read property", "undefined", type errors.

### Diagnosis Steps
```typescript
// Add comprehensive input logging
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  
  console.log('📥 Received items count:', items.length);
  console.log('📥 First item structure:', JSON.stringify(items[0], null, 2));
  
  // Check for expected fields
  items.forEach((item, index) => {
    console.log(`Item ${index} keys:`, Object.keys(item.json));
    
    // Validate required fields
    const requiredFields = ['id', 'name'];
    const missing = requiredFields.filter(field => !(field in item.json));
    if (missing.length > 0) {
      console.warn(`⚠️ Item ${index} missing:`, missing);
    }
  });
}
```

### Common Causes & Solutions

#### ❌ Issue: Assuming data structure
```typescript
// ❌ Wrong - assumes structure
const userId = item.json.user.id;  // Fails if user is undefined

// ✅ Correct - validate first
const user = item.json.user;
if (!user || typeof user !== 'object') {
  throw new Error('User object is required');
}
const userId = user.id;
if (!userId) {
  throw new Error('User ID is required');
}
```

#### ❌ Issue: Not handling empty data
```typescript
// ✅ Handle edge cases
const items = this.getInputData();

if (items.length === 0) {
  return [[{ json: { message: 'No items to process' } }]];
}

for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
  const item = items[itemIndex];
  
  // Handle empty objects
  if (!item.json || Object.keys(item.json).length === 0) {
    if (this.continueOnFail()) {
      returnData.push({ json: { error: 'Empty input item' } });
      continue;
    } else {
      throw new Error(`Item ${itemIndex} is empty`);
    }
  }
}
```

#### ❌ Issue: Type conversion errors
```typescript
// ✅ Safe type handling
const numericParam = this.getNodeParameter('count', itemIndex);
const count = typeof numericParam === 'string' ? parseInt(numericParam, 10) : numericParam;

if (isNaN(count) || count < 0) {
  throw new Error('Count must be a positive number');
}
```

## 🌐 HTTP/API Request Issues

### Symptom
API requests fail with timeout, connection, or HTTP errors.

### Diagnosis Steps
```typescript
// Enhanced error logging for HTTP requests
try {
  const requestOptions: IHttpRequestOptions = {
    method: 'GET',
    url: endpoint,
    timeout: 30000,
    json: true,
  };
  
  console.log('🌍 Making request:', requestOptions);
  
  const response = await this.helpers.httpRequest(requestOptions);
  
  console.log('✅ Response received:', {
    status: response.statusCode,
    headers: response.headers,
    bodyType: typeof response,
  });
  
  return response;
  
} catch (error) {
  console.error('🚨 HTTP Error details:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    config: error.config,
  });
  throw error;
}
```

### Common Causes & Solutions

#### ❌ Issue: Timeout errors
```typescript
// ✅ Increase timeout for slow APIs
const requestOptions: IHttpRequestOptions = {
  method: 'GET',
  url: endpoint,
  timeout: 60000,  // 60 seconds instead of default 30
};

// ✅ Add retry logic
let retries = 3;
while (retries > 0) {
  try {
    const response = await this.helpers.httpRequest(requestOptions);
    return response;
  } catch (error) {
    retries--;
    if (retries === 0 || error.response?.status !== 429) {
      throw error;
    }
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

#### ❌ Issue: SSL/Certificate errors
```typescript
// ✅ Handle SSL issues (development only)
const requestOptions: IHttpRequestOptions = {
  method: 'GET',
  url: endpoint,
  rejectUnauthorized: false,  // Only for development
};
```

#### ❌ Issue: Rate limiting
```typescript
// ✅ Implement rate limiting
class RateLimiter {
  private lastRequest = 0;
  private minInterval = 1000; // 1 second between requests
  
  async wait() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequest = Date.now();
  }
}

const rateLimiter = new RateLimiter();

// Before each request
await rateLimiter.wait();
const response = await this.helpers.httpRequest(requestOptions);
```

## 🎛️ UI/Parameter Issues

### Symptom
Node parameters don't work as expected, conditional display issues, or validation errors.

### Diagnosis Steps
```typescript
// Debug parameter values
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    // Log all parameters for this item
    console.log(`📋 Parameters for item ${itemIndex}:`);
    
    const paramNames = ['operation', 'resource', 'userId', 'options'];
    paramNames.forEach(paramName => {
      try {
        const value = this.getNodeParameter(paramName, itemIndex);
        console.log(`  ${paramName}:`, typeof value, value);
      } catch (error) {
        console.log(`  ${paramName}: [NOT SET]`);
      }
    });
  }
}
```

### Common Causes & Solutions

#### ❌ Issue: Conditional display not working
```typescript
// ✅ Correct displayOptions syntax
{
  displayName: 'User ID',
  name: 'userId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['user'],         // Array of values
      operation: ['get', 'update'], // Multiple values
    },
  },
  default: '',
}
```

#### ❌ Issue: Default values not working
```typescript
// ✅ Proper default value handling
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 10,
  description: 'Maximum number of items to return',
}

// In execute function
const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
```

#### ❌ Issue: Complex parameter validation
```typescript
// ✅ Add parameter validation
const email = this.getNodeParameter('email', itemIndex) as string;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  throw new Error('Please provide a valid email address');
}
```

## 🏗️ Build and Development Issues

### Symptom
Build failures, TypeScript errors, or development workflow problems.

### Common Causes & Solutions

#### ❌ Issue: TypeScript compilation errors
```bash
# Check TypeScript configuration
cat tsconfig.json

# Common fixes:
npm install --save-dev typescript@latest
npm install --save-dev @types/node

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### ❌ Issue: Gulp build failures
```javascript
// gulpfile.js - ensure correct paths
function copyIcons() {
  const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
  const nodeDestination = path.resolve('dist', 'nodes');

  src(nodeSource).pipe(dest(nodeDestination));

  const credSource = path.resolve('credentials', '**', '*.{png,svg}');
  const credDestination = path.resolve('dist', 'credentials');

  return src(credSource).pipe(dest(credDestination));
}
```

#### ❌ Issue: Missing dependencies
```bash
# Install missing n8n dependencies
npm install --save-dev n8n-workflow
npm install --save-dev @types/jest

# Check peer dependencies
npm ls --depth=0
```

## 🐛 Runtime Errors

### Symptom
Node crashes during execution, memory issues, or unexpected behavior.

### Diagnosis Steps
```typescript
// Add comprehensive error boundaries
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];
  
  console.log(`🚀 Starting execution with ${items.length} items`);
  console.log(`💾 Memory usage:`, process.memoryUsage());
  
  try {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        console.log(`📊 Processing item ${itemIndex + 1}/${items.length}`);
        
        const result = await this.processItem(items[itemIndex], itemIndex);
        returnData.push(result);
        
        // Memory check for large datasets
        if (itemIndex % 100 === 0) {
          const memUsage = process.memoryUsage();
          console.log(`💾 Memory at item ${itemIndex}:`, {
            rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          });
        }
        
      } catch (itemError) {
        console.error(`❌ Error processing item ${itemIndex}:`, itemError);
        
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: itemError.message,
              itemIndex,
              timestamp: new Date().toISOString(),
            },
          });
        } else {
          throw itemError;
        }
      }
    }
    
    console.log(`✅ Execution completed. Processed ${returnData.length} items`);
    return [returnData];
    
  } catch (generalError) {
    console.error('🚨 General execution error:', generalError);
    throw generalError;
  }
}
```

### Common Causes & Solutions

#### ❌ Issue: Memory leaks
```typescript
// ✅ Process in batches to avoid memory issues
const BATCH_SIZE = 50;

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  
  const batchResults = await Promise.all(
    batch.map((item, batchIndex) => 
      this.processItem(item, i + batchIndex)
    )
  );
  
  returnData.push(...batchResults);
  
  // Force garbage collection between batches (if enabled)
  if (global.gc && i % (BATCH_SIZE * 4) === 0) {
    global.gc();
  }
}
```

#### ❌ Issue: Async/await problems
```typescript
// ❌ Wrong - loses error context
const promises = items.map(item => this.processItem(item));
const results = await Promise.all(promises);

// ✅ Correct - proper error handling
const results = [];
for (let i = 0; i < items.length; i++) {
  try {
    const result = await this.processItem(items[i], i);
    results.push(result);
  } catch (error) {
    console.error(`Item ${i} failed:`, error);
    // Handle error appropriately
  }
}
```

## 🔧 Development Environment Issues

### Symptom
Local n8n setup problems, hot reload not working, or debugging issues.

### Solutions

#### ❌ Issue: n8n not loading custom nodes locally
```bash
# Method 1: Direct linking
cd your-node-project
npm run build
npm link

cd ~/.n8n/custom
npm link your-node-package-name

# Method 2: Copy dist files
cp -r ./dist/* ~/.n8n/custom/
```

#### ❌ Issue: Hot reload not working
```bash
# Use nodemon for automatic restarts
npm install -g nodemon

# Watch and restart n8n
nodemon --watch dist --exec "n8n start --tunnel"
```

#### ❌ Issue: Can't debug with breakpoints
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug n8n",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/n8n",
      "args": ["start", "--tunnel"],
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## 📋 Diagnostic Commands

### Quick Health Check
```bash
#!/bin/bash
# save as check-node-health.sh

echo "🏥 n8n Node Health Check"
echo "========================"

echo "📦 Package Info:"
cat package.json | jq '.name, .version, .n8n'

echo -e "\n🔨 Build Status:"
npm run build 2>&1 | tail -5

echo -e "\n📁 Dist Structure:"
find dist -type f -name "*.js" | head -10

echo -e "\n🧪 Test Status:"
npm test 2>&1 | tail -3

echo -e "\n📊 Dependencies:"
npm ls --depth=0 | grep -E "(n8n-workflow|typescript)"

echo -e "\n🚀 Ready for n8n!"
```

### Log Analysis
```bash
# Monitor n8n logs for your node
tail -f ~/.n8n/logs/n8n.log | grep -i "YourNodeName\|error\|warning"

# Extract error patterns
grep "ERROR" ~/.n8n/logs/n8n.log | grep -o "Error: [^\"]*" | sort | uniq -c

# Find execution times
grep "execution completed" ~/.n8n/logs/n8n.log | tail -10
```

## 🎯 Prevention Best Practices

### Code Quality Gates
```bash
# Pre-commit checks
npm run lint || exit 1
npm run test || exit 1
npm run build || exit 1

# Type safety
npx tsc --noEmit --strict

# Security scan
npm audit --audit-level moderate
```

### Error-First Development
```typescript
// Always implement error handling first
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  try {
    // Happy path code here
    return await this.processItems();
  } catch (error) {
    // Error handling is the priority
    console.error('Node execution failed:', error);
    
    if (this.continueOnFail()) {
      return [[{ json: { error: error.message } }]];
    }
    
    throw new Error(`${this.getNode().name} failed: ${error.message}`);
  }
}
```

---

## 🆘 Emergency Debugging Checklist

When everything breaks:

- [ ] **Check the logs** - `~/.n8n/logs/n8n.log`
- [ ] **Verify build** - `npm run build` completes
- [ ] **Test simple case** - Single item, minimal parameters
- [ ] **Check memory** - `process.memoryUsage()`
- [ ] **Restart n8n** - Sometimes it's that simple
- [ ] **Clear cache** - Delete `node_modules` and reinstall
- [ ] **Simplify code** - Comment out complex parts
- [ ] **Check n8n version** - Upgrade if needed
- [ ] **Test with curl** - Verify external APIs work
- [ ] **Ask for help** - n8n community is helpful!

Remember: Every expert was once a beginner who encountered these same issues. Keep debugging, and you'll build robust nodes! 🚀