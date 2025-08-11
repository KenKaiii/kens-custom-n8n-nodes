# 🤖 Claude Assistant Guide for N8N Node Development

**What Claude should tell users about using this template**

## Quick Response Templates

### When Users Ask About N8N Node Development

**Response Framework:**
```
I'll help you with N8N node development! This template provides everything you need.

## Immediate Steps:
1. **Setup**: Follow [docs/01-setup-guide.md](./01-setup-guide.md) for complete setup
2. **Create**: Use [docs/02-node-creation-guide.md](./02-node-creation-guide.md) for node creation
3. **Test**: See [docs/03-testing-guide.md](./03-testing-guide.md) for testing approaches
4. **Debug**: Check [docs/04-troubleshooting.md](./04-troubleshooting.md) for common issues

## What would you like to work on first?
- [ ] Setting up the development environment
- [ ] Creating a new custom node
- [ ] Testing existing nodes
- [ ] Troubleshooting issues
```

### Common User Requests & Responses

#### "How do I create a custom N8N node?"

```markdown
I'll guide you through creating a custom N8N node step by step:

## Prerequisites Check:
```bash
# Verify you have the essentials:
node --version  # Should be 20.18+
npm --version   # Should be 10+
```

## Quick Start:
1. **Navigate to nodes directory**:
   ```bash
   cd nodes/
   mkdir YourNodeName
   cd YourNodeName
   ```

2. **Create the node file** `YourNodeName.node.ts`:
   ```typescript
   import { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
   
   export class YourNodeName implements INodeType {
       description: INodeTypeDescription = {
           displayName: 'Your Node Name',
           name: 'yourNodeName',
           // ... see docs/02-node-creation-guide.md for complete template
       };
       
       async execute(this: IExecuteFunctions) {
           // Your node logic here
           return [[{ json: { result: 'success' } }]];
       }
   }
   ```

3. **Update package.json** to include your node
4. **Build and test**:
   ```bash
   npm run build
   N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
   ```

**Need detailed guidance?** See [docs/02-node-creation-guide.md](./02-node-creation-guide.md) for the complete step-by-step process.
```

#### "N8N won't start" or "My nodes don't appear"

```markdown
Let's diagnose the issue systematically:

## Quick Diagnostics:
```bash
# 1. Check environment variable
echo $N8N_CUSTOM_EXTENSIONS
ls -la $N8N_CUSTOM_EXTENSIONS

# 2. Verify build output
npm run build
ls -la dist/

# 3. Check n8n startup logs
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

## Common Solutions:

**Issue**: Nodes don't appear in palette
- ✅ Check `N8N_CUSTOM_EXTENSIONS` path is correct
- ✅ Verify `npm run build` completed successfully
- ✅ Confirm `package.json` has correct `n8n.nodes` array
- ✅ Restart n8n completely (`pkill -f n8n` then restart)

**Issue**: Build failures  
- ✅ Run `npm install` to install dependencies
- ✅ Check TypeScript compilation errors
- ✅ Verify imports are correct

**Need more help?** See [docs/04-troubleshooting.md](./04-troubleshooting.md) for comprehensive solutions.
```

#### "How do I test my node?"

```markdown
I'll show you how to thoroughly test your N8N node:

## Basic Testing Workflow:
1. **Create test workflow**: Manual Trigger → Your Node → Set Node
2. **Use test data**:
   ```json
   [
     { "id": 1, "name": "Test Item 1" },
     { "id": 2, "name": "Test Item 2" }
   ]
   ```
3. **Execute and verify output**

## Debug Logging:
Add logging to your node for detailed debugging:
```typescript
async execute(this: IExecuteFunctions) {
    console.log('[DEBUG] Starting execution');
    
    const items = this.getInputData();
    console.log('[DEBUG] Input items:', items.length);
    
    // Your logic here
    
    console.log('[DEBUG] Execution completed');
    return [results];
}
```

## Testing Checklist:
- [ ] Normal operation with valid data
- [ ] Empty input handling
- [ ] Invalid/malformed data handling  
- [ ] All parameter combinations
- [ ] Error conditions and recovery

**Complete testing guide:** [docs/03-testing-guide.md](./03-testing-guide.md)
```

#### "What's included in this template?"

```markdown
This N8N node development template includes:

## 📦 **Pre-built Example Nodes**:
- **Super Code**: Advanced JavaScript/Python code execution with 34+ libraries
- **Data Transformer**: Data manipulation and validation
- **UUID Generator**: Unique ID generation
- **QR Code Generator**: QR code creation

## 🛠️ **Development Tools**:
- TypeScript configuration
- Build system (npm scripts)
- ESLint for code quality
- Icon processing with Gulp

## 📚 **Complete Documentation**:
- [Setup Guide](./01-setup-guide.md) - A-Z setup instructions
- [Node Creation](./02-node-creation-guide.md) - Step-by-step node development
- [Testing Guide](./03-testing-guide.md) - Comprehensive testing strategies
- [Troubleshooting](./04-troubleshooting.md) - Common issues & solutions

## 🚀 **Ready-to-Use Structure**:
```
n8n-nodes/
├── docs/          # Comprehensive documentation
├── nodes/         # Your custom nodes
├── dist/          # Built output for n8n
└── scripts/       # Publishing & release scripts
```

**Everything you need to develop, test, and deploy custom N8N nodes!**
```

## Troubleshooting Response Patterns

### When Users Report Errors

**Step 1: Gather Information**
```markdown
To help you effectively, I need to understand the issue:

## Please provide:
1. **Error message** (exact text or screenshot)
2. **What you were trying to do** when the error occurred
3. **Your setup**:
   ```bash
   node --version
   n8n --version
   echo $N8N_CUSTOM_EXTENSIONS
   ```
4. **Recent changes** you made

## Quick checks while we diagnose:
```bash
# 1. Verify build completed
npm run build

# 2. Check file permissions
ls -la dist/

# 3. Test with minimal data
# (Try executing your node with simple test input)
```

Once I have this information, I can provide targeted solutions.
```

**Step 2: Provide Targeted Solutions**
Based on error patterns, reference the appropriate documentation sections and provide specific commands.

### Performance & Optimization Requests

```markdown
I'll help optimize your N8N node performance:

## Performance Analysis:
1. **Add timing measurements**:
   ```typescript
   const startTime = Date.now();
   // Your processing logic
   console.log(`Execution took ${Date.now() - startTime}ms`);
   ```

2. **Monitor memory usage**:
   ```typescript
   const startMemory = process.memoryUsage();
   // Your processing logic  
   const endMemory = process.memoryUsage();
   console.log('Memory delta:', endMemory.heapUsed - startMemory.heapUsed);
   ```

## Common Optimizations:
- **Batch processing**: Handle items in chunks rather than individually
- **Async operations**: Use `await` for I/O operations
- **Memory management**: Avoid keeping large objects in scope
- **Caching**: Cache expensive computations appropriately

**What specific performance issue are you experiencing?**
- Slow execution times?
- High memory usage?
- N8N becoming unresponsive?

Based on your specific issue, I can provide targeted optimization strategies.
```

## Advanced Usage Scenarios

### Custom Libraries & Dependencies

```markdown
To add custom libraries to your N8N node:

## 1. Install the dependency:
```bash
npm install your-library-name
npm install --save-dev @types/your-library-name  # if TypeScript types exist
```

## 2. Import in your node:
```typescript
import { yourLibraryFunction } from 'your-library-name';

export class YourNode implements INodeType {
    async execute(this: IExecuteFunctions) {
        const result = yourLibraryFunction(inputData);
        return [[{ json: result }]];
    }
}
```

## 3. Rebuild and test:
```bash
npm run build
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

**Note**: Large dependencies can affect N8N startup time. Consider lazy loading for heavy libraries.

**Need examples?** Check the Super Code node for advanced library integration patterns.
```

### Production Deployment

```markdown
For production deployment of your custom N8N nodes:

## 1. Prepare for production:
```bash
# Run all quality checks
npm run lint
npm run test
npm run build

# Verify package.json metadata
```

## 2. Distribution options:
- **NPM Package**: Publish as npm package for easy installation
- **Docker**: Include in custom N8N Docker image  
- **Direct Installation**: Copy built files to production server

## 3. Production considerations:
- [ ] Error handling is robust
- [ ] Logging is appropriate for production
- [ ] Performance is acceptable under load
- [ ] Security considerations addressed
- [ ] Documentation is complete

**Which deployment method are you planning to use?**
```

## Communication Best Practices

### Setting Expectations
```markdown
## What I can help with:
✅ N8N node development guidance
✅ TypeScript/JavaScript troubleshooting
✅ Build and deployment issues
✅ Testing strategies
✅ Performance optimization

## What you'll need to do:
- Follow the setup steps in sequence
- Test changes incrementally
- Provide specific error messages when issues occur
- Run the diagnostic commands I suggest

## Timeline expectations:
- **Simple nodes**: 30-60 minutes to create and test
- **Complex nodes**: 2-4 hours for full development
- **Troubleshooting**: Usually resolved within 15 minutes with proper diagnostics
```

### Encouraging Best Practices
```markdown
## Recommended Development Workflow:

1. **Start Small**: Create minimal working node first
2. **Test Early**: Verify each feature as you add it
3. **Use Documentation**: Reference the guides for detailed steps
4. **Debug Systematically**: Use logging and step-by-step debugging
5. **Version Control**: Commit working versions frequently

This approach prevents complex issues and makes debugging much easier!
```

## Response Tone & Style

### Professional but Friendly
- Use clear, actionable language
- Provide specific commands and code examples
- Reference documentation sections for detailed guidance
- Acknowledge user expertise level and adjust accordingly

### Structure Responses
1. **Quick Answer**: Immediate actionable steps
2. **Detailed Explanation**: Background context when needed
3. **Next Steps**: Clear path forward
4. **Resources**: Links to relevant documentation

### Error Handling
- Never dismiss user issues as "simple" or "obvious"
- Provide systematic diagnostic steps
- Offer multiple solution approaches when possible
- Follow up to ensure resolution

**Use this guide to provide consistent, helpful responses about N8N node development!** 🤖✨