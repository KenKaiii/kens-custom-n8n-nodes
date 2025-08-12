# 🤖 AI Agent Tools Guide

**Creating n8n nodes that work as AI agent tools**

## Overview

AI agent tools are special n8n nodes that can be discovered and used by AI agents (like Claude, ChatGPT, etc.) within workflows. Unlike regular workflow nodes that only process data sequentially, AI agent tools can be dynamically invoked by AI agents based on natural language instructions.

## Key Differences: Regular Node vs AI Agent Tool

### Regular Workflow Node
- Appears in the node palette for manual workflow building
- Part of sequential data processing pipelines
- Users drag and drop them into workflows
- Example: SuperCodeNode

### AI Agent Tool
- Available to AI agents when they need to perform tasks
- Can be invoked by AI agents dynamically
- Still processes data but designed for agent use
- Example: SuperCodeTool

## Creating AI Agent Tools

### 1. Basic Tool Node Structure

```typescript
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    NodeOperationError,
} from 'n8n-workflow';

export class MyAITool implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'My AI Tool',
        name: 'myAITool',
        icon: 'file:myaitool.svg',
        group: [], // IMPORTANT: Empty group hides from regular node list
        version: 1,
        description: 'AI Agent tool for performing specific tasks',
        usableAsTool: true, // CRITICAL: This makes it available to AI agents
        defaults: {
            name: 'My AI Tool',
        },
        inputs: [{ displayName: '', type: NodeConnectionType.Main }],
        outputs: [{ displayName: '', type: NodeConnectionType.Main }],
        credentials: [],
        properties: [
            {
                displayName: 'Task Parameter',
                name: 'taskParam',
                type: 'string',
                default: '',
                description: 'Parameter for AI agent to configure',
            },
            // ... other properties
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const taskParam = this.getNodeParameter('taskParam', 0) as string;

        // AI agent tool logic here
        const results = items.map(item => ({
            json: {
                ...item.json,
                processedByAI: true,
                taskParam,
                timestamp: new Date().toISOString(),
            }
        }));

        return [results];
    }
}
```

### 2. Critical Configuration Requirements

**MUST HAVE for AI Agent Tools:**

1. **usableAsTool: true** - Makes the node available to AI agents
2. **group: []** - Empty group prevents it from showing in regular node palette
3. **Environment Variable** - `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`

```typescript
description: INodeTypeDescription = {
    // ... other properties
    usableAsTool: true, // ✅ CRITICAL - enables AI agent usage
    group: [], // ✅ CRITICAL - hides from regular nodes
    // ... rest of config
};
```

### 3. Environment Setup

Your n8n server MUST have this environment variable:

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

Without this, community-developed tool nodes won't be available to AI agents.

## Real-World Example: SuperCodeTool

Our SuperCodeTool demonstrates the perfect AI agent tool implementation:

### File Structure
```
nodes/SuperCodeTool/
├── SuperCodeTool.node.ts    # Main node implementation
└── supercodetool.svg        # Custom icon
```

### Key Features
- **Same functionality as SuperCodeNode** (34+ JS libraries, 30+ Python libraries)
- **VM-Safe execution** for security
- **AI agent optimized** error messages and logging
- **Custom SVG icon** for visual distinction
- **Hidden from regular nodes** but available to AI agents

### Usage Pattern
1. AI agent needs to execute code
2. Agent discovers SuperCodeTool in available tools
3. Agent configures parameters (language, code, timeout)
4. Agent executes the tool and receives results
5. Agent uses results in workflow or responses

## Environment Setup for Development

### Local Development
```bash
# Set environment variable
export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true

# Start n8n with your custom nodes
N8N_CUSTOM_EXTENSIONS=/path/to/dist N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start
```

### Production Deployment
```bash
# In your .env file or environment
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
N8N_CUSTOM_EXTENSIONS=/path/to/your/nodes/dist
```

## Testing AI Agent Tools

### 1. Verify Tool Loading
Check n8n logs for your tool node:
```
[debug] No codex available for: myAITool
```
This indicates your tool was loaded successfully.

### 2. Check Tool Availability
1. Create an AI agent workflow
2. Add an AI agent node (like Claude or ChatGPT)
3. Configure agent to use tools
4. Verify your tool appears in available tools list

### 3. Test Tool Execution
1. Ask the AI agent to use your tool
2. Verify the tool executes with correct parameters
3. Check the results are returned to the agent

