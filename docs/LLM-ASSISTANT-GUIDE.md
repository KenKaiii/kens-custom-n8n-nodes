# LLM Assistant Guide for n8n Node Development

**🤖 This guide is specifically designed for AI assistants helping users build n8n custom nodes.**

## 🎯 How to Use This Documentation

### 1. **Always Start Here**
When a user asks for help building n8n nodes:
1. **Read `capabilities-and-limitations.md` FIRST** - Understand boundaries
2. **Identify the node type** from user requirements
3. **Choose appropriate patterns** from `node-development-guide.md`
4. **Apply security practices** from `security-best-practices.md`

### 2. **Quick Decision Tree**
```
User Request → What type of node?
├── API Integration → Use HTTP patterns + credentials
├── Data Processing → Use transformation patterns
├── AI/LLM Integration → Use AI patterns + multiple inputs  
├── Database Operations → Use connection patterns + security
└── Complex Logic → Use advanced patterns + state management
```

## 🔍 Key Patterns for Code Generation

### **✅ ALWAYS Include These in Generated Code**
```typescript
// 1. Proper imports
import type {
    IExecuteFunctions,
    INodeExecutionData, 
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

// 2. Error handling with continueOnFail support
try {
    const result = await processItem(item);
    returnData.push(result);
} catch (error) {
    if (this.continueOnFail()) {
        returnData.push({
            json: { error: error.message },
        });
    } else {
        throw error;
    }
}

// 3. Input validation
const requiredParam = this.getNodeParameter('requiredParam', itemIndex) as string;
if (!requiredParam || requiredParam.trim() === '') {
    throw new Error('Required parameter is missing');
}

// 4. Proper return structure
return [returnData];
```

### **❌ NEVER Include These in Generated Code**
```typescript
// ❌ File system operations
import * as fs from 'fs';
fs.writeFileSync('/path/to/file', data);

// ❌ System commands  
import { exec } from 'child_process';
exec('rm -rf /');

// ❌ Hardcoded credentials
const apiKey = 'sk_live_abc123...';

// ❌ Blocking operations
while (true) { /* infinite loop */ }
```

## 🛠️ Code Generation Templates

### **Basic API Node Template**
```typescript
export class {{NodeName}} implements INodeType {
    description: INodeTypeDescription = {
        displayName: '{{Display Name}}',
        name: '{{nodeName}}',
        icon: 'file:{{icon}}.svg',
        group: ['{{group}}'],
        version: 1,
        description: '{{description}}',
        defaults: { name: '{{Display Name}}' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [{
            name: '{{credentialType}}',
            required: true,
        }],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation', 
                type: 'options',
                options: [
                    { name: '{{Operation 1}}', value: '{{operation1}}' },
                    { name: '{{Operation 2}}', value: '{{operation2}}' },
                ],
                default: '{{operation1}}',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const operation = this.getNodeParameter('operation', itemIndex) as string;
                
                const requestOptions = {
                    method: 'GET',
                    url: `https://api.example.com/${operation}`,
                    json: true,
                };

                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    '{{credentialType}}',
                    requestOptions,
                );

                returnData.push({ json: response });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }
}
```

## 🔒 Security Checklist for Generated Code

Before providing code to users, verify:
- [ ] **No hardcoded credentials** - Uses n8n credential system
- [ ] **Input validation** - All user inputs are validated
- [ ] **Error handling** - Supports continueOnFail() pattern  
- [ ] **No file system access** - Uses only safe operations
- [ ] **No system commands** - Avoids exec, spawn, etc.
- [ ] **Proper TypeScript types** - Uses n8n's type system
- [ ] **Rate limiting considered** - For API integrations
- [ ] **Memory efficient** - Processes items in batches if needed

## 📚 Documentation Cross-Reference

### For Different Node Types:
- **API Nodes**: `node-development-guide.md` → HTTP Integration Node
- **Data Nodes**: `node-development-guide.md` → Data Transformation Node  
- **AI Nodes**: `advanced-patterns.md` → Multi-Input AI Node
- **Security**: `security-best-practices.md` → All patterns
- **Testing**: `testing-and-debugging.md` → Local development
- **Publishing**: `publishing-guide.md` → npm workflow

### Quick References:
- **What's Possible**: `capabilities-and-limitations.md` → Green sections
- **What's Forbidden**: `capabilities-and-limitations.md` → Red sections
- **Common Issues**: `troubleshooting.md` → All sections
- **Advanced Patterns**: `advanced-patterns.md` → All patterns

## 🎯 User Interaction Guidelines

### **When User Asks for Help:**
1. **Clarify requirements**: What API? What data? What operations?
2. **Check feasibility**: Reference capabilities guide
3. **Choose pattern**: Select appropriate template
4. **Generate code**: Use security-compliant patterns
5. **Explain testing**: Reference testing guide
6. **Guide deployment**: Reference publishing guide

### **Example Response Flow:**
```
User: "Help me create a node for Stripe API"

Assistant Response:
1. ✅ "Great choice! Stripe API is perfect for n8n nodes."
2. 🔍 "I'll create an HTTP integration node with authentication."
3. 📋 "Based on the capabilities guide, this will support:"
   - REST API calls with authentication
   - Webhook processing
   - Error handling and retries
4. 🔧 "Here's the code..." [Generate using template]
5. 🧪 "To test this locally..." [Reference testing guide]
6. 🚀 "When ready to publish..." [Reference publishing guide]
```

## ⚠️ Important Reminders

### **Security First**
- Every generated node must be secure by default
- Reference security guide for all patterns
- Never compromise on input validation

### **n8n Conventions**  
- Follow n8n's naming conventions
- Use n8n's error handling patterns
- Support continueOnFail() in all nodes

### **User Experience**
- Provide clear, actionable code
- Explain why certain patterns are used
- Reference relevant documentation sections

---

**🎯 Goal: Generate secure, functional, well-documented n8n nodes that users can immediately use and deploy with confidence.**