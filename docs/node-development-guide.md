# n8n Node Development Guide (2025)

Complete guide for creating custom n8n nodes from basic to advanced patterns.

## 🏗️ Node Anatomy

Every n8n node follows this structure:

```typescript
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class YourNodeName implements INodeType {
	description: INodeTypeDescription = {
		// Node metadata and configuration
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Node execution logic
	}
}
```

## 🎯 Node Types & Patterns

### 1. Basic Data Transformation Node

Perfect for data processing, formatting, validation.

```typescript
// nodes/DataTransform/DataTransform.node.ts
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class DataTransform implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Data Transform',
		name: 'dataTransform',
		icon: 'file:transform.svg',
		group: ['transform'],
		version: 1,
		description: 'Transform and validate data',
		defaults: {
			name: 'Data Transform',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: false,
				options: [
					{
						name: 'Format Date',
						value: 'formatDate',
					},
					{
						name: 'Validate Email',
						value: 'validateEmail',
					},
					{
						name: 'Clean Text',
						value: 'cleanText',
					},
				],
				default: 'formatDate',
			},
			{
				displayName: 'Date Format',
				name: 'dateFormat',
				type: 'string',
				default: 'YYYY-MM-DD',
				displayOptions: {
					show: {
						operation: ['formatDate'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				let newItem: INodeExecutionData;

				switch (operation) {
					case 'formatDate':
						const dateFormat = this.getNodeParameter('dateFormat', itemIndex) as string;
						const dateValue = item.json.date;
						const formattedDate = new Date(dateValue).toISOString().split('T')[0];
						
						newItem = {
							json: {
								...item.json,
								formattedDate,
							},
						};
						break;

					case 'validateEmail':
						const email = item.json.email as string;
						const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
						
						newItem = {
							json: {
								...item.json,
								isValidEmail: emailRegex.test(email),
							},
						};
						break;

					default:
						newItem = item;
				}

				returnData.push(newItem);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
```

### 2. HTTP API Integration Node

Perfect for connecting to external services.

```typescript
// nodes/CustomApi/CustomApi.node.ts
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class CustomApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Custom API',
		name: 'customApi',
		icon: 'file:api.svg',
		group: ['input'],
		version: 1,
		description: 'Connect to any REST API',
		defaults: {
			name: 'Custom API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'customApiAuth',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'user',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
					},
					{
						name: 'Create',
						value: 'create',
					},
					{
						name: 'Update',
						value: 'update',
					},
				],
				default: 'get',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['get', 'update'],
					},
				},
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				let endpoint = '';
				let method = 'GET';
				let body: any = {};

				// Build request based on resource and operation
				if (resource === 'user' && operation === 'get') {
					const userId = this.getNodeParameter('userId', itemIndex) as string;
					endpoint = `/users/${userId}`;
					method = 'GET';
				}

				// Make HTTP request
				const requestOptions: IHttpRequestOptions = {
					method,
					url: endpoint,
					json: true,
				};

				if (Object.keys(body).length > 0) {
					requestOptions.body = body;
				}

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'customApiAuth',
					requestOptions,
				);

				returnData.push({
					json: responseData,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
```

### 3. Multi-Input AI Node (Advanced Pattern)

Perfect for complex AI workflows with dynamic routing.

```typescript
// nodes/AiProcessor/AiProcessor.node.ts
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class AiProcessor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Processor',
		name: 'aiProcessor',
		icon: 'file:ai.svg',
		group: ['transform'],
		version: 1,
		description: 'AI-powered data processing with multiple models',
		defaults: {
			name: 'AI Processor',
		},
		// Dynamic inputs based on configuration
		inputs: `={{ 
			[
				'main',
				{ 
					displayName: 'Chat Model', 
					type: '${NodeConnectionType.AiLanguageModel}', 
					required: true, 
					maxConnections: 1 
				},
				{ 
					displayName: 'Memory', 
					type: '${NodeConnectionType.AiMemory}', 
					required: false,
					maxConnections: 3
				}
			]
		}}`,
		outputs: ['main'],
		properties: [
			{
				displayName: 'Processing Mode',
				name: 'processingMode',
				type: 'options',
				options: [
					{
						name: 'Single Query',
						value: 'single',
					},
					{
						name: 'Batch Processing',
						value: 'batch',
					},
					{
						name: 'Dynamic Routing',
						value: 'dynamic',
					},
				],
				default: 'single',
			},
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'You are a helpful AI assistant.',
			},
			{
				displayName: 'Query Template',
				name: 'queryTemplate',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: 'Process this data: {{$json.data}}',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get connected AI model
		const aiModel = await this.getInputConnectionData(NodeConnectionType.AiLanguageModel, 0);
		
		// Get connected memories (if any)
		const memories = [];
		for (let i = 0; i < 3; i++) {
			try {
				const memory = await this.getInputConnectionData(NodeConnectionType.AiMemory, i);
				if (memory) memories.push(memory);
			} catch {
				// No memory at this index
				break;
			}
		}

		const processingMode = this.getNodeParameter('processingMode', 0) as string;
		const systemPrompt = this.getNodeParameter('systemPrompt', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const queryTemplate = this.getNodeParameter('queryTemplate', itemIndex) as string;
				
				// Replace template variables
				const query = queryTemplate.replace(/\{\{[^}]+\}\}/g, (match) => {
					const path = match.slice(2, -2).trim();
					return this.evaluateExpression(path, itemIndex) as string;
				});

				// Process with AI model
				const messages = [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: query }
				];

				// Add memory context if available
				if (memories.length > 0) {
					// Load relevant memories
					for (const memory of memories) {
						const context = await memory.getChatMessages();
						messages.unshift(...context);
					}
				}

				const response = await aiModel.invoke(messages);

				// Save to memory if available
				if (memories.length > 0) {
					await memories[0].addMessage({ role: 'user', content: query });
					await memories[0].addMessage({ role: 'assistant', content: response.content });
				}

				returnData.push({
					json: {
						...item.json,
						aiResponse: response.content,
						model: aiModel.modelName,
						processingMode,
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
```

