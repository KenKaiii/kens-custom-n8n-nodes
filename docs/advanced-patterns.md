# Advanced n8n Node Patterns (2025)

Advanced patterns for creating sophisticated, high-performance n8n custom nodes.

## 🚀 Multi-Input Node Architecture

Perfect for nodes that need multiple data sources, AI models, or configuration inputs.

### Dynamic Input Configuration
```typescript
export class AdvancedProcessor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Advanced Processor',
		name: 'advancedProcessor',
		// Dynamic inputs based on user configuration
		inputs: `={{ 
			[
				'main',
				{ 
					displayName: 'Primary Model', 
					type: '${NodeConnectionType.AiLanguageModel}', 
					required: true, 
					maxConnections: 1 
				},
				{ 
					displayName: 'Fallback Model', 
					type: '${NodeConnectionType.AiLanguageModel}', 
					required: false, 
					maxConnections: 1 
				},
				{ 
					displayName: 'Memory Store', 
					type: '${NodeConnectionType.AiMemory}', 
					required: false,
					maxConnections: 5  // Multiple memories
				}
			].concat(
				$parameter.enableTools ? 
				[{ displayName: 'Tools', type: '${NodeConnectionType.AiTool}', required: false }] : 
				[]
			)
		}}`,
		outputs: ['main', 'metadata'],  // Multiple outputs
		properties: [
			{
				displayName: 'Enable Tools',
				name: 'enableTools',
				type: 'boolean',
				default: false,
			},
			// ... other properties
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Access different input types
		const mainData = this.getInputData();
		const primaryModel = await this.getInputConnectionData(NodeConnectionType.AiLanguageModel, 0);
		const fallbackModel = await this.getInputConnectionData(NodeConnectionType.AiLanguageModel, 1);
		
		// Handle multiple memories
		const memories = [];
		for (let i = 0; i < 5; i++) {
			try {
				const memory = await this.getInputConnectionData(NodeConnectionType.AiMemory, i);
				if (memory) memories.push(memory);
			} catch {
				break; // No more memories
			}
		}

		// Process with intelligent fallback
		const mainResults = [];
		const metadataResults = [];

		for (const item of mainData) {
			try {
				const result = await primaryModel.invoke(item.json.query);
				mainResults.push({ json: { ...item.json, result } });
				metadataResults.push({ json: { model: 'primary', success: true } });
			} catch (error) {
				if (fallbackModel) {
					const result = await fallbackModel.invoke(item.json.query);
					mainResults.push({ json: { ...item.json, result } });
					metadataResults.push({ json: { model: 'fallback', success: true } });
				} else {
					throw error;
				}
			}
		}

		return [mainResults, metadataResults];
	}
}
```

## 🧠 Intelligent Routing Pattern

Route requests to different processors based on content analysis.

