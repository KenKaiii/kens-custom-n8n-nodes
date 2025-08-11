# 🚀 N8N Node Development Setup Guide

**Complete A-Z setup from scratch to running n8n server**

## Prerequisites

### System Requirements
- **Node.js**: Version 20.18+ (latest LTS recommended)
- **npm**: Version 10+ (comes with Node.js)
- **Git**: Latest version
- **IDE**: VS Code recommended with TypeScript support

### Install Node.js
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

## Project Setup

### 1. Clone or Create Project
```bash
# Option A: Clone this template
git clone <your-repo-url>
cd n8n-nodes

# Option B: Start fresh
mkdir my-n8n-nodes
cd my-n8n-nodes
npm init -y
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Install n8n globally for testing
npm install -g n8n
```

### 3. Project Structure
```
n8n-nodes/
├── docs/                    # Documentation
├── nodes/                   # Node source files
│   ├── SuperCodeNode/      # Example: Super Code Node
│   ├── DataTransformer/    # Example: Data Transformer
│   └── ...
├── credentials/            # Custom credentials
├── dist/                  # Built output (auto-generated)
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── gulpfile.cjs          # Build icons
```

## Build System

### 1. Build the Project
```bash
# Full build (TypeScript + icons + flatten)
npm run build

# Watch mode for development
npm run dev
```

### 2. Verify Build
```bash
# Check dist directory exists
ls -la dist/

# Verify package.json was copied
ls -la dist/package.json
```

## Running N8N with Custom Nodes

### Method 1: N8N_CUSTOM_EXTENSIONS (Recommended)
```bash
# Set environment variable and run
N8N_CUSTOM_EXTENSIONS=/path/to/your/project/dist n8n start --tunnel

# Example:
N8N_CUSTOM_EXTENSIONS=/Users/username/n8n-nodes/dist n8n start --tunnel
```

### Method 2: Global Installation
```bash
# Install package globally
npm install -g .

# Run n8n
n8n start --tunnel
```

### Method 3: Development Mode
```bash
# Link package locally
npm link

# In another terminal, link n8n to your package
npm link your-package-name

# Run n8n
n8n start --tunnel
```

## Verification

### 1. Check N8N Startup Logs
Look for these success indicators:
```
✅ n8n ready on ::, port 5678
✅ Your custom nodes loading without errors
✅ Tunnel URL provided (if using --tunnel)
```

### 2. Access N8N Interface
- **Local**: http://localhost:5678
- **Tunnel**: Use the provided tunnel URL

### 3. Verify Nodes Appear
1. Create new workflow
2. Click "+" to add node
3. Search for your custom nodes
4. Verify they appear in the node palette

## Environment Variables

### Essential Variables
```bash
# Custom extensions path
export N8N_CUSTOM_EXTENSIONS=/path/to/dist

# Optional: Set data directory
export N8N_USER_FOLDER=/path/to/.n8n

# Optional: Enable task runners (recommended)
export N8N_RUNNERS_ENABLED=true
```

### Add to Shell Profile
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export N8N_CUSTOM_EXTENSIONS=/path/to/your/project/dist' >> ~/.zshrc
source ~/.zshrc
```

## Next Steps

1. **Create Your First Node**: See [02-node-creation-guide.md](./02-node-creation-guide.md)
2. **Test Your Nodes**: See [03-testing-guide.md](./03-testing-guide.md)
3. **Troubleshoot Issues**: See [04-troubleshooting.md](./04-troubleshooting.md)

## 🎯 Complete Working Example

**Copy-paste these commands exactly (replace `/Users/yourname/` with your actual path):**

```bash
# 1. Setup (one-time)
cd /Users/yourname/Documents
git clone <your-repo> n8n-custom-nodes
cd n8n-custom-nodes
npm install

# 2. Build
npm run build

# 3. Set environment variable (choose your OS)
# macOS/Linux:
export N8N_CUSTOM_EXTENSIONS="/Users/yourname/Documents/n8n-custom-nodes/dist"

# Windows (Command Prompt):
set N8N_CUSTOM_EXTENSIONS=C:\Users\yourname\Documents\n8n-custom-nodes\dist

# Windows (PowerShell):
$env:N8N_CUSTOM_EXTENSIONS="C:\Users\yourname\Documents\n8n-custom-nodes\dist"

# 4. Start n8n
n8n start --tunnel

# 5. Verify (should see your custom nodes in browser)
# Open the tunnel URL provided in logs
```

**Success indicators:**
```
✅ n8n ready on ::, port 5678
✅ Tunnel URL: https://xxxxx.hooks.n8n.cloud
✅ No loading errors in startup logs
✅ Custom nodes appear in node palette
```

## Quick Start Checklist

- [ ] Node.js 20.18+ installed
- [ ] Project cloned/created
- [ ] `npm install` completed
- [ ] `npm run build` successful
- [ ] Environment variable set correctly
- [ ] N8N starts without errors
- [ ] Custom nodes visible in interface

**Ready to create your first custom node!** 🎉