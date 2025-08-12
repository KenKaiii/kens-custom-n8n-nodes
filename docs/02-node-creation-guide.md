# 🛠️ N8N Node Creation Guide

**Step-by-step process for creating custom n8n nodes**

## Node Anatomy

### Basic Node Structure
```typescript
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

export class MyCustomNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'My Custom Node',
        name: 'myCustomNode',
        icon: 'fa:code',
        group: ['transform'],
        version: 1,
        description: 'Description of what this node does',
        defaults: {
            name: 'My Custom Node',
        },
        inputs: [{ displayName: '', type: NodeConnectionType.Main }],
        outputs: [{ displayName: '', type: NodeConnectionType.Main }],
        properties: [
            // Node configuration properties
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Node execution logic
        return [[{ json: { result: 'success' } }]];
    }
}
```

## Step-by-Step Creation

### 1. Create Node Directory
```bash
# Create directory structure
mkdir -p nodes/MyCustomNode
cd nodes/MyCustomNode
```

### 2. Create Node File
Create `MyCustomNode.node.ts`:

```typescript
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    NodeOperationError,
} from 'n8n-workflow';

export class MyCustomNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'My Custom Node',
        name: 'myCustomNode',
        icon: 'fa:code',
        group: ['transform'],
        version: 1,
        description: 'Custom node that processes data',
        defaults: {
            name: 'My Custom Node',
        },
        inputs: [{ displayName: '', type: NodeConnectionType.Main }],
        outputs: [{ displayName: '', type: NodeConnectionType.Main }],
        credentials: [],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Transform Data',
                        value: 'transform',
                        description: 'Transform input data',
                    },
                    {
                        name: 'Validate Data',
                        value: 'validate',
                        description: 'Validate input data',
                    },
                ],
                default: 'transform',
                description: 'Operation to perform',
            },
            {
                displayName: 'Custom Parameter',
                name: 'customParam',
                type: 'string',
                default: '',
                description: 'Custom parameter for processing',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const operation = this.getNodeParameter('operation', 0) as string;
        const customParam = this.getNodeParameter('customParam', 0) as string;

        const results: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                let result;

                switch (operation) {
                    case 'transform':
                        result = {
                            ...items[i].json,
                            transformed: true,
                            customParam,
                            timestamp: new Date().toISOString(),
                        };
                        break;

                    case 'validate':
                        result = {
                            ...items[i].json,
                            valid: true,
                            validatedBy: customParam || 'default',
                        };
                        break;

                    default:
                        throw new NodeOperationError(
                            this.getNode(),
                            `Unknown operation: ${operation}`,
                        );
                }

                results.push({ json: result });
            } catch (error) {
                if (this.continueOnFail()) {
                    results.push({
                        json: { error: error.message, originalData: items[i].json },
                        error,
                        pairedItem: { item: i },
                    });
                } else {
                    throw error;
                }
            }
        }

        return [results];
    }
}
```

### 3. Update Package Configuration
Add your node to `package.json`:

```json
{
    "n8n": {
        "n8nNodesApiVersion": 1,
        "credentials": [],
        "nodes": [
            "ExistingNode/ExistingNode.node.js",
            "MyCustomNode/MyCustomNode.node.js"
        ]
    }
}
```

## Property Types

### Common Property Types
```typescript
// Text Input
{
    displayName: 'Text Input',
    name: 'textInput',
    type: 'string',
    default: '',
    description: 'Enter some text',
}

// Number Input
{
    displayName: 'Number Input',
    name: 'numberInput',
    type: 'number',
    default: 0,
    description: 'Enter a number',
}

// Boolean/Checkbox
{
    displayName: 'Enable Feature',
    name: 'enableFeature',
    type: 'boolean',
    default: false,
    description: 'Enable this feature',
}

// Options/Dropdown
{
    displayName: 'Choose Option',
    name: 'chooseOption',
    type: 'options',
    options: [
        { name: 'Option 1', value: 'option1' },
        { name: 'Option 2', value: 'option2' },
    ],
    default: 'option1',
    description: 'Choose an option',
}

// Multi-Options
{
    displayName: 'Multiple Options',
    name: 'multipleOptions',
    type: 'multiOptions',
    options: [
        { name: 'Option A', value: 'a' },
        { name: 'Option B', value: 'b' },
        { name: 'Option C', value: 'c' },
    ],
    default: [],
    description: 'Select multiple options',
}

// Code Editor
{
    displayName: 'JavaScript Code',
    name: 'jsCode',
    type: 'string',
    typeOptions: {
        editor: 'codeNodeEditor',
        editorLanguage: 'javaScript',
        rows: 10,
    },
    default: '// Enter JavaScript code here',
    description: 'JavaScript code to execute',
}

// JSON Editor
{
    displayName: 'JSON Data',
    name: 'jsonData',
    type: 'json',
    default: '{}',
    description: 'JSON data object',
}
```