### Smart Router Implementation
```typescript
export class SmartRouter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Smart Router',
		name: 'smartRouter',
		icon: 'file:router.svg',
		group: ['transform'],
		version: 1,
		description: 'Intelligently route data based on content analysis',
		inputs: ['main'],
		outputs: [
			{ type: 'main', displayName: 'Technical' },
			{ type: 'main', displayName: 'Creative' },
			{ type: 'main', displayName: 'Data Analysis' },
			{ type: 'main', displayName: 'General' },
		],
		properties: [
			{
				displayName: 'Routing Strategy',
				name: 'routingStrategy',
				type: 'options',
				options: [
					{ name: 'AI-Based Analysis', value: 'ai' },
					{ name: 'Keyword Matching', value: 'keywords' },
					{ name: 'Rule-Based', value: 'rules' },
				],
				default: 'ai',
			},
			{
				displayName: 'Technical Keywords',
				name: 'technicalKeywords',
				type: 'string',
				default: 'code,programming,debug,api,function,class',
				displayOptions: { show: { routingStrategy: ['keywords'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const strategy = this.getNodeParameter('routingStrategy', 0) as string;

		// Initialize output arrays
		const technical: INodeExecutionData[] = [];
		const creative: INodeExecutionData[] = [];
		const dataAnalysis: INodeExecutionData[] = [];
		const general: INodeExecutionData[] = [];

		for (const item of items) {
			const content = JSON.stringify(item.json).toLowerCase();
			let route: string;

			switch (strategy) {
				case 'ai':
					route = await this.analyzeWithAI(content);
					break;
				case 'keywords':
					route = await this.analyzeWithKeywords(content);
					break;
				case 'rules':
					route = await this.analyzeWithRules(content);
					break;
				default:
					route = 'general';
			}

			// Route to appropriate output
			switch (route) {
				case 'technical':
					technical.push({ ...item, json: { ...item.json, route } });
					break;
				case 'creative':
					creative.push({ ...item, json: { ...item.json, route } });
					break;
				case 'data':
					dataAnalysis.push({ ...item, json: { ...item.json, route } });
					break;
				default:
					general.push({ ...item, json: { ...item.json, route } });
			}
		}

		return [technical, creative, dataAnalysis, general];
	}

	private async analyzeWithAI(content: string): Promise<string> {
		// Implement AI-based content analysis
		const prompt = `Analyze this content and categorize it as: technical, creative, data, or general.\n\nContent: ${content.substring(0, 500)}`;
		
		// Use a lightweight model for classification
		const classification = await this.classifyContent(prompt);
		return classification.toLowerCase();
	}

	private async analyzeWithKeywords(content: string): Promise<string> {
		const technicalKeywords = this.getNodeParameter('technicalKeywords', 0) as string;
		const keywords = technicalKeywords.split(',').map(k => k.trim().toLowerCase());
		
		const hasKeywords = keywords.some(keyword => content.includes(keyword));
		return hasKeywords ? 'technical' : 'general';
	}

	private async analyzeWithRules(content: string): Promise<string> {
		// Implement rule-based classification
		if (content.includes('function') || content.includes('class') || content.includes('api')) {
			return 'technical';
		}
		if (content.includes('story') || content.includes('creative') || content.includes('design')) {
			return 'creative';
		}
		if (content.includes('data') || content.includes('analysis') || content.includes('chart')) {
			return 'data';
		}
		return 'general';
	}
}
```

## 🔄 State Management Pattern

Handle complex state across multiple executions (using external stores).

### Redis-Based State Manager
```typescript
interface StateManager {
	get(key: string): Promise<any>;
	set(key: string, value: any, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;
}

class RedisStateManager implements StateManager {
	private redis: any;

	constructor(connectionString: string) {
		// Initialize Redis connection
		const Redis = require('ioredis');
		this.redis = new Redis(connectionString);
	}

	async get(key: string): Promise<any> {
		const value = await this.redis.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttl: number = 3600): Promise<void> {
		await this.redis.setex(key, ttl, JSON.stringify(value));
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key);
	}

	async exists(key: string): Promise<boolean> {
		return (await this.redis.exists(key)) === 1;
	}
}

export class StatefulProcessor implements INodeType {
	private stateManager: StateManager;

	constructor() {
		// Initialize with Redis or other state store
		this.stateManager = new RedisStateManager(process.env.REDIS_URL || 'redis://localhost:6379');
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const workflowId = this.getWorkflow().id;
		const nodeId = this.getNode().id;
		const stateKey = `workflow:${workflowId}:node:${nodeId}`;

		// Load previous state
		const previousState = await this.stateManager.get(stateKey) || { 
			processedCount: 0, 
			lastProcessed: null,
			aggregatedData: [] 
		};

		const returnData: INodeExecutionData[] = [];

		for (const item of items) {
			// Process with state context
			const result = await this.processWithState(item, previousState);
			
			// Update state
			previousState.processedCount++;
			previousState.lastProcessed = new Date().toISOString();
			previousState.aggregatedData.push(result.summary);

			returnData.push({ json: result.data });
		}

		// Save updated state
		await this.stateManager.set(stateKey, previousState, 3600); // 1 hour TTL

		return [returnData];
	}

	private async processWithState(item: INodeExecutionData, state: any) {
		return {
			data: {
				...item.json,
				processedCount: state.processedCount + 1,
				previousContext: state.lastProcessed,
			},
			summary: {
				id: item.json.id,
				processedAt: new Date().toISOString(),
			}
		};
	}
}
```

## 📊 Streaming Data Pattern

Handle large datasets with streaming processing.

