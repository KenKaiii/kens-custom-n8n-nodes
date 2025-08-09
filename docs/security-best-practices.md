# Security Best Practices for n8n Custom Nodes (2025)

Essential security guidelines for creating safe, secure n8n custom nodes.

## 🛡️ Security Fundamentals

### Core Security Principles
1. **Never Trust External Input** - Validate and sanitize everything
2. **Principle of Least Privilege** - Request minimal permissions needed
3. **Defense in Depth** - Multiple layers of security
4. **Fail Securely** - Errors shouldn't expose sensitive data
5. **Keep Secrets Secret** - Never expose credentials or sensitive data

## 🔐 Authentication & Credentials

### ✅ Secure Credential Handling
```typescript
// ✅ CORRECT - Use n8n's credential system
const credentials = await this.getCredentials('myApiCredentials');
const apiKey = credentials.apiKey as string;

// Use in requests
const response = await this.helpers.httpRequestWithAuthentication.call(
	this,
	'myApiCredentials',
	{
		method: 'GET',
		url: 'https://api.example.com/data',
	}
);
```

### ❌ Insecure Practices to Avoid
```typescript
// ❌ NEVER DO THIS - Hardcoded secrets
const apiKey = 'sk_live_abcd1234...';  // MAJOR SECURITY RISK

// ❌ NEVER DO THIS - Secrets in parameters
{
	displayName: 'API Key',
	name: 'apiKey',
	type: 'string',  // Should use credential system instead
}

// ❌ NEVER DO THIS - Logging secrets
console.log('API Key:', credentials.apiKey);  // Will expose in logs

// ❌ NEVER DO THIS - Exposing secrets in output
returnData.push({
	json: {
		result: response.data,
		apiKey: credentials.apiKey  // NEVER include credentials
	}
});
```

### 🔒 Credential Definition Best Practices
```typescript
// credentials/MyApiCredentials.credentials.ts
import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MyApiCredentials implements ICredentialType {
	name = 'myApiCredentials';
	displayName = 'My API Credentials';
	documentationUrl = 'https://docs.myapi.com/authentication';
	
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,  // ✅ Hide input
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Production', value: 'production' },
				{ name: 'Sandbox', value: 'sandbox' },
			],
			default: 'sandbox',  // ✅ Safe default
		},
	];

	// ✅ Optional: Test credentials
	async authenticate(credentials: any, requestOptions: any): Promise<any> {
		// Add authentication headers
		requestOptions.headers = {
			...requestOptions.headers,
			'Authorization': `Bearer ${credentials.apiKey}`,
			'X-Environment': credentials.environment,
		};
		return requestOptions;
	}

	// ✅ Optional: Validate credentials
	async test(credentials: any): Promise<boolean> {
		try {
			const response = await this.helpers.httpRequest({
				method: 'GET',
				url: 'https://api.example.com/auth/test',
				headers: {
					'Authorization': `Bearer ${credentials.apiKey}`,
				},
			});
			return response.statusCode === 200;
		} catch {
			return false;
		}
	}
}
```

## 🧹 Input Validation & Sanitization

### ✅ Comprehensive Input Validation
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];
		
		// ✅ Validate required fields
		if (!item.json || typeof item.json !== 'object') {
			throw new Error(`Item ${itemIndex}: Input must be a valid object`);
		}

		// ✅ Validate specific fields
		const email = this.getNodeParameter('email', itemIndex) as string;
		if (!this.isValidEmail(email)) {
			throw new Error(`Item ${itemIndex}: Invalid email format`);
		}

		// ✅ Sanitize string inputs
		const message = this.getNodeParameter('message', itemIndex) as string;
		const sanitizedMessage = this.sanitizeString(message);

		// ✅ Validate numeric ranges
		const count = this.getNodeParameter('count', itemIndex) as number;
		if (count < 1 || count > 1000) {
			throw new Error(`Item ${itemIndex}: Count must be between 1 and 1000`);
		}

		// ✅ Validate URLs
		const url = this.getNodeParameter('webhookUrl', itemIndex) as string;
		if (!this.isValidUrl(url)) {
			throw new Error(`Item ${itemIndex}: Invalid URL format`);
		}
	}
}

// ✅ Helper validation functions
private isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 254;
}

private isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return ['http:', 'https:'].includes(parsed.protocol);
	} catch {
		return false;
	}
}

