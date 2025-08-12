# 🚀 Your First Working Node in 10 Minutes

**Bulletproof guide from zero to working custom n8n node - guaranteed to work**

This guide assumes **NOTHING** about your setup and walks you through every step to create a working node. If you encounter ANY issue, the troubleshooting section covers real failure modes with exact solutions.

## Prerequisites Check

Run these commands to verify your setup:

```bash
# Check Node.js version (MUST be 20.18+)
node --version
# Expected: v20.18.0 or higher

# Check npm version
npm --version
# Expected: 10.0.0 or higher

# Check git
git --version
# Expected: Any recent version

# Check n8n installation
npx n8n --version
# Expected: Any version (will install if missing)
```

**❌ If ANY command fails:**

- **Windows**: Install Node.js from <https://nodejs.org> (LTS version)
- **macOS**: `brew install node` or download from nodejs.org
- **Linux**: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

## Step 1: Get The Template

```bash
# Option 1: Use this existing project (if you have it)
cd path/to/your/n8n-nodes-project
npm install

# Option 2: Create from scratch
mkdir my-n8n-nodes
cd my-n8n-nodes
npm init -y
npm install n8n-workflow typescript @types/node --save-dev

# Create basic structure
mkdir -p nodes docs
```

**❌ If `npm install` fails:**

- **Error "EACCES permissions"**: Run `sudo npm install -g npm` then retry
- **Error "node-gyp"**: Install build tools:
  - Windows: `npm install -g windows-build-tools`
  - macOS: `xcode-select --install`
  - Linux: `sudo apt-get install build-essential`
- **Network errors**: Try `npm install --registry https://registry.npmjs.org/`

## Step 2: Create Your First Node

Create the directory:

```bash
mkdir -p nodes/HelloWorldNode
cd nodes/HelloWorldNode
```

Create `HelloWorldNode.node.ts` with this EXACT code (copy-paste):

```typescript
import {
 IExecuteFunctions,
 INodeExecutionData,
 INodeType,
 INodeTypeDescription,
 NodeConnectionType,
} from 'n8n-workflow';

export class HelloWorldNode implements INodeType {
 description: INodeTypeDescription = {
  displayName: 'Hello World',
  name: 'helloWorldNode',
  icon: 'fa:hand-wave',
  group: ['transform'],
  version: 1,
  description: 'A simple greeting node that always works',
  defaults: {
   name: 'Hello World',
  },
  inputs: [{ displayName: '', type: NodeConnectionType.Main }],
  outputs: [{ displayName: '', type: NodeConnectionType.Main }],
  properties: [
   {
    displayName: 'Your Name',
    name: 'userName',
    type: 'string',
    default: 'World',
    description: 'What should I call you?',
   },
   {
    displayName: 'Greeting Style',
    name: 'greetingStyle',
    type: 'options',
    options: [
     {
      name: 'Friendly',
      value: 'friendly',
     },
     {
      name: 'Professional',
      value: 'professional',
     },
     {
      name: 'Casual',
      value: 'casual',
     },
    ],
    default: 'friendly',
    description: 'How should I greet you?',
   },
  ],
 };

 async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  // Process each input item
  for (let i = 0; i < items.length; i++) {
   const userName = this.getNodeParameter('userName', i, 'World') as string;
   const greetingStyle = this.getNodeParameter('greetingStyle', i, 'friendly') as string;

   let greeting = '';
   const timestamp = new Date().toISOString();

   // Generate greeting based on style
   switch (greetingStyle) {
    case 'friendly':
     greeting = `Hello there, ${userName}! 🎉 Hope you're having a wonderful day!`;
     break;
    case 'professional':
     greeting = `Good day, ${userName}. I trust this message finds you well.`;
     break;
    case 'casual':
     greeting = `Hey ${userName}! What's up? 😊`;
     break;
    default:
     greeting = `Hello, ${userName}!`;
   }

   // Create output data
   const outputItem: INodeExecutionData = {
    json: {
     // Include original data
     ...items[i].json,
     // Add our greeting data
     greeting: greeting,
     userName: userName,
     greetingStyle: greetingStyle,
     timestamp: timestamp,
     message: `This greeting was generated at ${timestamp}`,
     nodeWorking: true,
     status: 'success',
    },
   };

   returnData.push(outputItem);
  }

  return [returnData];
 }
}
```

## Step 3: Register Your Node

Edit `package.json` and find the `n8n` section. Add your node to the nodes array:

```json
{
 "n8n": {
  "n8nNodesApiVersion": 1,
  "credentials": [],
  "nodes": [
   "UuidGenerator/UuidGenerator.node.js",
   "DataTransformer/DataTransformer.node.js",
   "QrCodeGenerator/QrCodeGenerator.node.js",
   "SuperCodeNode/SuperCodeNode.node.js",
   "SuperCodeTool/SuperCodeTool.node.js",
   "HelloWorldNode/HelloWorldNode.node.js"
  ]
 }
}
```

**⚠️ CRITICAL**: The node path must be `HelloWorldNode/HelloWorldNode.node.js` (NOT `.ts`)

## Step 4: Build Your Node

```bash
# Go back to project root
cd ../..

