# Testing and Debugging n8n Custom Nodes (2025)

Complete guide for local development, testing, and debugging custom n8n nodes.

## 🚀 Local Development Setup

### Prerequisites
```bash
# Required software
- Node.js >= 20.15
- npm >= 9.0
- n8n >= 1.0 (latest)
- Git
- Code editor (VS Code recommended)
```

### Development Environment Setup

#### Method 1: Local n8n Installation (Recommended)
```bash
# 1. Install n8n globally
npm install -g n8n

# 2. Clone your node project
git clone your-custom-nodes-repo
cd your-custom-nodes-repo

# 3. Install dependencies
npm install

# 4. Build your nodes
npm run build

# 5. Link to n8n (creates symlink)
npm link
cd ~/.n8n/custom/
npm link your-node-package-name

# 6. Start n8n in development mode
n8n start --tunnel
```

#### Method 2: Docker Development (Isolated)
```bash
# 1. Create docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin123
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ./dist:/home/node/.n8n/custom/
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:

# 2. Build and start
npm run build
docker-compose up -d

# 3. Access at http://localhost:5678
```

## 🔧 Development Workflow

### Hot Reload Development
```bash
# Terminal 1: Watch for changes and rebuild
npm run dev

# Terminal 2: Start n8n
n8n start --tunnel

# Terminal 3: Monitor logs
tail -f ~/.n8n/logs/n8n.log
```

### Build and Test Cycle
```bash
# 1. Make changes to your node
# 2. Build the project
npm run build

# 3. Restart n8n (if not using hot reload)
# Ctrl+C to stop, then:
n8n start --tunnel

# 4. Test in n8n UI
# Go to http://localhost:5678
```

## 🧪 Testing Strategies

### 1. Manual Testing in n8n UI

#### Basic Node Testing
1. **Create Test Workflow**
   ```
   Manual Trigger → Your Custom Node → Set Node
   ```

2. **Test Different Inputs**
   ```json
   // Test with minimal data
   { "id": 1, "name": "test" }
   
   // Test with complex data
   {
     "user": {
       "id": 123,
       "profile": {
         "name": "John Doe",
         "emails": ["john@example.com"]
       }
     },
     "metadata": {
       "timestamp": "2025-01-09T10:00:00Z",
       "tags": ["important", "user"]
     }
   }
   
   // Test with edge cases
   { }  // Empty object
   { "value": null }  // Null values
   { "text": "" }     // Empty strings
   ```

3. **Test Error Conditions**
   - Invalid API keys
   - Network timeouts
   - Malformed responses
   - Missing required parameters

#### Advanced Testing Scenarios
```javascript
// Test with multiple items
[
  { "id": 1, "action": "create" },
  { "id": 2, "action": "update" },  
  { "id": 3, "action": "delete" }
]

// Test with large datasets (performance)
Array.from({length: 100}, (_, i) => ({
  id: i + 1,
  data: `test-data-${i + 1}`
}))

// Test concurrent executions
// Create workflow that runs your node multiple times simultaneously
```

### 2. Automated Testing with Jest

#### Basic Node Test
```typescript
// tests/nodes/YourNode.test.ts
import { WorkflowTestData } from '../types';
import { executeWorkflow } from '../helpers';

describe('YourNode', () => {
  it('should transform data correctly', async () => {
    const workflowData: WorkflowTestData = {
      nodes: [
        {
          name: 'Start',
          type: 'n8n-nodes-base.start',
          parameters: {},
          position: [100, 200],
        },
        {
          name: 'YourNode',
          type: 'yourNodeType',
          parameters: {
            operation: 'transform',
            field: 'name',
          },
          position: [300, 200],
        },
      ],
      connections: {
        Start: {
          main: [
            [{ node: 'YourNode', type: 'main', index: 0 }],
          ],
        },
      },
    };

    const result = await executeWorkflow(workflowData, [
      { json: { name: 'John Doe', age: 30 } },
    ]);

    expect(result[0][0].json).toEqual({
      name: 'John Doe',
      age: 30,
      transformedName: 'JOHN DOE',
    });
  });

  it('should handle errors gracefully', async () => {
    const workflowData: WorkflowTestData = {
      // ... workflow definition
    };

    const result = await executeWorkflow(workflowData, [
      { json: { invalidData: true } },
    ]);

    expect(result[0][0].json.error).toBeDefined();
  });
});
```

#### API Integration Testing
```typescript
// tests/nodes/ApiNode.test.ts
import nock from 'nock';

describe('ApiNode', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should make correct API calls', async () => {
    // Mock external API
    nock('https://api.example.com')
      .get('/users/123')
      .reply(200, { id: 123, name: 'John Doe' });

    const workflowData: WorkflowTestData = {
      nodes: [
        // ... node configuration
      ],
    };

    const result = await executeWorkflow(workflowData, [
      { json: { userId: 123 } },
    ]);

    expect(result[0][0].json.name).toBe('John Doe');
  });

  it('should handle API errors', async () => {
    nock('https://api.example.com')
      .get('/users/123')
      .reply(404, { error: 'User not found' });

    const result = await executeWorkflow(workflowData, [
      { json: { userId: 123 } },
    ]);

    expect(result[0][0].json.error).toContain('User not found');
  });
});
```

## 🐛 Debugging Techniques