### Stream Processor Implementation
```typescript
export class StreamProcessor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stream Processor',
		name: 'streamProcessor',
		icon: 'file:stream.svg',
		group: ['transform'],
		version: 1,
		description: 'Process large datasets in streaming fashion',
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Batch Size',
				name: 'batchSize',
				type: 'number',
				default: 100,
				description: 'Number of items to process in each batch',
			},
			{
				displayName: 'Parallel Processing',
				name: 'parallelProcessing',
				type: 'boolean',
				default: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const batchSize = this.getNodeParameter('batchSize', 0) as number;
		const parallel = this.getNodeParameter('parallelProcessing', 0) as boolean;

		const returnData: INodeExecutionData[] = [];

		if (parallel) {
			// Parallel batch processing
			const batches = this.createBatches(items, batchSize);
			const batchPromises = batches.map((batch, batchIndex) => 
				this.processBatch(batch, batchIndex)
			);

			const batchResults = await Promise.allSettled(batchPromises);
			
			for (const result of batchResults) {
				if (result.status === 'fulfilled') {
					returnData.push(...result.value);
				} else {
					console.error('Batch processing failed:', result.reason);
					// Handle batch failures based on node configuration
				}
			}
		} else {
			// Sequential processing with memory management
			for (let i = 0; i < items.length; i += batchSize) {
				const batch = items.slice(i, i + batchSize);
				const batchResults = await this.processBatch(batch, Math.floor(i / batchSize));
				
				returnData.push(...batchResults);
				
				// Memory management
				if (i % (batchSize * 10) === 0) {
					await this.yieldControl(); // Allow other operations
				}
			}
		}

		return [returnData];
	}

	private createBatches<T>(items: T[], batchSize: number): T[][] {
		const batches: T[][] = [];
		for (let i = 0; i < items.length; i += batchSize) {
			batches.push(items.slice(i, i + batchSize));
		}
		return batches;
	}

	private async processBatch(batch: INodeExecutionData[], batchIndex: number): Promise<INodeExecutionData[]> {
		console.log(`📦 Processing batch ${batchIndex + 1} with ${batch.length} items`);
		
		const results = await Promise.all(
			batch.map(async (item, itemIndex) => {
				try {
					const processed = await this.processItem(item);
					return {
						json: {
							...processed,
							batchIndex,
							itemIndex,
						}
					};
				} catch (error) {
					console.error(`Error in batch ${batchIndex}, item ${itemIndex}:`, error);
					return {
						json: {
							error: error.message,
							batchIndex,
							itemIndex,
							originalData: item.json,
						}
					};
				}
			})
		);

		return results;
	}

	private async processItem(item: INodeExecutionData): Promise<any> {
		// Implement your processing logic here
		await new Promise(resolve => setTimeout(resolve, 10)); // Simulate processing time
		return { ...item.json, processed: true, timestamp: new Date().toISOString() };
	}

	private async yieldControl(): Promise<void> {
		return new Promise(resolve => setImmediate(resolve));
	}
}
```

## 🔌 Protocol Implementation Pattern

Implement custom protocols (WebSocket, MCP, etc.) within n8n nodes.

### WebSocket Protocol Node
```typescript
export class WebSocketClient implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WebSocket Client',
		name: 'webSocketClient',
		icon: 'file:websocket.svg',
		group: ['input'],
		version: 1,
		description: 'Connect to WebSocket servers and handle real-time data',
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'webSocketAuth',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'WebSocket URL',
				name: 'url',
				type: 'string',
				required: true,
				default: 'wss://api.example.com/ws',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Send Message', value: 'send' },
					{ name: 'Listen for Messages', value: 'listen' },
					{ name: 'Subscribe to Topic', value: 'subscribe' },
				],
				default: 'send',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: { operation: ['send', 'subscribe'] },
				},
			},
			{
				displayName: 'Timeout (seconds)',
				name: 'timeout',
				type: 'number',
				default: 30,
				displayOptions: {
					show: { operation: ['listen'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const url = this.getNodeParameter('url', 0) as string;

		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];

			switch (operation) {
				case 'send':
					const message = this.getNodeParameter('message', itemIndex);
					const result = await this.sendMessage(url, message, item);
					returnData.push(result);
					break;

				case 'listen':
					const timeout = this.getNodeParameter('timeout', itemIndex) as number;
					const messages = await this.listenForMessages(url, timeout);
					returnData.push(...messages);
					break;

				case 'subscribe':
					const subscriptionMessage = this.getNodeParameter('message', itemIndex);
					const subscriptionResult = await this.subscribeToTopic(url, subscriptionMessage);
					returnData.push(subscriptionResult);
					break;
			}
		}

		return [returnData];
	}

	private async sendMessage(url: string, message: any, item: INodeExecutionData): Promise<INodeExecutionData> {
		return new Promise((resolve, reject) => {
			const WebSocket = require('ws');
			const ws = new WebSocket(url);

			ws.on('open', () => {
				ws.send(JSON.stringify(message));
				ws.close();
				resolve({
					json: {
						...item.json,
						sent: true,
						message,
						timestamp: new Date().toISOString(),
					}
				});
			});

			ws.on('error', (error: any) => {
				reject(new Error(`WebSocket error: ${error.message}`));
			});

			// Timeout after 10 seconds
			setTimeout(() => {
				ws.close();
				reject(new Error('WebSocket send timeout'));
			}, 10000);
		});
	}

	private async listenForMessages(url: string, timeoutSeconds: number): Promise<INodeExecutionData[]> {
		return new Promise((resolve, reject) => {
			const WebSocket = require('ws');
			const ws = new WebSocket(url);
			const messages: INodeExecutionData[] = [];

			ws.on('open', () => {
				console.log('WebSocket connected, listening for messages...');
			});

			ws.on('message', (data: any) => {
				try {
					const parsed = JSON.parse(data.toString());
					messages.push({
						json: {
							message: parsed,
							receivedAt: new Date().toISOString(),
						}
					});
				} catch (error) {
					messages.push({
						json: {
							rawMessage: data.toString(),
							receivedAt: new Date().toISOString(),
							parseError: error.message,
						}
					});
				}
			});

			ws.on('error', (error: any) => {
				reject(new Error(`WebSocket error: ${error.message}`));
			});

			// Close after timeout
			setTimeout(() => {
				ws.close();
				resolve(messages);
			}, timeoutSeconds * 1000);
		});
	}

	private async subscribeToTopic(url: string, subscriptionMessage: any): Promise<INodeExecutionData> {
		// Implementation for topic subscription
		// Return confirmation of subscription
		return {
			json: {
				subscribed: true,
				topic: subscriptionMessage,
				timestamp: new Date().toISOString(),
			}
		};
	}
}
```

