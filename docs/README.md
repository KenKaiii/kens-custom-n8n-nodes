# 📚 N8N Node Development Documentation

**Complete guide for developing, testing, and deploying custom N8N nodes**

## 🚀 Getting Started

Choose your path based on what you need:

### 🆕 **New to N8N Node Development?**

### 🧪 **Need to Test Your Nodes?**

Check the **[Troubleshooting Guide](./04-troubleshooting.md)** for solutions to common problems.

See the **[Advanced Node Patterns Guide](./07-advanced-node-patterns.md)** for real-world architecture insights.

## 📖 Documentation Structure

| **[00-your-first-working-node.md](./00-your-first-working-node.md)** | Bulletproof 10-minute guide      | Complete beginners, guaranteed success |
| **[01-setup-guide.md](./01-setup-guide.md)**                         | Complete setup from scratch      | First time setup, new environment      |
| **[02-node-creation-guide.md](./02-node-creation-guide.md)**         | Step-by-step node development    | Creating new custom nodes              |
| **[03-testing-guide.md](./03-testing-guide.md)**                     | Testing and debugging strategies | Validating node functionality          |
| **[04-troubleshooting.md](./04-troubleshooting.md)**                 | Common issues and solutions      | When things go wrong                   |
| **[05-claude-assistant-guide.md](./05-claude-assistant-guide.md)**   | AI assistant response templates  | For Claude/LLM interactions            |
| **[06-ai-agent-tools.md](./06-ai-agent-tools.md)**                   | AI agent and tool integration    | Building AI-powered nodes              |
| **[07-advanced-node-patterns.md](./07-advanced-node-patterns.md)**   | Complex architecture patterns    | Sophisticated node development         |

## ⚡ Quick Start Checklist

- [ ] **Prerequisites**: Node.js 20.18+, npm 10+, git
- [ ] **Clone/Setup**: Get the template and install dependencies
- [ ] **Build**: Run `npm run build` successfully
- [ ] **Environment**: Set `N8N_CUSTOM_EXTENSIONS` variable
- [ ] **Test**: Start n8n and verify nodes appear

- [ ] **Develop**: Create your first custom node
- [ ] **Deploy**: Package for production use

## 🎯 What's Included

### **Example Nodes (Ready to Use)**

- **Super Code**: Advanced JavaScript/Python execution with 34+ libraries
- **Data Transformer**: Data manipulation and validation utilities
- **UUID Generator**: Unique identifier generation
- **QR Code Generator**: QR code creation and processing

### **Development Tools**

- TypeScript configuration optimized for n8n
- Build system with automatic icon processing
- ESLint configuration for code quality
- Testing framework setup
- Complete setup and development guides
- Troubleshooting and debugging help
- Best practices and examples

## 🚦 Common Workflows

### **Creating a New Node**

```bash
# 1. Create node directory
mkdir nodes/MyNewNode
cd nodes/MyNewNode

# 2. Create node file (see Node Creation Guide)
# MyNewNode.node.ts

# 3. Update package.json
# Add to n8n.nodes array

# 4. Build and test
npm run build
N8N_CUSTOM_EXTENSIONS=/path/to/dist n8n start --tunnel
```

### **Debugging Issues**

```bash
# 1. Check basics
node --version  # 20.18+
npm run build   # No errors

ls -la dist/    # Files exist

# 2. Verify environment
echo $N8N_CUSTOM_EXTENSIONS
ls -la $N8N_CUSTOM_EXTENSIONS

# 3. Check n8n logs
# Look for loading errors or exceptions
```

### **Testing Workflow**

```bash
# 1. Create test workflow in n8n
# Manual Trigger → Your Node → Set Node

# 2. Use test data

# Simple JSON objects for initial testing

# 3. Add debug logging
# console.log() statements in your node

# 4. Verify output

# Check results in Set node
```

## 🎓 Learning Path

### **Beginner** (New to N8N Development)

1. Read [Setup Guide](./01-setup-guide.md) completely
2. Follow [Node Creation Guide](./02-node-creation-guide.md) to create simple node
3. Use [Testing Guide](./03-testing-guide.md) to validate your node
4. Reference [Troubleshooting](./04-troubleshooting.md) when issues arise

### **Intermediate** (Familiar with N8N)

1. Examine existing nodes in `/nodes/` directory
2. Modify existin nodes to understand structure
3. Implement comprehensive testing strategies

### **Advanced** (Experienced Developer)

1. Study SuperCodeNode for complex implementation patterns
2. Implement custom credentials and authentication

3. Create distributable npm packages

## 🔧 Development Environment

### **Recommended Setup**

- **IDE**: Visual Studio Code with TypeScript support
- **Extensions**:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
- **Terminal**: Integrated terminal for npm commands
- **Browser**: Chrome/Firefox for n8n interface testing

### **File Organization**

```
n8n-nodes/
├── docs/              # This documentation
├── nodes/             # Your custom nodes

│   ├── SuperCodeNode/ # Example: Advanced code execution

│   ├── MyNewNode/     # Your custom node
│   └── ...
├── package.json       # Project configuration
└── tsconfig.json      # TypeScript configuration
```

## 🤝 Getting Help

### **First Steps When You Need Help**

1. **Check the guides**: Most issues are covered in documentation
2. **Use diagnostics**: Run the health check commands
3. **Search existing issues**: Look for similar problems

4. **Create minimal reproduction**: Simplify to smallest failing example

- Your setup (Node.js version, OS, n8n version)
- Steps to reproduce the issue
- What you've already tried
- Relevant code snippets

### **Resources**

- **N8N Documentation**: https://docs.n8n.io/
- **N8N Community**: https://community.n8n.io/
- **GitHub Issues**: http<https://docs.n8n.io/>o/n8n/issues
  <https://community.n8n.io/>

## 📋 Best Practices <https://github.com/n8n-io/n8n/issues>

### **Development**
<https://docs.n8n.io/>
- Start with simple f<https://community.n8n.io/>ity gradually
- Use TypeScript for better development experience
- Test early and test often


### **Performance**<https://docs.n8n.io/>
<https://community.n8n.io/>

- Handle large datase<https://github.com/n8n-io/n8n/issues>
- Use async/await for I/O operations
- Monitor memory usage for resource-intensive operations

### **User Experience**

- Include helpful descriptions and examples
- Handle edge cases gracefully

### **Production**

- Validate input data appropriately
- Implement proper logging
- Document your nodes completely

**Ready to build amazing N8N nodes!** 🎉

---

_Last updated: 2025-08-11 | Template version: 1.0.0_