private sanitizeString(input: string): string {
	// Remove potentially dangerous characters
	return input
		.replace(/[<>]/g, '') // Remove HTML tags
		.replace(/['"]/g, '') // Remove quotes
		.trim()
		.substring(0, 1000); // Limit length
}
```

### 🚫 SQL Injection Prevention
```typescript
// ✅ CORRECT - Use parameterized queries
async executeQuery(query: string, params: any[]): Promise<any> {
	// Example with pg (PostgreSQL)
	const client = await this.getDatabaseConnection();
	
	try {
		const result = await client.query(query, params);
		return result.rows;
	} finally {
		client.release();
	}
}

// Usage
const userId = this.getNodeParameter('userId', itemIndex) as string;
const results = await this.executeQuery(
	'SELECT * FROM users WHERE id = $1', 
	[userId]
);

// ❌ NEVER DO THIS - String concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`;  // SQL INJECTION RISK!
```

## 🌐 HTTP Request Security

### ✅ Secure HTTP Practices
```typescript
async makeSecureRequest(endpoint: string, data: any): Promise<any> {
	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: endpoint,
		body: data,
		json: true,
		timeout: 30000,
		
		// ✅ Security headers
		headers: {
			'User-Agent': 'n8n-custom-node/1.0.0',
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
		
		// ✅ SSL verification (default: true)
		rejectUnauthorized: true,
		
		// ✅ Limit response size
		maxBodyLength: 10 * 1024 * 1024, // 10MB limit
		
		// ✅ Follow redirects safely
		maxRedirects: 3,
	};

	// ✅ Validate URL before request
	if (!this.isValidUrl(endpoint)) {
		throw new Error('Invalid endpoint URL');
	}

	// ✅ Prevent SSRF attacks
	if (this.isInternalUrl(endpoint)) {
		throw new Error('Cannot make requests to internal/private networks');
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'myApiCredentials',
			requestOptions
		);

		// ✅ Validate response
		return this.validateResponse(response);
	} catch (error) {
		// ✅ Don't expose sensitive error details
		throw new Error('Request failed - check configuration and try again');
	}
}

private isInternalUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname;
		
		// Block internal/private IP ranges
		const internalPatterns = [
			/^127\./, // localhost
			/^10\./, // 10.0.0.0/8
			/^192\.168\./, // 192.168.0.0/16
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
			/^::1$/, // IPv6 localhost
			/^fc00:/, // IPv6 private
		];
		
		return internalPatterns.some(pattern => pattern.test(hostname));
	} catch {
		return true; // Invalid URL = block it
	}
}

private validateResponse(response: any): any {
	// ✅ Validate response structure
	if (!response || typeof response !== 'object') {
		throw new Error('Invalid response format');
	}

	// ✅ Sanitize response data
	return this.sanitizeResponseData(response);
}

private sanitizeResponseData(data: any): any {
	if (typeof data === 'string') {
		return this.sanitizeString(data);
	}
	
	if (Array.isArray(data)) {
		return data.map(item => this.sanitizeResponseData(item));
	}
	
	if (typeof data === 'object' && data !== null) {
		const sanitized: any = {};
		for (const [key, value] of Object.entries(data)) {
			// Skip potentially sensitive fields
			if (this.isSensitiveField(key)) {
				continue;
			}
			sanitized[key] = this.sanitizeResponseData(value);
		}
		return sanitized;
	}
	
	return data;
}

private isSensitiveField(fieldName: string): boolean {
	const sensitiveFields = [
		'password', 'token', 'secret', 'key', 'auth',
		'credential', 'private', 'internal'
	];
	const fieldLower = fieldName.toLowerCase();
	return sensitiveFields.some(sensitive => fieldLower.includes(sensitive));
}
```

## 🛡️ Error Handling Security

### ✅ Secure Error Handling
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			const result = await this.processItem(items[itemIndex], itemIndex);
			returnData.push(result);
		} catch (error) {
			// ✅ Log detailed error (server-side only)
			console.error(`Processing error for item ${itemIndex}:`, {
				error: error.message,
				stack: error.stack,
				itemData: this.sanitizeForLogging(items[itemIndex].json),
			});

			if (this.continueOnFail()) {
				// ✅ Return safe error to user
				returnData.push({
					json: {
						error: this.getSafeErrorMessage(error),
						itemIndex,
						timestamp: new Date().toISOString(),
					}
				});
			} else {
				// ✅ Throw safe error message
				throw new Error(this.getSafeErrorMessage(error));
			}
		}
	}

	return [returnData];
}

private getSafeErrorMessage(error: any): string {
	// ✅ Return user-friendly error without sensitive details
	if (error.message?.includes('authentication')) {
		return 'Authentication failed - please check your credentials';
	}
	
	if (error.message?.includes('timeout')) {
		return 'Request timed out - please try again';
	}
	
	if (error.response?.status === 429) {
		return 'Rate limit exceeded - please wait and try again';
	}
	
	if (error.response?.status >= 500) {
		return 'External service temporarily unavailable';
	}
	
	// ✅ Generic safe message
	return 'Processing failed - please check your configuration';
}

private sanitizeForLogging(data: any): any {
	// ✅ Remove sensitive data from logs
	const sanitized = { ...data };
	const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'auth'];
	
	for (const field of sensitiveFields) {
		if (field in sanitized) {
			sanitized[field] = '***REDACTED***';
		}
	}
	
	return sanitized;
}
```