## 🎛️ Dynamic Configuration Pattern

Nodes that adapt their behavior based on external configuration or context.

### Adaptive Configuration Node
```typescript
export class AdaptiveNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adaptive Node',
		name: 'adaptiveNode',
		icon: 'file:adaptive.svg',
		group: ['transform'],
		version: 1,
		description: 'Adapts behavior based on context and configuration',
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Configuration Source',
				name: 'configSource',
				type: 'options',
				options: [
					{ name: 'Static Configuration', value: 'static' },
					{ name: 'External API', value: 'api' },
					{ name: 'Database Lookup', value: 'database' },
					{ name: 'Context-Based', value: 'context' },
				],
				default: 'static',
			},
			{
				displayName: 'Configuration',
				name: 'staticConfig',
				type: 'json',
				default: '{"strategy": "default", "parameters": {}}',
				displayOptions: {
					show: { configSource: ['static'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const configSource = this.getNodeParameter('configSource', 0) as string;

		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];

			// Load configuration based on source
			const config = await this.loadConfiguration(configSource, item, itemIndex);

			// Process item with dynamic configuration
			const result = await this.processWithConfig(item, config);
			returnData.push(result);
		}

		return [returnData];
	}

	private async loadConfiguration(source: string, item: INodeExecutionData, itemIndex: number): Promise<any> {
		switch (source) {
			case 'static':
				return this.getNodeParameter('staticConfig', itemIndex);

			case 'api':
				return await this.loadFromAPI(item);

			case 'database':
				return await this.loadFromDatabase(item);

			case 'context':
				return await this.loadFromContext(item);

			default:
				throw new Error(`Unknown configuration source: ${source}`);
		}
	}

	private async loadFromAPI(item: INodeExecutionData): Promise<any> {
		// Load configuration from external API
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: `https://config-api.example.com/config/${item.json.id}`,
			json: true,
		});

		return response.configuration;
	}

	private async loadFromDatabase(item: INodeExecutionData): Promise<any> {
		// Load from database (example with hypothetical DB helper)
		// In real implementation, use appropriate database client
		const query = `SELECT configuration FROM node_configs WHERE item_id = ?`;
		const result = await this.executeDatabaseQuery(query, [item.json.id]);
		
		return result.length > 0 ? JSON.parse(result[0].configuration) : {};
	}

	private async loadFromContext(item: INodeExecutionData): Promise<any> {
		// Analyze item content to determine configuration
		const content = JSON.stringify(item.json);
		
		if (content.includes('urgent') || content.includes('priority')) {
			return { strategy: 'priority', timeout: 5000 };
		} else if (content.includes('batch') || content.includes('bulk')) {
			return { strategy: 'batch', batchSize: 100 };
		} else {
			return { strategy: 'standard', timeout: 30000 };
		}
	}

	private async processWithConfig(item: INodeExecutionData, config: any): Promise<INodeExecutionData> {
		// Process item based on configuration
		switch (config.strategy) {
			case 'priority':
				return await this.processPriority(item, config);
			case 'batch':
				return await this.processBatch(item, config);
			default:
				return await this.processStandard(item, config);
		}
	}

	private async processPriority(item: INodeExecutionData, config: any): Promise<INodeExecutionData> {
		// High-priority processing
		return {
			json: {
				...item.json,
				processed: true,
				strategy: 'priority',
				processedAt: new Date().toISOString(),
			}
		};
	}

	private async processBatch(item: INodeExecutionData, config: any): Promise<INodeExecutionData> {
		// Batch processing logic
		return {
			json: {
				...item.json,
				processed: true,
				strategy: 'batch',
				batchSize: config.batchSize,
				processedAt: new Date().toISOString(),
			}
		};
	}

	private async processStandard(item: INodeExecutionData, config: any): Promise<INodeExecutionData> {
		// Standard processing
		return {
			json: {
				...item.json,
				processed: true,
				strategy: 'standard',
				processedAt: new Date().toISOString(),
			}
		};
	}

	private async executeDatabaseQuery(query: string, params: any[]): Promise<any[]> {
		// Placeholder for database query execution
		// In real implementation, use your database client
		return [];
	}
}
```

## 🎯 Performance Optimization Patterns

### Connection Pooling & Caching
```typescript
class ConnectionPool {
	private pools = new Map<string, any>();

