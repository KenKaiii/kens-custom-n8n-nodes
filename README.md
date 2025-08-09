# Custom n8n Nodes Template

**A complete template for building professional n8n custom nodes.** Whether you're learning or building for production, this template provides everything you need to create high-quality, secure n8n nodes.

## 🤖 The Magic: Use This With Claude

Here's the secret sauce: **Ask Claude to read the docs in this repo and help you build nodes.** 

Just say:
> "Hey Claude, read the documentation in the `/docs` folder and help me create a custom n8n node that connects to [whatever API/service you want]"

Claude will read all the guides and help you build professional-quality nodes.

## 🎯 What This Includes

- **Complete template** for building custom n8n nodes
- **8 comprehensive guides** covering everything (in `/docs`)
- **Real patterns** from production-grade nodes
- **Security best practices** and safe development patterns
- **LLM-optimized** - designed for Claude to read and understand

## 🚀 Installation

### Step 1: Get This Template
```bash
# 1. Open your terminal/command prompt
# 2. Go to where you want to create your project
cd Documents

# 3. Copy my template (replace "my-awesome-nodes" with whatever you want)
git clone https://github.com/KenKaiii/kens-custom-n8n-nodes.git my-awesome-nodes

# 4. Go into your new folder  
cd my-awesome-nodes

# 5. Install everything (this might take a minute)
npm install
```

### Step 2: Test It Works
```bash
# This should create some folders and say "Build complete"
npm run build
```

If you see "Build complete - ready for development", you're good to go! 🎉

### Step 3: Get n8n Running Locally
```bash
# Install n8n if you don't have it
npm install -g n8n

# Start n8n (this opens a browser window)
n8n start --tunnel
```

You should see n8n open in your browser at http://localhost:5678

## 🧠 How to Use This

### AI-Assisted Development (Recommended)
1. **Ask Claude for help** - the fastest way to build nodes
2. **Tell Claude exactly what you want**: 
   - "Help me connect to Stripe's API"  
   - "Create a node that processes CSV files"
   - "Build something that sends Discord messages"
   - "Make a node that calls OpenAI's API"

### Manual Development
1. **Read `/docs/capabilities-and-limitations.md` first** - learn what's possible
2. **Follow `/docs/node-development-guide.md`** - step by step instructions
3. **Use `/docs/testing-and-debugging.md`** when things don't work

## 📚 What's in the /docs Folder

8 detailed guides covering all aspects of n8n node development:

| Guide | What It Teaches |
|-------|-----------------|
| **capabilities-and-limitations.md** | What you CAN and CAN'T do with n8n nodes (read this first!) |
| **node-development-guide.md** | How to build nodes from basic to advanced |
| **testing-and-debugging.md** | How to test locally and fix problems |
| **publishing-guide.md** | How to publish your nodes to npm |
| **security-best-practices.md** | How to not accidentally create security holes |
| **troubleshooting.md** | Common problems and how to fix them |
| **advanced-patterns.md** | Complex stuff like multi-input nodes and AI routing |

## 🛠️ What You Can Build

Here's what's possible with n8n custom nodes:

### ✅ **Easy Wins**
- **API connectors** - Connect to any REST API (Stripe, GitHub, etc.)
- **Data transformers** - Clean, format, validate data
- **Notification nodes** - Send emails, Slack messages, webhooks
- **File processors** - Handle CSV, JSON, text files

### ✅ **Advanced Stuff** 
- **AI-powered nodes** - OpenAI, Claude, local models
- **Multi-step workflows** - Complex business logic
- **Real-time processors** - WebSocket connections
- **Smart routing** - Send data different places based on content

### ❌ **Don't Even Try These**
- File system operations (security nightmare)
- System commands (n8n will hate you)
- Long-running background processes (not how n8n works)
- Complex state management (nodes are stateless)

## 🔥 Why This Template Exists

Existing n8n node tutorials often lack depth and real-world patterns. This template provides:
- **Real patterns** from production nodes
- **Honest limitations** - what actually works vs what doesn't
- **Security practices** - prevent common vulnerabilities
- **LLM optimization** - designed for AI-assisted development

## 🚨 Important Notes

### This Template IS:
- ✅ A complete foundation for n8n development
- ✅ Production-ready patterns and security practices
- ✅ Optimized for AI-assisted development with Claude
- ✅ Based on real, complex production nodes

### This Template ISN'T:
- ❌ Ready-to-use business nodes (it's a template)
- ❌ A replacement for n8n's official docs
- ❌ Guaranteed to work in every edge case

## 🎯 Quick Start Guide

1. **Clone this repo** (see installation above)
2. **Ask Claude**: "Read the n8n docs in `/docs` and help me build a [whatever] node"
3. **Follow Claude's guidance** - it'll read the patterns and help you
4. **Test locally** using `n8n start --tunnel`
5. **Publish to npm** when ready (use `/docs/publishing-guide.md`)

## 💬 Need Help?

- **Use Claude** - ask it to read the docs and help you
- **Check `/docs/troubleshooting.md`** for common issues
- **Start simple** - build a basic API connector first
- **Read the limitations guide** - know what's possible before you start

## 🎉 Get Started

This template provides comprehensive documentation, battle-tested patterns, and is designed to work perfectly with Claude for AI-assisted development.

**Clone the repo, ask Claude for help, and start building.**

---

**Created by Ken Kai** | [YouTube](https://youtube.com/@kenkaidoesai)

*If you build something awesome with this template, share it!*