## 🔍 Data Privacy & Protection

### ✅ Personal Data Handling
```typescript
// ✅ Identify and protect personal data
private isPersonalData(fieldName: string, value: any): boolean {
	const personalFields = [
		'email', 'phone', 'ssn', 'passport', 'license',
		'firstname', 'lastname', 'fullname', 'address',
		'birthday', 'birthdate', 'dob'
	];
	
	const fieldLower = fieldName.toLowerCase();
	return personalFields.some(field => fieldLower.includes(field));
}

private redactPersonalData(data: any): any {
	if (typeof data === 'object' && data !== null) {
		const redacted: any = {};
		
		for (const [key, value] of Object.entries(data)) {
			if (this.isPersonalData(key, value)) {
				redacted[key] = this.maskValue(value as string);
			} else {
				redacted[key] = typeof value === 'object' ? 
					this.redactPersonalData(value) : value;
			}
		}
		
		return redacted;
	}
	
	return data;
}

private maskValue(value: string): string {
	if (!value || typeof value !== 'string') return value;
	
	// ✅ Mask email addresses
	if (value.includes('@')) {
		const [local, domain] = value.split('@');
		return `${local[0]}***@${domain}`;
	}
	
	// ✅ Mask phone numbers
	if (/^\+?[\d\s\-()]+$/.test(value)) {
		return value.replace(/\d(?=\d{4})/g, '*');
	}
	
	// ✅ Default masking
	return value.length > 4 ? 
		value.substring(0, 2) + '***' + value.slice(-2) : 
		'***';
}

// ✅ Secure data output
private secureOutput(data: any): any {
	// Remove internal fields that shouldn't be exposed
	const internalFields = [
		'_id', '_internal', 'system_', 'debug_',
		'password', 'token', 'secret'
	];
	
	const cleaned = { ...data };
	
	for (const field of internalFields) {
		delete cleaned[field];
	}
	
	return cleaned;
}
```

## 🚨 Rate Limiting & DoS Protection

### ✅ Implement Rate Limiting
```typescript
class RateLimiter {
	private requests = new Map<string, { count: number; resetTime: number }>();
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests = 100, windowMs = 60000) { // 100 requests per minute
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async checkLimit(identifier: string): Promise<boolean> {
		const now = Date.now();
		const userRequests = this.requests.get(identifier);

		if (!userRequests || now > userRequests.resetTime) {
			// ✅ Reset window
			this.requests.set(identifier, {
				count: 1,
				resetTime: now + this.windowMs
			});
			return true;
		}

		if (userRequests.count >= this.maxRequests) {
			// ✅ Rate limit exceeded
			return false;
		}

		// ✅ Increment counter
		userRequests.count++;
		return true;
	}

	cleanup(): void {
		const now = Date.now();
		for (const [key, value] of this.requests.entries()) {
			if (now > value.resetTime) {
				this.requests.delete(key);
			}
		}
	}
}

export class RateLimitedNode implements INodeType {
	private rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const workflowId = this.getWorkflow().id;
		const nodeId = this.getNode().id;
		const identifier = `${workflowId}:${nodeId}`;

		// ✅ Check rate limit
		if (!await this.rateLimiter.checkLimit(identifier)) {
			throw new Error('Rate limit exceeded - please wait before trying again');
		}

		// ✅ Cleanup old entries periodically
		if (Math.random() < 0.01) { // 1% chance
			this.rateLimiter.cleanup();
		}

		// Continue with normal processing...
		return await this.processItems();
	}
}
```

## 🔐 Environment & Configuration Security

### ✅ Secure Configuration Management
```typescript
// ✅ Environment-based configuration
class SecureConfig {
	static getConfig(key: string, defaultValue?: any): any {
		// ✅ Use environment variables for sensitive config
		const envValue = process.env[`N8N_CUSTOM_${key.toUpperCase()}`];
		
		if (envValue !== undefined) {
			return this.parseValue(envValue);
		}
		
		return defaultValue;
	}

	private static parseValue(value: string): any {
		// ✅ Safe parsing
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}

	static isProduction(): boolean {
		return process.env.NODE_ENV === 'production';
	}

	static getSecureDefaults(): any {
		return {
			maxTimeout: this.isProduction() ? 30000 : 60000,
			maxRetries: this.isProduction() ? 3 : 5,
			logLevel: this.isProduction() ? 'error' : 'debug',
			enableDebug: !this.isProduction(),
		};
	}
}

// ✅ Use in your node
export class SecureNode implements INodeType {
	private config = SecureConfig.getSecureDefaults();

	description: INodeTypeDescription = {
		// ... node description
		properties: [
			{
				displayName: 'Debug Mode',
				name: 'debugMode',
				type: 'boolean',
				default: false,
				// ✅ Hide debug options in production
				displayOptions: {
					hide: {
						'@version': [{ _cnd: { production: true } }]
					}
				}
			}
		]
	};
}
```