	getPool(url: string) {
		if (!this.pools.has(url)) {
			const pool = this.createPool(url);
			this.pools.set(url, pool);
		}
		return this.pools.get(url);
	}

	private createPool(url: string) {
		// Create appropriate connection pool based on URL
		if (url.startsWith('postgres://')) {
			const { Pool } = require('pg');
			return new Pool({ connectionString: url });
		} else if (url.startsWith('redis://')) {
			const Redis = require('ioredis');
			return new Redis(url);
		}
		// Add more pool types as needed
	}
}

const globalConnectionPool = new ConnectionPool();

export class OptimizedNode implements INodeType {
	private cache = new Map<string, { data: any; expiry: number }>();

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Process in optimized batches
		const batches = this.optimizeBatches(items);

		for (const batch of batches) {
			const batchResults = await Promise.all(
				batch.map(item => this.processWithOptimizations(item))
			);
			returnData.push(...batchResults);
		}

		return [returnData];
	}

	private optimizeBatches(items: INodeExecutionData[]): INodeExecutionData[][] {
		// Group similar items for batch processing
		const groupedItems = new Map<string, INodeExecutionData[]>();

		for (const item of items) {
			const key = this.getItemKey(item);
			if (!groupedItems.has(key)) {
				groupedItems.set(key, []);
			}
			groupedItems.get(key)!.push(item);
		}

		return Array.from(groupedItems.values());
	}

	private async processWithOptimizations(item: INodeExecutionData): Promise<INodeExecutionData> {
		const cacheKey = this.getCacheKey(item);

		// Check cache first
		const cached = this.getFromCache(cacheKey);
		if (cached) {
			return { json: { ...item.json, ...cached, fromCache: true } };
		}

		// Process and cache result
		const result = await this.processItem(item);
		this.setCache(cacheKey, result, 300000); // 5 minutes

		return { json: { ...item.json, ...result, fromCache: false } };
	}

	private getFromCache(key: string): any | null {
		const cached = this.cache.get(key);
		if (cached && cached.expiry > Date.now()) {
			return cached.data;
		}
		this.cache.delete(key);
		return null;
	}

	private setCache(key: string, data: any, ttl: number): void {
		this.cache.set(key, {
			data,
			expiry: Date.now() + ttl
		});
	}

	private getItemKey(item: INodeExecutionData): string {
		// Generate grouping key for optimization
		return `${item.json.type || 'default'}-${item.json.category || 'general'}`;
	}

	private getCacheKey(item: INodeExecutionData): string {
		// Generate cache key
		return `item-${JSON.stringify(item.json).slice(0, 100)}`;
	}

	private async processItem(item: INodeExecutionData): Promise<any> {
		// Your processing logic here
		return { processed: true, timestamp: new Date().toISOString() };
	}
}
```

These advanced patterns enable you to build sophisticated, production-ready n8n nodes that can handle complex scenarios, scale effectively, and provide rich user experiences. Choose the patterns that best fit your specific use case and requirements.