## Best Practices for AI Agent Tools

### 1. Clear Descriptions
AI agents need clear descriptions to understand when to use your tool:

```typescript
description: INodeTypeDescription = {
    displayName: 'File Processor Tool',
    name: 'fileProcessorTool',
    description: 'AI Agent tool for processing files: read, write, convert formats, extract data, and analyze content',
    // ...
};
```

### 2. Intuitive Parameters
Make parameters self-explanatory for AI agents:

```typescript
properties: [
    {
        displayName: 'File Operation',
        name: 'operation',
        type: 'options',
        options: [
            {
                name: 'Read File',
                value: 'read',
                description: 'Read content from a file',
            },
            {
                name: 'Write File', 
                value: 'write',
                description: 'Write content to a file',
            },
        ],
        default: 'read',
        description: 'Choose the file operation for AI agent to perform',
    },
];
```

### 3. Error Handling
Provide AI-friendly error messages:

```typescript
if (!fileExists) {
    throw new NodeOperationError(
        this.getNode(),
        `🤖 AI AGENT ERROR: File not found at path '${filePath}'. Please check the file path and ensure the file exists.`
    );
}
```

### 4. Custom Icons
Use unique SVG icons to help AI agents and users visually distinguish tools:

```typescript
icon: 'file:myaitool.svg', // Custom SVG in same directory
```

## Common Pitfalls and Solutions

### ❌ Tool Not Appearing to AI Agents
**Problem**: Tool node not visible to AI agents
**Solution**: 
- Ensure `usableAsTool: true` is set
- Set `group: []` to hide from regular nodes
- Verify `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`

### ❌ Tool Appears in Regular Node Palette
**Problem**: Tool shows up in regular workflow builder
**Solution**: 
- Set `group: []` (empty array)
- Do NOT add the node to package.json's nodes array if you want it tool-only

### ❌ Environment Variable Missing
**Problem**: Tools not enabled despite correct code
**Solution**: 
- Set `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`
- Restart n8n server after setting the variable

### ❌ TypeScript Compilation Errors
**Problem**: Missing interfaces like IToolNode
**Solution**: 
- Only use `INodeType` interface
- Current n8n versions don't have IToolNode interface
- Just use `usableAsTool: true` property

## Package.json Configuration

### For Tool-Only Nodes (Recommended)
Don't add to the nodes array - let it be tool-only:

```json
{
    "n8n": {
        "nodes": [
            "RegularNode/RegularNode.node.js"
            // SuperCodeTool NOT listed here - tool only
        ]
    }
}
```

### For Dual-Purpose Nodes
Add to nodes array if you want it in both places:

```json
{
    "n8n": {
        "nodes": [
            "RegularNode/RegularNode.node.js",
            "DualPurposeNode/DualPurposeNode.node.js"
        ]
    }
}
```

## Advanced Features

### Conditional Parameters
Make tools more flexible with conditional parameters:

```typescript
{
    displayName: 'Advanced Options',
    name: 'advancedOptions',
    type: 'boolean',
    default: false,
    description: 'Show advanced options for AI agent',
},
{
    displayName: 'Custom Processing',
    name: 'customProcessing',
    type: 'string',
    displayOptions: {
        show: {
            advancedOptions: [true],
        },
    },
    default: '',
    description: 'Custom processing instructions for AI agent',
}
```

### Multi-Language Support
Support multiple execution modes:

```typescript
{
    displayName: 'Execution Language',
    name: 'language',
    type: 'options',
    options: [
        {
            name: 'JavaScript',
            value: 'javascript',
            description: 'Execute using JavaScript/TypeScript',
        },
        {
            name: 'Python',
            value: 'python', 
            description: 'Execute using Python',
        },
    ],
    default: 'javascript',
    description: 'Choose execution language for AI agent',
}
```

## Next Steps

1. **Create Your First AI Tool**: Start with the basic template above
2. **Test Thoroughly**: Use the testing checklist provided
3. **Study SuperCodeTool**: See `nodes/SuperCodeTool/` for a complete example
4. **Add Custom Icons**: Create unique SVG icons for your tools

**Your AI agent tools are ready to empower AI workflows!** 🤖✨

## Related Documentation

- [Node Creation Guide](./02-node-creation-guide.md) - Basic node creation
- [Testing Guide](./03-testing-guide.md) - Testing your nodes
- [Troubleshooting](./04-troubleshooting.md) - Common issues and solutions