## 📊 Security Monitoring & Logging

### ✅ Secure Logging Practices
```typescript
class SecurityLogger {
	static logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void {
		const logEntry = {
			timestamp: new Date().toISOString(),
			event,
			severity,
			details: this.sanitizeLogData(details),
			nodeId: details.nodeId,
			workflowId: details.workflowId,
		};

		// ✅ Log to appropriate destination based on severity
		if (severity === 'high') {
			console.error('SECURITY:', JSON.stringify(logEntry));
			// Send to security monitoring system
		} else {
			console.warn('SECURITY:', JSON.stringify(logEntry));
		}
	}

	private static sanitizeLogData(data: any): any {
		// ✅ Remove sensitive data from logs
		const sanitized = JSON.parse(JSON.stringify(data));
		const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'auth'];
		
		const sanitizeObject = (obj: any): any => {
			if (typeof obj !== 'object' || obj === null) return obj;
			
			for (const [key, value] of Object.entries(obj)) {
				if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
					obj[key] = '***REDACTED***';
				} else if (typeof value === 'object') {
					sanitizeObject(value);
				}
			}
			return obj;
		};

		return sanitizeObject(sanitized);
	}
}

// ✅ Use in your nodes
export class MonitoredNode implements INodeType {
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const nodeId = this.getNode().id;
		const workflowId = this.getWorkflow().id;

		try {
			// ✅ Log security-relevant events
			SecurityLogger.logSecurityEvent('node_execution_start', {
				nodeId,
				workflowId,
				itemCount: this.getInputData().length,
			}, 'low');

			const result = await this.processItems();

			SecurityLogger.logSecurityEvent('node_execution_success', {
				nodeId,
				workflowId,
				processedCount: result[0].length,
			}, 'low');

			return result;

		} catch (error) {
			// ✅ Log security failures
			SecurityLogger.logSecurityEvent('node_execution_error', {
				nodeId,
				workflowId,
				error: error.message,
			}, 'medium');

			throw error;
		}
	}
}
```

## 🎯 Security Checklist

### Pre-Publishing Security Review
- [ ] **No hardcoded secrets** in code or configuration
- [ ] **All inputs validated** and sanitized
- [ ] **SQL injection prevention** with parameterized queries  
- [ ] **XSS prevention** in any HTML output
- [ ] **SSRF prevention** for HTTP requests
- [ ] **Rate limiting** implemented where appropriate
- [ ] **Error messages** don't expose sensitive information
- [ ] **Personal data** is handled according to privacy laws
- [ ] **Logging** doesn't include sensitive data
- [ ] **Dependencies** are up-to-date and secure
- [ ] **HTTPS only** for all external communications
- [ ] **Input size limits** to prevent DoS attacks
- [ ] **Output sanitization** removes internal fields
- [ ] **Credential system** used properly
- [ ] **Security headers** included in HTTP requests

### Runtime Security Monitoring
```typescript
// ✅ Add to your package.json
{
  "scripts": {
    "security-audit": "npm audit --audit-level moderate",
    "dependency-check": "npm ls --depth=0",
    "security-test": "npm run test -- --grep security"
  }
}
```

## 🚀 Security in Production

### ✅ Production Hardening
```bash
# Environment variables for production
N8N_CUSTOM_MAX_TIMEOUT=30000
N8N_CUSTOM_RATE_LIMIT=100
N8N_CUSTOM_ENABLE_DEBUG=false
N8N_CUSTOM_LOG_LEVEL=error
N8N_CUSTOM_DISABLE_TELEMETRY=true

# Docker security
docker run \
  --read-only \
  --no-new-privileges \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  your-n8n-image
```

### Continuous Security
1. **Regular Updates** - Keep dependencies current
2. **Security Audits** - Regular npm audit runs
3. **Penetration Testing** - Test for vulnerabilities
4. **Log Monitoring** - Watch for security events
5. **Incident Response** - Plan for security issues

---

## 🛡️ Remember

**Security is not optional** - it's a fundamental requirement for n8n custom nodes. Users trust you with their data and workflows. Always err on the side of caution, validate everything, and never expose sensitive information.

When in doubt, ask yourself: "Could this be exploited to harm users or expose their data?" If yes, find a more secure approach.

🎯 **Security First, Features Second**