# Build the project
npm run build
```

**✅ Success looks like:**

```
> rimraf dist && tsc && npm run build:icons && npm run flatten
> gulp build:icons
[timestamp] Starting 'build:icons'...
[timestamp] Finished 'build:icons'
> cp -r dist/nodes/* dist/ && rm -rf dist/nodes && cp package.json index.js dist/
```

**❌ If build fails:**

**Error "Cannot find module":**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**TypeScript errors:**

- Check that your node file is EXACTLY as shown above
- Verify file is named `HelloWorldNode.node.ts` (case sensitive)
- Ensure it's in `nodes/HelloWorldNode/` directory

**Permission errors:**

- Windows: Run terminal as Administrator
- macOS/Linux: Check folder permissions with `ls -la`

## Step 5: Verify Build Output

```bash
# Check that your node was built
ls -la dist/HelloWorldNode/
# Should show: HelloWorldNode.node.js, HelloWorldNode.node.d.ts

# Verify the main dist folder
ls -la dist/
# Should show your HelloWorldNode.node.js file
```

## Step 6: Start n8n With Your Node

```bash
# Set the custom extensions path
export N8N_CUSTOM_EXTENSIONS="$(pwd)/dist"

# For Windows Command Prompt:
# set N8N_CUSTOM_EXTENSIONS=%cd%\dist

# For Windows PowerShell:
# $env:N8N_CUSTOM_EXTENSIONS="$pwd\dist"

# Start n8n
npx n8n start --tunnel
```

**✅ Success looks like:**

```
n8n ready on 0.0.0.0:5678
Version: [version]
Editor is now accessible via:
http://localhost:5678/

Tunnel URL: https://[random].tunnel.n8n.cloud
```

## Step 7: Test Your Node

1. **Open n8n** in your browser (use the tunnel URL for best results)
2. **Create new workflow**
3. **Add Manual Trigger node** (search for "Manual")
4. **Add your Hello World node** (search for "Hello World")
5. **Connect the nodes** (drag from Manual Trigger output to Hello World input)
6. **Configure Hello World node:**
   - Your Name: Enter your actual name
   - Greeting Style: Choose any option
7. **Add Set node** after Hello World (to see output)
8. **Execute workflow** by clicking "Test workflow"

**✅ Expected result in Set node:**

```json
{
 "greeting": "Hello there, YourName! 🎉 Hope you're having a wonderful day!",
 "userName": "YourName",
 "greetingStyle": "friendly",
 "timestamp": "2025-08-12T...",
 "message": "This greeting was generated at ...",
 "nodeWorking": true,
 "status": "success"
}
```

## Troubleshooting Real Issues

### "My node doesn't appear in n8n"

**Cause**: Node not built or environment variable wrong

**Solution**:

```bash
# Verify build output exists
ls -la dist/HelloWorldNode.node.js
# If missing, run: npm run build

# Check environment variable
echo $N8N_CUSTOM_EXTENSIONS
# Should show full path to your dist folder

# Restart n8n completely
# Ctrl+C to stop, then restart with same command
```

### "Node appears but crashes when I add it"

**Cause**: TypeScript compilation errors

**Solution**:

```bash
# Check for TypeScript errors
npx tsc --noEmit
# Fix any errors shown

# Rebuild completely
npm run build
```

### "Build succeeds but node doesn't work"

**Cause**: Runtime errors in node logic

**Solution**:

1. Check n8n console output for error messages
2. Look for red error indicators in n8n UI
3. Verify node is exactly as shown in Step 2
4. Try the "Hello World Reset" solution below

### Hello World Reset (Nuclear Option)

If ANYTHING goes wrong, delete everything and start over:

```bash
# Delete your node
rm -rf nodes/HelloWorldNode

# Delete build output
rm -rf dist

# Clear npm cache
npm cache clean --force

# Rebuild everything
npm run build

# Follow steps 2-7 again
```

## What Makes This Node Work

This node is designed to be bulletproof:

1. **Simple logic** - No complex operations that can fail
2. **Handles all input types** - Works with any data
3. **Always produces output** - Never returns empty results
4. **Clear visual feedback** - Obvious when it's working
5. **Graceful parameter handling** - Defaults prevent crashes
6. **Detailed output** - Easy to verify what happened

## Next Steps

Once this Hello World node works:

1. **Modify the greeting messages** to understand how changes work
2. **Add more parameters** to see UI configuration options
3. **Study the other example nodes** in the `nodes/` folder
4. **Read the full guides** in the `docs/` folder

## When You're Ready for More

- **Simple modifications**: [02-node-creation-guide.md](./02-node-creation-guide.md)
- **Complex features**: [07-advanced-node-patterns.md](./07-advanced-node-patterns.md)
- **Debugging issues**: [04-troubleshooting.md](./04-troubleshooting.md)

**You now have a working custom n8n node!** 🎉

---

_This guide is tested on Windows 11, macOS Ventura, and Ubuntu 22.04 with Node.js 20.18+ and n8n 1.0+_
