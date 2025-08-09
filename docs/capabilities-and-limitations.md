# n8n Node Capabilities and Limitations (2025)

This guide defines what IS and ISN'T possible when creating custom n8n nodes. Read this first before designing any custom node.

## 🟢 What IS Possible - Excellent Use Cases

### HTTP/API Integration
```typescript
// ✅ EXCELLENT - Full HTTP support with authentication
- REST API calls with all methods (GET, POST, PUT, DELETE, PATCH)
- GraphQL integrations
- OAuth 1.0/2.0 authentication flows
- API key, bearer token, basic auth
- Custom headers and request transformation
- Response parsing and error handling
- Rate limiting and retry logic
```

### Data Transformation & Processing
```typescript
// ✅ EXCELLENT - Rich data manipulation
- JSON parsing, transformation, validation
- Data filtering, sorting, aggregation
- String manipulation and regex operations
- Date/time processing and formatting
- Mathematical calculations and formulas
- Data type conversions and normalization
- Conditional logic and routing
```

### AI/LLM Integration Patterns
```typescript
// ✅ EXCELLENT - Modern AI integration (2025)
- Multiple LLM provider integrations (OpenAI, Anthropic, etc.)
- Dynamic prompt routing based on input analysis
- Multi-step AI conversations with context
- AI response parsing and structured output
- Model switching based on task requirements
- Token counting and cost optimization
- Streaming responses for real-time UX
```

### Database Operations
```typescript
// ✅ EXCELLENT - Full database support
- SQL databases (PostgreSQL, MySQL, SQLite)
- NoSQL databases (MongoDB, Redis)
- Connection pooling and management
- Prepared statements for security
- Batch operations for performance
- Transaction management
- Query building and parameterization
```

### Real-time Processing
```typescript
// ✅ EXCELLENT - Event-driven patterns
- Webhook receiving and processing
- Server-sent events (SSE)
- Real-time data streaming
- Event queuing and buffering
- Async/await patterns
- Promise-based operations
- Background job scheduling
```

### Advanced Node Architectures
```typescript
// ✅ EXCELLENT - Complex node patterns
- Multi-input nodes (multiple connection types)
- Dynamic input/output configuration
- Conditional property display
- Complex UI components with validation
- Node-to-node communication patterns
- Memory and context management systems
- Protocol implementations (WebSocket, MCP, etc.)
```

## 🔴 What ISN'T Possible - Avoid These Patterns

### File System Operations
```typescript
// ❌ SECURITY RISK - Avoid entirely
❌ Direct file reading/writing
❌ Directory traversal operations
❌ Temporary file creation
❌ File system monitoring
❌ Log file manipulation

// ✅ ALTERNATIVE - Use n8n's built-in file handling
- Binary data processing through n8n's system
- Cloud storage APIs (S3, Google Drive, etc.)
- Database blob storage
```

### System Command Execution
```typescript
// ❌ MAJOR SECURITY RISK - Never implement
❌ shell.exec() or child_process operations
❌ System command invocation
❌ Process spawning
❌ Operating system interactions
❌ Environment variable manipulation

// ✅ ALTERNATIVE - Use appropriate APIs
- Use specific service APIs instead of CLI tools
- HTTP requests to containerized services
- Message queue systems for job processing
```

### Long-Running Processes
```typescript
// ❌ ARCHITECTURE VIOLATION - Nodes must complete quickly
❌ Background daemon processes
❌ Persistent connections beyond single execution
❌ Long-polling operations > 30 seconds
❌ Blocking synchronous operations
❌ Infinite loops or continuous monitoring

// ✅ ALTERNATIVE - Use proper patterns
- Webhook-based event handling
- External job queue systems
- n8n's built-in scheduling and triggers
```

### Complex State Management
```typescript
// ❌ STATELESS VIOLATION - Nodes can't persist state
❌ In-memory caches between executions
❌ Session storage or cookies
❌ Global variables for state
❌ File-based persistence
❌ Database state tied to node instances

// ✅ ALTERNATIVE - Use external systems
- Redis for caching
- Database for persistence  
- n8n's memory nodes for context
- External state management services
```

