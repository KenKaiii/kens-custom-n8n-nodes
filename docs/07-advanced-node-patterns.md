# 🚀 Advanced Node Patterns & Architecture

**Real-world insights from building complex n8n nodes like SuperCodeNode**

Based on creating the SuperCodeNode - a comprehensive code execution environment with AI agent support, VM sandboxing, and 30+ integrated libraries - this guide shares practical patterns for building sophisticated custom nodes.

## Complex Node Architecture Patterns

### Multi-Language Execution Pattern

_Learned from SuperCodeNode's JavaScript/Python dual execution_

```typescript
export class MultiLanguageNode implements INodeType {
	description: INodeTypeDescription = {
		properties: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'JavaScript', value: 'javascript' },
					{ name: 'Python', value: 'python' },
				],
				default: 'javascript',
			},
			// Conditional code editors based on language
			{
				displayName: 'JavaScript Code',
				name: 'jsCode',
				type: 'string',
				displayOptions: { show: { language: ['javascript'] } },
				typeOptions: {
					editor: 'jsEditor',
					rows: 15,
				},
			},
			{
				displayName: 'Python Code',
				name: 'pythonCode',
				type: 'string',
				displayOptions: { show: { language: ['python'] } },
				typeOptions: {
					editor: 'jsEditor',
					editorLanguage: 'python',
					rows: 15,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const language = this.getNodeParameter('language', 0) as string;

		if (language === 'python') {
			return await this.executePython();
		} else {
			return await this.executeJavaScript();
		}
	}

	private async executePython(): Promise<INodeExecutionData[][]> {
		// Delegate to specialized executor class
		const executor = new PythonExecutor();
		return await executor.execute(/* params */);
	}
}
```

**Key Insights:**

- **Separate execution classes** for different languages/modes
- **Conditional UI properties** based on user selection
- **Consistent parameter patterns** across execution modes

### AI Agent Integration Pattern

_SuperCodeNode's seamless AI connection handling_

```typescript
// Enable AI Agent Mode
{
    displayName: 'AI Agent Mode',
    name: 'aiAgentMode',
    type: 'boolean',
    default: false,
    description: 'Enable AI agent connections (LLM, Memory, Tools)',
},

// In execute method
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const aiAgentMode = this.getNodeParameter('aiAgentMode', 0, false) as boolean;

    if (aiAgentMode) {
        const aiConnections = await this.getAiConnections();
        // Pass to execution environment
        return await this.executeWithAI(aiConnections);
    }

    return await this.executeStandalone();
}

private async getAiConnections() {
    const connections: any = {};

    try {
        // Language Model
        const llmConnection = await this.getInputConnectionData(
            NodeConnectionType.AiLanguageModel, 0
        );
        if (llmConnection) {
            connections.llm = Array.isArray(llmConnection)
                ? llmConnection[0] : llmConnection;
        }

        // Memory
        const memoryConnection = await this.getInputConnectionData(
            NodeConnectionType.AiMemory, 0
        );
        if (memoryConnection) {
            connections.memory = Array.isArray(memoryConnection)
                ? memoryConnection[0] : memoryConnection;
        }

        // Tools
        const toolConnection = await this.getInputConnectionData(
            NodeConnectionType.AiTool, 0
        );
        if (toolConnection) {
            connections.tools = Array.isArray(toolConnection)
                ? toolConnection[0] : toolConnection;
        }
    } catch (error) {
        // Gracefully handle missing connections
        console.log(`AI connection not available: ${error.message}`);
    }

    return connections;
}
```

**Key Insights:**

- **Extract AI connections from arrays** for user convenience
- **Graceful degradation** when AI connections aren't available
- **Auto-populate variables** in execution environment
- **Try/catch for each connection type** - they're optional

### VM-Safe Library Loading Pattern

_Critical for secure code execution nodes_

```typescript
class LibraryManager {
	private libraryCache: Record<string, unknown> = {};

	createVmSafeLazyLoader(
		hostObj: Record<string, unknown>,
		name: string,
		requirePath: string,
		property?: string,
	) {
		let defined = false;
		let cachedValue: unknown;

		Object.defineProperty(hostObj, name, {
			get: function () {
				if (!defined) {
					defined = true;
					try {
						const lib = require(requirePath);
						cachedValue = property ? lib[property] : lib;

						// Redefine as value property for VM compatibility
						Object.defineProperty(this, name, {
							value: cachedValue,
							writable: false,
							configurable: true,
							enumerable: true,
						});

						return cachedValue;
					} catch (error) {
						throw new Error(`Failed to load ${name}: ${error.message}`);
					}
				}
				return this[name];
			},
			configurable: true,
			enumerable: true,
		});
	}

	setupLibraries(sandbox: Record<string, unknown>) {
		const libraries = [
			['_', 'lodash'],
			['axios', 'axios'],
			['dayjs', 'dayjs'],
			['uuid', 'uuid', 'v4'], // With property extraction
		];

		libraries.forEach(([name, requirePath, property]) => {
			this.createVmSafeLazyLoader(sandbox, name, requirePath, property);
		});
	}
}
```