## 🔑 Credential Integration

Create matching credential files for authentication:

```typescript
// credentials/CustomApiAuth.credentials.ts
import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CustomApiAuth implements ICredentialType {
	name = 'customApiAuth';
	displayName = 'Custom API Auth';
	documentationUrl = 'https://yourapi.com/docs';
	
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.example.com',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'Bearer Token',
					value: 'bearer',
				},
				{
					name: 'API Key Header',
					value: 'header',
				},
			],
			default: 'bearer',
		},
	];
}
```

## 🎨 Advanced Property Types

### Dynamic Options
```typescript
{
	displayName: 'Model',
	name: 'model',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getModels',
	},
	default: '',
}

// In the node class:
methods = {
	loadOptions: {
		async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const credentials = await this.getCredentials('openAiApi');
			// Fetch models from API
			const models = await this.helpers.httpRequest({
				method: 'GET',
				url: 'https://api.openai.com/v1/models',
				headers: {
					'Authorization': `Bearer ${credentials.apiKey}`,
				},
			});
			
			return models.data.map((model: any) => ({
				name: model.id,
				value: model.id,
			}));
		},
	},
};
```

### Conditional Properties
```typescript
{
	displayName: 'Advanced Settings',
	name: 'advancedSettings',
	type: 'collection',
	placeholder: 'Add Setting',
	default: {},
	options: [
		{
			displayName: 'Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
		},
		{
			displayName: 'Retry Count',
			name: 'retryCount',
			type: 'number',
			default: 3,
		},
	],
},
```

## 🛠️ Error Handling Patterns

### Graceful Error Handling
```typescript
try {
	const result = await this.helpers.httpRequest(requestOptions);
	return result;
} catch (error) {
	// Log error for debugging
	console.error('API request failed:', error.message);
	
	// Check if we should continue on error
	if (this.continueOnFail()) {
		return {
			json: {
				error: error.message,
				statusCode: error.response?.status,
				timestamp: new Date().toISOString(),
			},
		};
	}
	
	// Re-throw with context
	throw new Error(`API request failed: ${error.message}`);
}
```

### Input Validation
```typescript
// Validate required parameters
const requiredParam = this.getNodeParameter('requiredParam', itemIndex) as string;
if (!requiredParam || requiredParam.trim() === '') {
	throw new Error('Required parameter is missing or empty');
}

// Validate data types
const numericParam = this.getNodeParameter('numericParam', itemIndex) as number;
if (typeof numericParam !== 'number' || isNaN(numericParam)) {
	throw new Error('Numeric parameter must be a valid number');
}

// Validate against allowed values
const modeParam = this.getNodeParameter('mode', itemIndex) as string;
const allowedModes = ['create', 'update', 'delete'];
if (!allowedModes.includes(modeParam)) {
	throw new Error(`Mode must be one of: ${allowedModes.join(', ')}`);
}
```

## 🚀 Performance Optimization

### Batch Processing
```typescript
// Process items in batches for better performance
const BATCH_SIZE = 10;
const batches = [];

for (let i = 0; i < items.length; i += BATCH_SIZE) {
	batches.push(items.slice(i, i + BATCH_SIZE));
}

for (const batch of batches) {
	const batchPromises = batch.map(async (item, index) => {
		// Process each item
		return await processItem(item, index);
	});
	
	const batchResults = await Promise.all(batchPromises);
	returnData.push(...batchResults);
}
```

### Connection Reuse
```typescript
// Reuse HTTP connections
const httpAgent = new (require('https').Agent)({
	keepAlive: true,
	maxSockets: 10,
});

const requestOptions: IHttpRequestOptions = {
	method: 'GET',
	url: endpoint,
	agent: httpAgent,
};
```

## 🔄 Package Configuration

Update package.json to register your nodes:

```json
{
	"n8n": {
		"n8nNodesApiVersion": 1,
		"credentials": [
			"dist/credentials/CustomApiAuth.credentials.js"
		],
		"nodes": [
			"dist/nodes/DataTransform/DataTransform.node.js",
			"dist/nodes/CustomApi/CustomApi.node.js",
			"dist/nodes/AiProcessor/AiProcessor.node.js"
		]
	}
}
```

## 📁 File Structure

```
nodes/
├── DataTransform/
│   ├── DataTransform.node.ts
│   └── transform.svg
├── CustomApi/
│   ├── CustomApi.node.ts
│   └── api.svg
└── AiProcessor/
    ├── AiProcessor.node.ts
    └── ai.svg

credentials/
├── CustomApiAuth.credentials.ts
└── AiModelAuth.credentials.ts
```

## 🎯 2025 Best Practices

1. **Use TypeScript Strict Mode** - Full type safety
2. **Implement Proper Error Handling** - Always handle failures gracefully
3. **Support Batch Processing** - Process multiple items efficiently
4. **Use Connection Pooling** - Reuse HTTP connections
5. **Validate All Inputs** - Never trust external data
6. **Log Meaningful Messages** - Help users debug issues
7. **Support Multiple Auth Types** - Bearer tokens, API keys, OAuth
8. **Implement Rate Limiting** - Respect API limits
9. **Use Async/Await** - Modern asynchronous patterns
10. **Test Edge Cases** - Handle empty data, network failures, etc.

---

This guide covers the essential patterns for creating robust n8n custom nodes in 2025. Always prioritize security, performance, and user experience.