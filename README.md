# Ken's Custom n8n Nodes Template

Hey! I'm Ken Kai, and I build AI stuff. I got tired of n8n's limitations, so I built some pretty advanced custom nodes. But more importantly, **I created this template so YOU can build whatever n8n nodes you want - even if you've never done it before.**

## 🤖 The Magic: Use This With Claude

Here's the secret sauce: **Ask Claude to read the docs in this repo and help you build nodes.** 

Just say:
> "Hey Claude, read the documentation in the `/docs` folder and help me create a custom n8n node that connects to [whatever API/service you want]"

Claude will read all my guides and help you build professional-quality nodes. It's like having me as your coding buddy.

## 🎯 What This Actually Is

- **Complete template** for building custom n8n nodes
- **8 comprehensive guides** that teach you everything (in `/docs`)
- **Real patterns** from the complex nodes I've built in production
- **Security practices** so you don't accidentally break things
- **LLM-optimized** - designed for Claude to read and understand

## 🚀 Installation (For Complete Beginners)

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

## 🧠 How to Actually Use This

### The Easy Way (Recommended)
1. **Ask Claude for help** - seriously, this is the fastest way
2. **Tell Claude exactly what you want**: 
   - "Help me connect to Stripe's API"  
   - "Create a node that processes CSV files"
   - "Build something that sends Discord messages"
   - "Make a node that calls OpenAI's API"

### The Manual Way
1. **Read `/docs/capabilities-and-limitations.md` first** - learn what's possible
2. **Follow `/docs/node-development-guide.md`** - step by step instructions
3. **Use `/docs/testing-and-debugging.md`** when things don't work

## 📚 What's in the /docs Folder

I wrote 8 detailed guides based on building real, complex n8n nodes:

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

Based on the nodes I've built, here's what's totally doable:

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

## 🔥 Real Talk: Why I Made This

I built some pretty complex n8n nodes (think AI agents with multiple models, dynamic routing, MCP protocol support). But every time someone asked "how do I build custom nodes?", the existing tutorials were garbage.

So I created this template with:
- **Real patterns** from production nodes
- **Honest limitations** - I tell you what actually works
- **Security practices** - because I've seen people do scary things
- **LLM optimization** - designed for Claude to read and help you

## 🚨 Important Stuff

### This Template IS:
- ✅ A complete foundation for learning n8n development
- ✅ Production-ready patterns and security practices
- ✅ Optimized for AI-assisted development with Claude
- ✅ Based on real, complex nodes I've built

### This Template ISN'T:
- ❌ Ready-to-use business nodes (it's educational)
- ❌ A replacement for n8n's official docs
- ❌ Guaranteed to work in every weird edge case

## 🎯 Quick Start Guide

1. **Clone this repo** (see installation above)
2. **Ask Claude**: "Read the n8n docs in `/docs` and help me build a [whatever] node"
3. **Follow Claude's guidance** - it'll read my patterns and help you
4. **Test locally** using `n8n start --tunnel`
5. **Publish to npm** when ready (use `/docs/publishing-guide.md`)

## 💬 Need Help?

- **Use Claude** - seriously, ask it to read the docs and help you
- **Check `/docs/troubleshooting.md`** for common issues
- **Start simple** - build a basic API connector first
- **Read the limitations guide** - know what's possible before you start

## 🎉 Go Build Cool Stuff

This template gives you everything I wish I had when I started building n8n nodes. The documentation is comprehensive, the patterns are battle-tested, and it's designed to work perfectly with Claude.

**Stop overthinking it. Clone the repo, ask Claude for help, and start building.**

---

**Built by Ken Kai** | [YouTube](https://youtube.com/@kenkaidoesai) | Making AI actually useful since before it was cool

*P.S. - If you build something awesome with this template, let me know! I love seeing what people create.*