### Conditional Display
```typescript
{
    displayName: 'Advanced Options',
    name: 'advancedOptions',
    type: 'boolean',
    default: false,
    description: 'Show advanced options',
},
{
    displayName: 'Advanced Setting',
    name: 'advancedSetting',
    type: 'string',
    displayOptions: {
        show: {
            advancedOptions: [true],
        },
    },
    default: '',
    description: 'Advanced configuration setting',
}
```

## Data Handling

### Input Data
```typescript
// Get all input items
const items = this.getInputData();

// Get specific item
const firstItem = items[0];
const itemData = firstItem.json;

// Get node parameters
const operation = this.getNodeParameter('operation', 0) as string;
const customParam = this.getNodeParameter('customParam', itemIndex) as string;
```

### Output Data
```typescript
// Single output
return [[{ json: { result: 'success' } }]];

// Multiple outputs
return [[
    { json: { item: 1, processed: true } },
    { json: { item: 2, processed: true } },
]];

// Pass through with modifications
return [[
    {
        json: {
            ...items[0].json,
            processed: true,
            timestamp: new Date().toISOString(),
        }
    }
]];
```

### Error Handling
```typescript
try {
    // Process data
} catch (error) {
    // Continue on fail behavior
    if (this.continueOnFail()) {
        return [[{
            json: { 
                error: error.message, 
                originalData: items[i].json 
            },
            error,
            pairedItem: { item: i },
        }]];
    } else {
        // Throw error to stop execution
        throw new NodeOperationError(
            this.getNode(),
            `Processing failed: ${error.message}`,
        );
    }
}
```

## Icons and Styling

### Built-in Icons
- `fa:code` - Code/programming
- `fa:database` - Database
- `fa:cloud` - Cloud services
- `fa:envelope` - Email
- `fa:file` - File operations
- `fa:cog` - Settings/configuration

### Custom Icons (RECOMMENDED)
1. Create SVG icon (60x60px recommended)
2. Place in `nodes/MyCustomNode/myicon.svg`
3. Reference as `file:myicon.svg`

**IMPORTANT**: Custom SVG icons are more reliable than FontAwesome icons. Example:

```typescript
export class MyCustomNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'My Custom Node',
        name: 'myCustomNode',
        icon: 'file:myicon.svg', // Custom SVG file
        // ... rest of config
    };
}
```

### SVG Icon Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7931E;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="60" height="60" rx="12" fill="url(#grad1)"/>
  <!-- Your custom icon graphics here -->
</svg>
```

## Build and Test

### 1. Build the Node
```bash
npm run build
```

### 2. Check Build Output
```bash
ls -la dist/MyCustomNode/
# Should contain: MyCustomNode.node.js, MyCustomNode.node.d.ts
```

### 3. Test in N8N
```bash
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

## Best Practices

### 1. Naming Conventions
- **Class Name**: PascalCase (e.g., `MyCustomNode`)
- **File Name**: Match class name with `.node.ts` extension
- **Node Name**: camelCase for internal name (e.g., `myCustomNode`)
- **Display Name**: Human readable (e.g., `My Custom Node`)

### 2. Error Handling
- Always use try/catch for operations that might fail
- Provide meaningful error messages
- Support `continueOnFail` behavior
- Use `NodeOperationError` for node-specific errors

### 3. Performance
- Process items efficiently in loops
- Avoid blocking operations in main thread
- Use async/await for I/O operations
- Consider memory usage for large datasets

### 4. User Experience
- Provide clear descriptions for all properties
- Use conditional display for complex configurations
- Set sensible default values
- Include helpful placeholder text

## Next Steps

1. **Test Your Node**: See [03-testing-guide.md](./03-testing-guide.md)
2. **Debug Issues**: See [04-troubleshooting.md](./04-troubleshooting.md)
3. **Advanced Features**: See examples in the `nodes/` directory

**Your custom node is ready for testing!** 🎉