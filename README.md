# n8n Custom Nodes Educational Template

A complete educational template and reference guide for creating custom n8n nodes in 2025. This repository provides everything you need to understand, develop, test, and publish professional-quality n8n custom nodes.

## 🎯 Perfect For

- **Learning n8n node development** from basic to advanced patterns
- **LLM-assisted development** - Ask Claude to read these docs and help you build nodes
- **Production-quality nodes** with security, testing, and performance best practices
- **Understanding n8n limitations** and what's possible vs. impossible

## 📚 Complete Documentation

This template includes comprehensive guides in the `/docs` folder:

### 🚀 Getting Started
- **[capabilities-and-limitations.md](./docs/capabilities-and-limitations.md)** - What IS and ISN'T possible with n8n nodes
- **[node-development-guide.md](./docs/node-development-guide.md)** - Complete patterns from basic to advanced nodes
- **[testing-and-debugging.md](./docs/testing-and-debugging.md)** - Local testing with `n8n start`, debugging, and logs

### 📦 Publishing & Production
- **[publishing-guide.md](./docs/publishing-guide.md)** - Publishing to npm and n8n community
- **[security-best-practices.md](./docs/security-best-practices.md)** - Secure development practices
- **[troubleshooting.md](./docs/troubleshooting.md)** - Common issues and solutions

### 🏗️ Advanced Topics  
- **[advanced-patterns.md](./docs/advanced-patterns.md)** - Multi-input nodes, AI routing, protocols, state management

## 🚀 Quick Start

1. **Clone this template:**
   ```bash
   git clone https://github.com/KenKaiii/kens-custom-n8n-nodes.git my-n8n-nodes
   cd my-n8n-nodes
   npm install
   ```

2. **Start developing:**
   ```bash
   # Create your first node
   mkdir nodes/MyNode
   # Add MyNode.node.ts and icon.svg
   
   # Test locally with n8n
   npm run build
   n8n start --tunnel
   ```

3. **Use with Claude:**
   ```
   "Please read the docs in this n8n template and help me create a custom node that connects to the Stripe API"
   ```

## 📋 What's Included

### ✅ Complete Foundation
- **Package structure** - Proper n8n community node package setup
- **TypeScript configuration** - Strict typing and modern JavaScript features  
- **Build system** - Gulp for icons, TypeScript compilation
- **Scripts** - Development, building, testing, and publishing workflows
- **Documentation** - Comprehensive guides for every aspect

### ✅ Development Tools
- **Local testing** setup with n8n
- **Hot reload** development workflow
- **Debugging** configuration for VS Code
- **Publishing** scripts for npm

### ✅ Real-World Examples
The documentation includes patterns learned from building production nodes:
- Multi-input AI processors (like advanced agent nodes)
- Dynamic routing based on content analysis  
- Protocol implementations (WebSocket, MCP)
- State management with external stores
- Performance optimization techniques

## 🧠 LLM-Powered Development

This template is optimized for AI-assisted development:

```
# Ask Claude to help you:
"Read the n8n documentation in /docs and help me create a node that:
- Connects to the GitHub API
- Handles webhook payloads  
- Transforms issue data
- Includes proper error handling"
```

The docs provide clear boundaries of what's possible, security requirements, and copy-paste ready patterns.

## 🛡️ Built for Production

### Security First
- Input validation and sanitization patterns
- Credential management best practices  
- Rate limiting and DoS protection
- Privacy-compliant data handling

### Performance Optimized
- Connection pooling examples
- Batch processing patterns
- Memory management techniques
- Async/await best practices

### Testing & Quality
- Comprehensive error handling
- Debug logging patterns
- Testing strategies  
- CI/CD workflows

## 🎨 Node Types Covered

The documentation shows how to build:

### 📡 **API Integration Nodes**
- REST API wrappers with authentication
- GraphQL integrations
- Webhook processors
- Rate-limited API clients

### 🔄 **Data Transformation Nodes**  
- JSON processors and validators
- Data formatting and cleaning
- Conditional routing
- Aggregation operations

### 🤖 **AI/LLM Nodes**
- Multi-model AI processors
- Intelligent content routing
- Context-aware processing
- Cost optimization patterns

### 🛠️ **Utility Nodes**
- Protocol implementations  
- State management systems
- Performance monitoring
- Security scanners

## 📊 What Makes This Different

Unlike basic tutorials, this template provides:

- **Real limitations** - Honest about what n8n nodes can't do
- **Security focus** - Every example includes security considerations  
- **Production patterns** - Based on building complex, published nodes
- **LLM-optimized** - Designed for AI assistants to read and understand
- **2025 standards** - Current n8n API, modern TypeScript, latest practices

## 🎓 Learning Path

1. **Read [capabilities-and-limitations.md](./docs/capabilities-and-limitations.md)** - Understand the boundaries
2. **Follow [node-development-guide.md](./docs/node-development-guide.md)** - Build your first node  
3. **Set up [testing-and-debugging.md](./docs/testing-and-debugging.md)** - Local development workflow
4. **Study [security-best-practices.md](./docs/security-best-practices.md)** - Secure development
5. **Explore [advanced-patterns.md](./docs/advanced-patterns.md)** - Complex architectures
6. **Publish with [publishing-guide.md](./docs/publishing-guide.md)** - Share with community

## 🚨 Important Notes

### What This Template IS
- Complete educational resource for n8n node development
- Production-ready patterns and security practices  
- Reference implementation of complex node architectures
- LLM-friendly documentation for AI-assisted development

### What This Template ISN'T  
- A specific business solution (it's educational)
- A replacement for n8n's official documentation
- A guarantee that all patterns work in every environment

## 🤝 Contributing

This template is designed to be:
- Forked and customized for your needs
- Extended with additional patterns
- Improved with community feedback
- Used as a foundation for learning

## 📝 License

MIT - Use this template to build amazing n8n nodes!

## 🎉 Ready to Build?

1. **Fork this repository** 
2. **Read the docs** (especially capabilities and limitations)
3. **Ask Claude for help**: "Help me build a custom n8n node based on this template"
4. **Start coding** your amazing integration

**Happy node building!** 🚀

---

*This template reflects 2025 best practices and is optimized for both human developers and AI assistants. The comprehensive documentation ensures you understand not just how to build nodes, but how to build them securely and efficiently.*