**Key Insights:**

- **VM context getters can break** - use value properties after first load
- **Lazy loading prevents startup overhead** - only load what's used
- **Cache loaded libraries** to avoid repeated require() calls
- **Property extraction** (e.g., uuid.v4) for convenience

### Advanced Error Handling Pattern

_LLM-friendly error messages for better debugging_

```typescript
private createLLMFriendlyError(
    type: string,
    libraryName: string,
    originalError: Error,
    context?: unknown
) {
    const errorCodes = {
        LIBRARY_MISSING: 'E001',
        METHOD_NOT_FOUND: 'E003',
        TYPE_ERROR: 'E005',
        ASYNC_ERROR: 'E006',
    };

    const fixes = {
        E001: `Library '${libraryName}' not installed. Run: npm install ${libraryName}`,
        E003: `Method not found. Check: 1) Method name 2) Library docs 3) Await needed?`,
        E005: `Type error. Check: 1) Data type 2) Null/undefined 3) Array vs Object?`,
        E006: `Async error. Fix: 1) Add 'await' 2) Use .then() 3) Wrap in try/catch`,
    };

    const code = errorCodes[type] || 'E000';
    const fix = fixes[code] || 'Check syntax and library documentation';

    return new Error(
        `🤖 LLM-FRIENDLY ERROR [${code}]\n` +
        `📍 Library: ${libraryName}\n` +
        `🔍 Issue: ${originalError.message}\n` +
        `💡 Fix: ${fix}\n` +
        `📝 Context: ${context ? JSON.stringify(context, null, 2) : 'None'}\n`
    );
}

// Usage in execution
try {
    const result = someLibrary.method();
} catch (error) {
    if (error.name === 'TypeError' && error.message.includes('not a function')) {
        throw this.createLLMFriendlyError('METHOD_NOT_FOUND', 'someLibrary', error);
    }
    throw error;
}
```

**Key Insights:**

- **Structured error codes** help users understand issues
- **Specific fix suggestions** reduce support burden
- **Context inclusion** aids debugging
- **LLM-optimized formatting** for AI-assisted development

### Performance Monitoring Pattern

_Essential for resource-intensive nodes_

```typescript
class PerformanceTracker {
	private loadTimes: Record<string, number> = {};
	private libraryCount = 0;

	trackLibraryLoad<T>(name: string, loadFn: () => T): T {
		const start = Date.now();
		const result = loadFn();
		const duration = Date.now() - start;

		this.loadTimes[name] = duration;
		this.libraryCount++;

		if (duration > 1000) {
			console.warn(`[Performance] Slow library load: ${name} (${duration}ms)`);
		}

		return result;
	}

	getStats() {
		const totalTime = Object.values(this.loadTimes).reduce((a, b) => a + b, 0);
		const avgTime = totalTime / this.libraryCount || 0;

		return {
			totalLibraries: this.libraryCount,
			totalLoadTime: totalTime,
			averageLoadTime: Math.round(avgTime),
			slowestLibrary: Object.entries(this.loadTimes).sort(([, a], [, b]) => b - a)[0],
		};
	}

	// Memory monitoring
	getMemoryUsage() {
		const usage = process.memoryUsage();
		return {
			heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
			heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
			librariesLoaded: this.libraryCount,
			estimatedFootprint: `${this.libraryCount * 2} MB`, // Rough estimate
		};
	}
}

// Add to sandbox for user access
sandbox.utils = {
	getPerformanceStats: () => this.tracker.getStats(),
	memoryUsage: () => this.tracker.getMemoryUsage(),
	// ... other utilities
};
```

**Key Insights:**

- **Track resource usage** for optimization opportunities
- **Warn about slow operations** proactively
- **Expose monitoring to users** for debugging
- **Memory footprint awareness** prevents crashes

### Complex UI Configuration Pattern

_Dynamic property visibility and validation_