## 🚨 Critical Technical Constraints

### Memory Limitations
```yaml
# No hard memory limits but practical constraints:
Safe Range: < 100MB per execution
Warning Zone: 100-500MB (monitor carefully)  
Danger Zone: > 500MB (likely to fail)

# Memory-heavy operations that can cause issues:
- Large JSON datasets (>10MB)
- Binary data processing
- Complex object transformations
- Recursive algorithms
- Large array operations
```

### Execution Time Boundaries
```yaml
# Default: No timeout, but practical limits apply
Recommended: < 30 seconds per node
Warning: 30-60 seconds (may timeout in production)
Danger: > 60 seconds (likely to fail)

# Operations that commonly exceed limits:
- Large API responses
- Complex data transformations
- Multiple sequential API calls
- Heavy computational tasks
```

### Architecture Requirements
```typescript
// ✅ REQUIRED - All nodes must follow these patterns
interface NodeRequirements {
  // Stateless execution
  execution: 'stateless';
  
  // Return proper data structure
  output: INodeExecutionData[][];
  
  // Handle errors gracefully
  errorHandling: 'try-catch-with-meaningful-messages';
  
  // Validate inputs
  inputValidation: 'strict-type-checking';
  
  // Support batch processing
  batchProcessing: 'item-by-item-loops';
}
```

## 🎯 Optimal Node Patterns (2025)

### 1. API Integration Node
```typescript
// Perfect for: Service integrations, data fetching
Capabilities:
- Authentication handling
- Request/response transformation
- Error handling and retries
- Rate limiting compliance
- Pagination support
```

### 2. Data Transformation Node
```typescript
// Perfect for: Data processing, formatting, validation
Capabilities:
- JSON manipulation
- Data validation with schemas
- Conditional transformations
- Aggregation operations
- Format conversions
```

### 3. AI Processing Node
```typescript
// Perfect for: LLM integration, intelligent routing
Capabilities:
- Multi-provider AI integration
- Dynamic prompt management
- Response parsing and validation
- Cost optimization
- Context management
```

### 4. Protocol Implementation Node
```typescript
// Perfect for: Custom protocols, specialized communications
Capabilities:
- WebSocket connections
- Custom authentication schemes
- Protocol-specific data handling
- Real-time communications
- Event streaming
```

## 🔍 Performance Guidelines

### Efficient Patterns
```typescript
// ✅ EFFICIENT - Use these patterns
- Streaming JSON parsing for large responses
- Batch API requests where possible
- Connection pooling for databases
- Async/await for non-blocking operations
- Early validation and failure
- Minimal object copying
```

### Inefficient Patterns
```typescript
// ❌ INEFFICIENT - Avoid these patterns
- Synchronous blocking operations
- Large object cloning
- Repeated API calls in loops
- Complex nested transformations
- Memory-intensive operations
- Unnecessary data persistence
```

## 🛡️ Security Boundaries

### Safe Operations
- Using n8n's credential system
- Parameterized database queries
- Input validation and sanitization
- HTTPS-only communications
- Token-based authentication

### Dangerous Operations  
- Direct SQL string concatenation
- User input in system commands
- File system access
- Environment variable exposure
- Unvalidated external inputs

---

## 🎓 Key Takeaways for 2025

1. **Focus on Integration** - n8n nodes excel at connecting systems
2. **Embrace Statelessness** - Design for single-execution patterns
3. **Prioritize Security** - Never trust external inputs
4. **Optimize for Performance** - Keep executions under 30 seconds
5. **Leverage n8n's Strengths** - Use built-in authentication and data flow
6. **Modern AI Integration** - Support dynamic routing and multi-model patterns

When in doubt, ask: "Does this integrate systems safely and efficiently?" If yes, it's probably a good fit for an n8n custom node.