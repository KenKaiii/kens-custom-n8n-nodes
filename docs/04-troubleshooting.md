# 🚨 N8N Node Troubleshooting Guide

**Common issues, diagnostics, and solutions**

## Quick Diagnostics

### Essential Checks
```bash
# 1. Check Node.js version
node --version  # Should be 20.18+

# 2. Check n8n version
n8n --version

# 3. Check build output
ls -la dist/

# 4. Check n8n startup logs
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

## Common Issues & Solutions

### 1. Custom Nodes Don't Appear

#### Problem
Your custom nodes don't show up in the n8n node palette.

#### Symptoms
- N8N starts without errors
- Built-in nodes work fine
- Custom nodes missing from palette

#### Solutions

**Check Environment Variable**
```bash
# Verify path is correct
echo $N8N_CUSTOM_EXTENSIONS
ls -la $N8N_CUSTOM_EXTENSIONS

# Should show your built nodes
ls -la $N8N_CUSTOM_EXTENSIONS/*.node.js
```

**Check Build Output**
```bash
npm run build
ls -la dist/

# Should contain:
# - package.json
# - YourNode/YourNode.node.js
# - YourNode/YourNode.node.d.ts
```

**Verify package.json Configuration**
```json
{
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "YourNode/YourNode.node.js"
    ]
  }
}
```

**Restart N8N Completely**
```bash
# Kill all n8n processes
pkill -f n8n

# Start fresh
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

### 2. Build Failures

#### TypeScript Compilation Errors
```bash
# Check for TypeScript errors
npm run build

# Common issues:
# - Missing imports
# - Type mismatches
# - Syntax errors
```

**Solution Example:**
```typescript
// ❌ Wrong
import { INodeType } from 'n8n-workflow';

// ✅ Correct
import {
    INodeType,
    INodeTypeDescription,
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';
```

#### Missing Dependencies
```bash
# Install missing dependencies
npm install

# Check for peer dependencies
npm ls
```

### 3. Runtime Execution Errors

#### Node Crashes on Execution

**Symptom**: Node appears in palette but fails when executed.

**Debug Steps:**
```typescript
// Add extensive logging
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    try {
        console.log('[DEBUG] Starting execution');
        
        const items = this.getInputData();
        console.log('[DEBUG] Input items:', JSON.stringify(items, null, 2));
        
        const param = this.getNodeParameter('paramName', 0);
        console.log('[DEBUG] Parameter value:', param);
        
        // Your logic here
        
        console.log('[DEBUG] Execution completed successfully');
        return [results];
        
    } catch (error) {
        console.error('[DEBUG] Execution failed:', error);
        throw error;
    }
}
```

**Common Causes:**
- Undefined parameters
- Null/undefined input data
- Type mismatches
- Async operations not awaited

### 4. Parameter Issues

#### Parameters Not Showing
```typescript
// ❌ Wrong: Missing required fields
{
    displayName: 'My Parameter',
    name: 'myParam',
    // Missing: type, default, description
}

// ✅ Correct: All required fields
{
    displayName: 'My Parameter',
    name: 'myParam',
    type: 'string',
    default: '',
    description: 'Description of the parameter',
}
```

#### Conditional Display Not Working
```typescript
// ❌ Wrong: Incorrect condition syntax
displayOptions: {
    show: {
        operation: 'transform'  // Should be array
    }
}

// ✅ Correct: Array format
displayOptions: {
    show: {
        operation: ['transform']
    }
}
```

### 5. Data Handling Issues

#### Empty Results
```typescript
// Check if you're returning data correctly
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const results = [];
    
    // Process items...
    
    // ❌ Wrong: Returning empty array
    return [];
    
    // ❌ Wrong: Not wrapping in array
    return results;
    
    // ✅ Correct: Proper format
    return [results];
}
```

#### Data Type Issues
```typescript
// Handle different input types
const processValue = (value: any) => {
    if (value === null || value === undefined) {
        return null;
    }
    
    if (typeof value === 'string') {
        return value.trim();
    }
    
    if (typeof value === 'number') {
        return value;
    }
    
    // Handle objects and arrays
    return JSON.stringify(value);
};
```

### 6. Performance Issues

#### Memory Leaks
```typescript
// ❌ Wrong: Keeping references
const globalCache = new Map();

async execute() {
    globalCache.set('data', hugeDataSet);
    // Memory leak - never cleaned up
}

// ✅ Correct: Local variables
async execute() {
    const localCache = new Map();
    // Automatically garbage collected
}
```

#### Slow Execution
```typescript
// Add timing measurements
const startTime = Date.now();

// Your processing logic

const endTime = Date.now();
console.log(`[PERF] Execution took ${endTime - startTime}ms`);

// Profile specific operations
const operationStart = Date.now();
await slowOperation();
console.log(`[PERF] Slow operation: ${Date.now() - operationStart}ms`);
```

## Environment Issues

### 1. Path Problems

#### Windows Path Issues
```bash
# Use forward slashes or escaped backslashes
N8N_CUSTOM_EXTENSIONS=C:/path/to/dist n8n start

# Or use PowerShell
$env:N8N_CUSTOM_EXTENSIONS="C:\path\to\dist"
n8n start --tunnel
```

#### Relative vs Absolute Paths
```bash
# ❌ Wrong: Relative path
N8N_CUSTOM_EXTENSIONS=./dist n8n start

# ✅ Correct: Absolute path
N8N_CUSTOM_EXTENSIONS=/full/path/to/project/dist n8n start
```

### 2. Permission Issues

#### File Permissions
```bash
# Check file permissions
ls -la dist/

# Fix permissions if needed
chmod -R 644 dist/*.js
chmod -R 644 dist/*.json
```

#### Node.js Permissions
```bash
# If using nvm
nvm use node

# Check npm permissions
npm doctor
```

### 3. Version Conflicts

#### N8N Version Compatibility
```bash
# Check n8n version
n8n --version

# Update if needed
npm update -g n8n

# Check for breaking changes in release notes
```

#### Node.js Version Issues
```bash
# Use correct Node.js version
nvm use 20

# Check compatibility
node --version
npm --version
```

## Advanced Debugging

### 1. Enable Debug Logging
```bash
# Start n8n with debug output
DEBUG=n8n* N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

### 2. Check N8N Database
```bash
# Default SQLite location
ls -la ~/.n8n/database.sqlite

# Reset database if corrupted
rm ~/.n8n/database.sqlite
# N8N will recreate on next start
```

### 3. Network Issues
```bash
# Check port availability
netstat -an | grep 5678

# Test local access
curl http://localhost:5678

# Check tunnel connectivity (if using --tunnel)
```

### 4. Inspect Node Loading
```bash
# Watch n8n startup logs for your nodes
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel 2>&1 | grep -i "your-node-name"
```

## Error Message Reference

### Common Error Messages

#### "Cannot find module 'your-node-name'"
- **Cause**: Node not built or path incorrect
- **Solution**: Run `npm run build` and check path

#### "Node execution failed: ReferenceError"
- **Cause**: Undefined variable or parameter
- **Solution**: Check parameter names and defaults

#### "Cannot read property 'json' of undefined"
- **Cause**: No input data or incorrect data access
- **Solution**: Check `this.getInputData()` usage

#### "Maximum call stack size exceeded"
- **Cause**: Infinite recursion or memory overflow
- **Solution**: Check loops and recursive calls

#### "Timeout: Operation took too long"
- **Cause**: Long-running synchronous operations
- **Solution**: Use async/await or break into chunks

## Recovery Procedures

### 1. Complete Reset
```bash
# Stop n8n
pkill -f n8n

# Clear cache
rm -rf ~/.n8n/cache/
rm -rf node_modules/.cache/

# Rebuild everything
npm run build

# Restart
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

### 2. Fresh Installation
```bash
# Backup important data first!
cp -r ~/.n8n/workflows ~/.n8n/workflows.backup

# Remove n8n data
rm -rf ~/.n8n/

# Reinstall n8n
npm uninstall -g n8n
npm install -g n8n@latest

# Restore workflows if needed
```

### 3. Isolate Issues
```bash
# Test with minimal node
# Create simple test node with minimal functionality
# If that works, gradually add complexity
```

## Diagnostic Tools

### 1. Health Check Script
```bash
#!/bin/bash
echo "=== N8N Node Development Health Check ==="

echo "1. Node.js version:"
node --version

echo "2. NPM version:"
npm --version

echo "3. N8N version:"
n8n --version

echo "4. Build output:"
ls -la dist/

echo "5. Environment variables:"
echo "N8N_CUSTOM_EXTENSIONS: $N8N_CUSTOM_EXTENSIONS"

echo "6. Package.json n8n config:"
grep -A 10 '"n8n"' package.json

echo "=== Health Check Complete ==="
```

### 2. Test Node Template
Create a minimal test node to verify setup:

```typescript
export class TestNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Test Node',
        name: 'testNode',
        icon: 'fa:code',
        group: ['transform'],
        version: 1,
        description: 'Simple test node',
        defaults: { name: 'Test Node' },
        inputs: [{ displayName: '', type: NodeConnectionType.Main }],
        outputs: [{ displayName: '', type: NodeConnectionType.Main }],
        properties: [],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        return [[{ json: { test: 'success', timestamp: new Date().toISOString() } }]];
    }
}
```

## Getting Help

### 1. Check Resources
- **N8N Documentation**: https://docs.n8n.io/
- **N8N Community**: https://community.n8n.io/
- **GitHub Issues**: https://github.com/n8n-io/n8n/issues

### 2. Provide Information When Asking for Help
Include:
- Node.js version
- N8N version
- Operating system
- Error messages (full stack trace)
- Minimal reproduction steps
- Relevant code snippets

### 3. Create Minimal Reproduction
- Simplify to smallest failing example
- Remove unrelated code
- Provide complete, runnable example

**Issues resolved and nodes working perfectly!** ✅