```typescript
properties: [
    // Mode selection affects entire UI
    {
        displayName: 'Execution Mode',
        name: 'executionMode',
        type: 'options',
        options: [
            { name: 'Run Once for All Items', value: 'runOnceForAllItems' },
            { name: 'Run Once for Each Item', value: 'runOnceForEachItem' },
        ],
        default: 'runOnceForAllItems',
    },

    // Advanced section toggle
    {
        displayName: 'Advanced Settings',
        name: 'showAdvanced',
        type: 'boolean',
        default: false,
    },

    // Conditional advanced options
    {
        displayName: 'Timeout (seconds)',
        name: 'timeout',
        type: 'number',
        displayOptions: {
            show: { showAdvanced: [true] }
        },
        default: 30,
        description: 'Maximum execution time',
    },

    // Multiple condition visibility
    {
        displayName: 'Performance Monitoring',
        name: 'enableMonitoring',
        type: 'boolean',
        displayOptions: {
            show: {
                showAdvanced: [true],
                executionMode: ['runOnceForAllItems'], // Only for specific mode
            }
        },
        default: false,
    },

    // Collection of related settings
    {
        displayName: 'Library Configuration',
        name: 'librarySettings',
        type: 'collection',
        placeholder: 'Add Library Setting',
        displayOptions: { show: { showAdvanced: [true] } },
        default: {},
        options: [
            {
                displayName: 'Preload Libraries',
                name: 'preloadLibraries',
                type: 'multiOptions',
                options: [
                    { name: 'Lodash (_)', value: 'lodash' },
                    { name: 'Axios', value: 'axios' },
                    { name: 'Day.js', value: 'dayjs' },
                ],
                default: [],
            },
            {
                displayName: 'Cache Libraries',
                name: 'cacheLibraries',
                type: 'boolean',
                default: true,
            },
        ],
    },
],
```

**Key Insights:**

- **Group related settings** with collections
- **Progressive disclosure** prevents UI overwhelm
- **Multiple condition visibility** for complex logic
- **Sensible defaults** reduce configuration burden

## Advanced TypeScript Patterns

### Type-Safe Parameter Handling

```typescript
interface NodeParameters {
	language: 'javascript' | 'python';
	code: string;
	timeout: number;
	aiAgentMode: boolean;
}

class TypeSafeNode implements INodeType {
	private getTypedParameter<K extends keyof NodeParameters>(
		name: K,
		itemIndex: number,
	): NodeParameters[K] {
		return this.getNodeParameter(name, itemIndex) as NodeParameters[K];
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const language = this.getTypedParameter('language', 0);
		const code = this.getTypedParameter('code', 0);
		const timeout = this.getTypedParameter('timeout', 0);

		// TypeScript knows the exact types now
		if (language === 'python') {
			// Handle Python execution
		}
	}
}
```

### Generic Execution Pattern

```typescript
interface ExecutionContext<T = unknown> {
	items: INodeExecutionData[];
	parameters: T;
	aiConnections?: Record<string, unknown>;
}

abstract class BaseExecutor<TParams = unknown> {
	abstract execute(context: ExecutionContext<TParams>): Promise<INodeExecutionData[][]>;

	protected handleError(error: Error, itemIndex: number, originalData: unknown) {
		return {
			json: {
				error: error.message,
				originalData,
				timestamp: new Date().toISOString(),
			},
			error,
			pairedItem: { item: itemIndex },
		};
	}
}

class JavaScriptExecutor extends BaseExecutor<{ code: string; timeout: number }> {
	async execute(context: ExecutionContext<{ code: string; timeout: number }>) {
		// Implementation specific to JavaScript execution
		return [[]];
	}
}
```

## Real-World Lessons Learned

### 1. Method Signature Corruption

**Problem**: TypeScript method signatures getting corrupted during linting/formatting.

```typescript
// Gets corrupted from:
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>
// To:
async exctions): Promise<INodeExecutionData[][]>
```

**Solutions**:

- Use minimal linting rules for complex nodes
- Focus on TypeScript compilation over linting perfection
- Add ESLint environment directives: `/* eslint-env node */`
- Prefer `npm run build` success over perfect linting scores

### 2. Node.js Globals in n8n Context

**Problem**: `console`, `require`, `process`, `setTimeout` not defined in ESLint.

**Solution**:

```typescript
/* eslint-env node */
// or
/* global console, require, process, setTimeout */
```

### 3. AI Connection Array Extraction

**Problem**: n8n AI connections return arrays, but users expect direct objects.

**Solution**: Always extract from arrays for better UX:

```typescript
const llmConnection = await this.getInputConnectionData(NodeConnectionType.AiLanguageModel, 0);
const llm = Array.isArray(llmConnection) ? llmConnection[0] : llmConnection;
```

### 4. VM Context Limitations

**Problem**: VM context doesn't handle getter properties well.

**Solution**: Convert to value properties after first access:

```typescript
Object.defineProperty(this, name, {
	value: cachedValue,
	writable: false,
	configurable: true,
	enumerable: true,
});
```

### 5. Build vs Runtime Errors

**Focus on what matters**:

- ✅ **TypeScript compilation** (`npm run build` success)
- ✅ **Functional correctness** (node works as expected)
- ⚠️ **ESLint warnings** (nice to have, but not critical)

## Next Steps

1. **Start Simple**: Begin with basic patterns, add complexity gradually
2. **Test Thoroughly**: Use [03-testing-guide.md](./03-testing-guide.md) for comprehensive testing
3. **Monitor Performance**: Implement tracking for resource-intensive operations
4. **Document Patterns**: Share successful patterns with your team

**Build sophisticated nodes that users love!** 🚀