### 1. Console Logging (Development Only)
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  
  // Debug input data
  console.log('📥 Input data:', JSON.stringify(items, null, 2));
  
  const returnData: INodeExecutionData[] = [];

  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    try {
      const item = items[itemIndex];
      
      // Debug processing steps
      console.log(`🔄 Processing item ${itemIndex}:`, item.json);
      
      const result = await this.processItem(item);
      
      console.log(`✅ Result for item ${itemIndex}:`, result);
      
      returnData.push(result);
    } catch (error) {
      console.error(`❌ Error processing item ${itemIndex}:`, error);
      throw error;
    }
  }
  
  console.log('📤 Final output:', JSON.stringify(returnData, null, 2));
  return [returnData];
}
```

### 2. VS Code Debugging Setup

#### Launch Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug n8n Custom Node",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/n8n/bin/n8n",
      "args": ["start"],
      "env": {
        "NODE_ENV": "development",
        "N8N_LOG_LEVEL": "debug"
      },
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Debugging Steps
1. Set breakpoints in your TypeScript files
2. Press F5 to start debugging
3. n8n will start with debugger attached
4. Execute your workflow to hit breakpoints

### 3. Advanced Debugging with n8n Logs

#### Enable Debug Logging
```bash
# Set environment variables
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=file,console

# Start n8n
n8n start --tunnel
```

#### Log Analysis
```bash
# Monitor logs in real-time
tail -f ~/.n8n/logs/n8n.log

# Search for specific errors
grep "ERROR" ~/.n8n/logs/n8n.log

# Filter by your node
grep "YourNodeName" ~/.n8n/logs/n8n.log

# Check execution logs
grep "workflow execution" ~/.n8n/logs/n8n.log
```

## 📊 Performance Testing

### 1. Load Testing Setup
```typescript
// tests/performance/LoadTest.test.ts
describe('Performance Tests', () => {
  it('should handle 100 items efficiently', async () => {
    const startTime = Date.now();
    
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      json: { id: i + 1, data: `test-${i + 1}` }
    }));
    
    const result = await executeWorkflow(workflowData, largeDataset);
    
    const executionTime = Date.now() - startTime;
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(100);
    expect(executionTime).toBeLessThan(5000); // 5 seconds max
  });

  it('should not exceed memory limits', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    await executeWorkflow(workflowData, largeDataset);
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not increase by more than 50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

### 2. Monitoring Performance in Development
```bash
# Monitor memory usage
node --inspect --max-old-space-size=4096 ./node_modules/n8n/bin/n8n start

# Use Chrome DevTools for profiling
# Navigate to chrome://inspect
# Click "inspect" on your n8n process
```

## 🔍 Common Debugging Scenarios

### 1. Node Not Appearing in n8n
```bash
# Check if build was successful
npm run build
ls -la dist/

# Verify package.json registration
cat package.json | grep -A 10 '"n8n"'

# Check n8n logs for loading errors
grep "custom node" ~/.n8n/logs/n8n.log
```

### 2. Authentication Issues
```typescript
// Debug credential loading
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  try {
    const credentials = await this.getCredentials('yourCredentialType');
    console.log('🔑 Credentials loaded:', Object.keys(credentials));
    
    // Test authentication
    const testResponse = await this.helpers.httpRequest({
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
      },
    });
    
    console.log('🔓 Auth test successful');
  } catch (error) {
    console.error('🚫 Auth failed:', error);
    throw error;
  }
}
```

### 3. Data Processing Issues
```typescript
// Debug data flow
for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
  const item = items[itemIndex];
  
  // Validate input structure
  console.log(`Item ${itemIndex} keys:`, Object.keys(item.json));
  console.log(`Item ${itemIndex} data:`, item.json);
  
  // Check for expected fields
  const requiredFields = ['id', 'name', 'email'];
  const missingFields = requiredFields.filter(field => !(field in item.json));
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ Missing fields in item ${itemIndex}:`, missingFields);
  }
}
```

## 🧹 Testing Best Practices

### 1. Test Data Management
```typescript
// tests/fixtures/testData.ts
export const validUserData = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  profile: {
    age: 30,
    location: 'New York'
  }
};

export const invalidUserData = {
  id: 'invalid',
  email: 'not-an-email',
};

export const emptyData = {};

export const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`
}));
```

### 2. Environment-Specific Testing
```bash
# Development testing
npm run test:dev

# Production-like testing
NODE_ENV=production npm run test

# CI/CD testing
npm run test:ci
```

### 3. Integration Testing
```typescript
// Test with real APIs (use sparingly)
describe('Integration Tests', () => {
  it('should work with real API', async () => {
    // Only run in specific environments
    if (process.env.RUN_INTEGRATION_TESTS !== 'true') {
      return;
    }
    
    const realApiResult = await executeWorkflow(workflowData, testData);
    expect(realApiResult).toBeDefined();
  });
});
```

## 📈 Continuous Testing

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Test Custom Nodes

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint
```

## 🎯 Debugging Checklist

When your node isn't working:

- [ ] **Build successful?** `npm run build` shows no errors
- [ ] **Node registered?** Listed in package.json n8n section
- [ ] **Files in right place?** Check dist/ directory structure
- [ ] **n8n restarted?** After changes, restart n8n
- [ ] **Logs checked?** Look at ~/.n8n/logs/n8n.log
- [ ] **Credentials valid?** Test authentication separately
- [ ] **Input data valid?** Log and inspect input structure
- [ ] **Error handling working?** Test failure scenarios
- [ ] **Performance acceptable?** Test with larger datasets

---

This testing and debugging guide ensures your custom n8n nodes are reliable, performant, and maintainable. Always test thoroughly before publishing!