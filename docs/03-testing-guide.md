# 🧪 N8N Node Testing Guide

**How to test nodes, debug issues, and validate functionality**

## Testing Strategy

### 1. Development Testing Cycle
```bash
# 1. Make changes to node
vim nodes/MyNode/MyNode.node.ts

# 2. Build
npm run build

# 3. Restart n8n (if needed)
# Kill existing n8n process and restart

# 4. Test in browser
# Create workflow and test node
```

### 2. Testing Phases
1. **Unit Testing**: Individual node functionality
2. **Integration Testing**: Node works in workflows
3. **Edge Case Testing**: Error conditions, empty data
4. **Performance Testing**: Large datasets, memory usage

## Manual Testing

### Basic Node Testing
1. **Create Test Workflow**
   ```
   Manual Trigger → Your Custom Node → Set Node (to view output)
   ```

2. **Test Input Data**
   ```json
   [
     { "id": 1, "name": "Test Item 1" },
     { "id": 2, "name": "Test Item 2" },
     { "id": 3, "name": "Test Item 3" }
   ]
   ```

3. **Execute and Verify**
   - Click "Execute Workflow"
   - Check output in Set node
   - Verify data transformation is correct

### Testing Different Scenarios

#### Test Case 1: Normal Operation
```json
Input: [{ "text": "hello world", "count": 5 }]
Expected: [{ "text": "hello world", "count": 5, "processed": true }]
```

#### Test Case 2: Empty Input
```json
Input: []
Expected: []
```

#### Test Case 3: Invalid Data
```json
Input: [{ "invalid": null, "undefined": undefined }]
Expected: Error handling or cleaned data
```

#### Test Case 4: Large Dataset
```json
Input: Array of 1000+ items
Expected: Performance within acceptable limits
```

### Parameter Testing
Test all node parameters:
- Default values work correctly
- Required fields show validation errors
- Optional fields behave properly
- Conditional display works as expected

## Debugging Techniques

### 1. Console Logging
Add debug logs to your node:

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    console.log('[MyNode] Starting execution');
    
    const items = this.getInputData();
    console.log('[MyNode] Input items:', items.length);
    
    const operation = this.getNodeParameter('operation', 0) as string;
    console.log('[MyNode] Operation:', operation);
    
    // Your logic here
    
    console.log('[MyNode] Execution completed');
    return [results];
}
```

### 2. Check N8N Logs
Monitor n8n startup and execution logs:

```bash
# Start n8n with debug output
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel

# Look for:
# - Node loading messages
# - Execution logs
# - Error messages
```

### 3. Browser Developer Tools
- **Network Tab**: Check for API calls
- **Console Tab**: Look for JavaScript errors
- **Application Tab**: Check for stored data

### 4. Error Inspection
When nodes fail, check:
- Error message in n8n UI
- Full stack trace in terminal
- Input data that caused the error
- Node configuration at time of failure

## Automated Testing

### Test File Structure
```typescript
// tests/MyCustomNode.test.ts
import { MyCustomNode } from '../nodes/MyCustomNode/MyCustomNode.node';

describe('MyCustomNode', () => {
    let node: MyCustomNode;
    
    beforeEach(() => {
        node = new MyCustomNode();
    });
    
    test('should have correct description', () => {
        expect(node.description.displayName).toBe('My Custom Node');
        expect(node.description.name).toBe('myCustomNode');
    });
    
    test('should process data correctly', async () => {
        // Mock execution context
        const mockThis = {
            getInputData: () => [{ json: { test: 'data' } }],
            getNodeParameter: (param: string) => 'transform',
            getNode: () => ({ name: 'test' }),
            continueOnFail: () => false,
        } as any;
        
        const result = await node.execute.call(mockThis);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json).toHaveProperty('processed', true);
    });
});
```

### Run Tests
```bash
# Add test script to package.json
npm test

# Run specific test file
npx jest MyCustomNode.test.ts

# Run with coverage
npm run test:coverage
```

## Integration Testing

### Workflow Testing
Create test workflows for different scenarios:

#### Simple Workflow
```
Manual Trigger → Your Node → HTTP Request
```

#### Complex Workflow
```
Webhook → Data Processing → Your Node → Database → Email
```

#### Error Handling Workflow
```
Manual Trigger → Your Node (with invalid config) → Error Trigger
```

### Cross-Node Testing
Test your node with various input sources:
- HTTP Request nodes
- Database nodes
- File system nodes
- Other custom nodes

## Performance Testing

### Memory Usage Testing
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const startMemory = process.memoryUsage();
    console.log('[Memory] Start:', startMemory);
    
    // Your processing logic
    
    const endMemory = process.memoryUsage();
    console.log('[Memory] End:', endMemory);
    console.log('[Memory] Delta:', {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    });
    
    return [results];
}
```

### Load Testing
Test with increasing data sizes:
- 10 items
- 100 items  
- 1,000 items
- 10,000 items

Monitor:
- Execution time
- Memory usage
- N8N responsiveness
- System resource usage

## Common Test Scenarios

### Data Transformation Testing
```javascript
// Test data types
const testCases = [
    { input: 'string', expected: 'processed_string' },
    { input: 123, expected: 246 },
    { input: true, expected: false },
    { input: null, expected: null },
    { input: undefined, expected: null },
    { input: [], expected: [] },
    { input: {}, expected: {} },
];
```

### Error Condition Testing
```javascript
// Test error scenarios
const errorCases = [
    { input: null, shouldThrow: true },
    { input: '', shouldThrow: false },
    { input: 'invalid_format', shouldThrow: true },
    { config: { required_param: '' }, shouldThrow: true },
];
```

### Async Operation Testing
```typescript
test('should handle async operations', async () => {
    const result = await node.execute.call(mockContext);
    expect(result).toBeDefined();
    // Verify async operation completed
});

test('should handle timeouts', async () => {
    // Mock slow operation
    const slowMock = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 5000))
    );
    
    // Test with timeout
    await expect(
        node.executeWithTimeout.call(mockContext, 1000)
    ).rejects.toThrow('Timeout');
});
```

## Testing Checklist

### Before Release
- [ ] All parameters work correctly
- [ ] Default values are sensible
- [ ] Error messages are clear and helpful
- [ ] Node handles empty input gracefully
- [ ] Node handles malformed input gracefully
- [ ] Performance is acceptable for expected data sizes
- [ ] Memory usage is reasonable
- [ ] Integration with other nodes works
- [ ] Documentation is complete and accurate

### Regression Testing
After making changes:
- [ ] Existing functionality still works
- [ ] New features work as expected
- [ ] No new errors introduced
- [ ] Performance hasn't degraded
- [ ] All test cases still pass

## Debugging Common Issues

### Node Doesn't Appear in N8N
1. Check build output: `ls -la dist/`
2. Verify package.json n8n.nodes array
3. Check for TypeScript compilation errors
4. Restart n8n completely

### Node Crashes on Execution
1. Add console.log statements
2. Check input data format
3. Verify parameter types
4. Test with minimal data first

### Unexpected Results
1. Log input and output data
2. Verify parameter parsing
3. Check data transformation logic
4. Test each step individually

## Next Steps

1. **Production Deployment**: See [04-troubleshooting.md](./04-troubleshooting.md)
2. **Advanced Debugging**: See n8n documentation
3. **Performance Optimization**: Profile and optimize bottlenecks

**Your nodes are thoroughly tested and ready!** ✅