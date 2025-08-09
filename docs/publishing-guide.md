# Publishing n8n Custom Nodes to npm (2025)

Complete guide for publishing your custom n8n nodes to npm and the n8n community.

## 📋 Pre-Publishing Checklist

### ✅ Essential Requirements
- [ ] **Package name** follows n8n convention: `n8n-nodes-[your-name]`
- [ ] **Version** follows semantic versioning (1.0.0, 1.0.1, etc.)
- [ ] **Keywords** include `"n8n-community-node-package"`
- [ ] **License** specified (MIT recommended)
- [ ] **Repository** URL included
- [ ] **README.md** with clear installation and usage instructions
- [ ] **All nodes build** successfully with `npm run build`
- [ ] **Tests pass** with `npm test`
- [ ] **Linting passes** with `npm run lint`

### ✅ Node Quality Standards
- [ ] **Error handling** implemented for all failure scenarios
- [ ] **Input validation** for all user parameters
- [ ] **Proper TypeScript types** throughout codebase
- [ ] **Meaningful error messages** for debugging
- [ ] **Performance tested** with reasonable datasets
- [ ] **Security review** completed (no secrets exposed)
- [ ] **Icons included** for all nodes (SVG format)

## 🏗️ Package Configuration

### package.json Requirements
```json
{
  "name": "n8n-nodes-your-integration",
  "version": "1.0.0",
  "description": "Custom n8n nodes for YourService integration",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "yourservice",
    "integration"
  ],
  "license": "MIT",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/n8n-nodes-your-integration.git"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "main": "index.js",
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/YourServiceApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/YourService/YourService.node.js"
    ]
  },
  "scripts": {
    "build": "rimraf dist && tsc && gulp build:icons",
    "dev": "tsc --watch",
    "lint": "eslint nodes credentials package.json",
    "lintfix": "eslint nodes credentials package.json --fix",
    "test": "jest",
    "prepublishOnly": "npm run build && npm run lint && npm run test"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@typescript-eslint/parser": "~8.32.0",
    "eslint": "^8.57.0",
    "eslint-plugin-n8n-nodes-base": "^1.16.3",
    "gulp": "^5.0.0",
    "jest": "^29.0.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.8.2"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

### Required Files Structure
```
your-package/
├── dist/                    # Built files (auto-generated)
├── nodes/                   # Source nodes
│   └── YourService/
│       ├── YourService.node.ts
│       └── icon.svg
├── credentials/             # Authentication
│   └── YourServiceApi.credentials.ts
├── package.json            # Package configuration
├── tsconfig.json          # TypeScript config
├── gulpfile.js           # Build system
├── index.js              # Entry point
├── README.md             # Documentation
├── LICENSE.md            # License
└── .npmignore           # Files to exclude from npm
```

## 🚀 Publishing Process

### Step 1: npm Account Setup
```bash
# Create npm account (if you don't have one)
# Go to https://www.npmjs.com/signup

# Login to npm
npm login

# Verify login
npm whoami
```

### Step 2: Final Preparation
```bash
# 1. Clean build
npm run build

# 2. Run all tests
npm test

# 3. Run linting
npm run lint

# 4. Check package contents
npm pack --dry-run

# 5. Test local installation
npm install -g ./
```

### Step 3: Version Management
```bash
# For patch releases (bug fixes): 1.0.0 → 1.0.1
npm version patch

# For minor releases (new features): 1.0.0 → 1.1.0
npm version minor

# For major releases (breaking changes): 1.0.0 → 2.0.0
npm version major

# Manual version update
npm version 1.2.3
```

### Step 4: Publish to npm
```bash
# First time publishing
npm publish

# For scoped packages (if using @yourname/package-name)
npm publish --access public

# Publishing beta versions
npm version 1.1.0-beta.1
npm publish --tag beta

# Publishing with specific tag
npm publish --tag latest
```

## 🔄 Post-Publishing Steps

### Verify Publication
```bash
# Check if package is available
npm view n8n-nodes-your-integration

# Test installation
npm install n8n-nodes-your-integration

# Check n8n community registry
# Visit: https://www.npmjs.com/search?q=n8n-community-node-package
```

### Update Documentation
```markdown
<!-- README.md -->
## Installation

In your n8n instance:

1. Go to **Settings > Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-your-integration`
4. Click **Install**

## Usage

After installation, you'll find the new nodes in the node palette:
- **YourService** - Connect to YourService API
```

## 📊 Release Management

### Semantic Versioning Strategy
```
MAJOR.MINOR.PATCH

1.0.0 - Initial release
1.0.1 - Bug fix release
1.1.0 - New feature release
2.0.0 - Breaking changes
```

### Release Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-node

# 2. Develop and test
npm run dev
npm test

# 3. Update version and publish
npm version minor
git push origin main --tags
npm publish

# 4. Create GitHub release
gh release create v1.1.0 --notes "Added new YourService integration"
```

### Automated Publishing with GitHub Actions
```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        registry-url: 'https://registry.npmjs.org'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Test
      run: npm test
      
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🎯 n8n Community Guidelines

### Node Naming Conventions
```typescript
// ✅ GOOD
displayName: 'Stripe'           // Service name
name: 'stripe'                  // lowercase, no spaces
package: 'n8n-nodes-stripe'     // descriptive

// ❌ BAD
displayName: 'stripe_integration'
name: 'StripeAPI'
package: 'my-n8n-nodes'
```

### Icon Requirements
```typescript
// Icons must be SVG format, 60x60px recommended
icon: 'file:stripe.svg'

// Place in same directory as node file:
// nodes/Stripe/stripe.svg
```

### Documentation Standards
```markdown
## Node Documentation Requirements

### README.md must include:
- Clear installation instructions
- Usage examples
- Authentication setup
- Supported operations
- Troubleshooting section

### Each node should have:
- Descriptive display name
- Clear operation descriptions
- Parameter validation
- Error handling examples
```

## 🐛 Common Publishing Issues

### Issue: Package Name Taken
```bash
# Error: 403 Forbidden - PUT https://registry.npmjs.org/n8n-nodes-myservice
# Package name already exists

# Solutions:
1. Choose different name: n8n-nodes-myservice-pro
2. Use scoped package: @yourname/n8n-nodes-myservice
3. Contact existing owner if abandoned
```

### Issue: Build Failures
```bash
# Error: TypeScript compilation errors

# Check:
1. All imports resolved correctly
2. n8n-workflow types available
3. tsconfig.json configured properly
4. No circular dependencies
```

### Issue: Missing Files in Package
```bash
# Error: Cannot find module './dist/nodes/...'

# Check .npmignore:
# Don't ignore dist/ folder
!dist/

# Verify files array in package.json:
"files": [
  "dist",
  "README.md",
  "LICENSE.md"
]
```

### Issue: n8n Can't Load Nodes
```bash
# Node doesn't appear in n8n UI after installation

# Verify package.json n8n section:
"n8n": {
  "n8nNodesApiVersion": 1,
  "nodes": [
    "dist/nodes/YourNode/YourNode.node.js"
  ]
}

# Check file paths match exactly
# Restart n8n after installation
```

## 🔒 Security Best Practices

### Before Publishing
```typescript
// ✅ SECURE - Use credential system
const credentials = await this.getCredentials('yourServiceApi');
const apiKey = credentials.apiKey;

// ❌ INSECURE - Don't hardcode secrets
const apiKey = 'sk_live_abc123...';

// ✅ SECURE - Validate inputs
const userInput = this.getNodeParameter('userInput', itemIndex) as string;
if (!userInput || userInput.trim() === '') {
  throw new Error('User input is required');
}

// ✅ SECURE - Sanitize outputs
const result = {
  id: response.id,
  name: response.name,
  // Don't expose sensitive data
};
```

### .npmignore Configuration
```bash
# .npmignore - Don't publish these files
.env
.env.*
*.log
coverage/
.nyc_output/
test/
tests/
*.test.js
*.spec.js
.github/
.vscode/
node_modules/
src/          # Only publish dist/
tsconfig.json
gulpfile.js
```

## 📈 Maintenance and Updates

### Regular Maintenance Tasks
```bash
# 1. Update dependencies (monthly)
npm update
npm audit fix

# 2. Check for n8n API changes
npm info n8n-workflow latest

# 3. Test with latest n8n version
npm install -g n8n@latest
n8n start --tunnel

# 4. Monitor usage and issues
npm view n8n-nodes-your-integration downloads
```

### Deprecation Process
```bash
# Mark version as deprecated
npm deprecate n8n-nodes-old-package@1.0.0 "Package renamed to n8n-nodes-new-package"

# Unpublish recent version (within 24 hours only)
npm unpublish n8n-nodes-package@1.0.1
```

## 📊 Success Metrics

### Track Your Package Success
```bash
# Download statistics
npm view n8n-nodes-your-integration downloads

# Package information
npm view n8n-nodes-your-integration

# Dependent packages
npm view n8n-nodes-your-integration dependents
```

### Community Engagement
- **GitHub Issues** - Respond to user problems
- **Documentation** - Keep README updated
- **Examples** - Provide workflow templates
- **Changelog** - Document all changes
- **Backward Compatibility** - Maintain when possible

---

## 🎉 Publishing Checklist

Final checklist before `npm publish`:

- [ ] **Package name** is unique and follows conventions
- [ ] **Version** incremented appropriately
- [ ] **Build** completes without errors
- [ ] **Tests** pass completely
- [ ] **Linting** passes without warnings
- [ ] **README** is complete and accurate
- [ ] **Icons** are included and properly referenced
- [ ] **No secrets** exposed in code
- [ ] **Error handling** implemented
- [ ] **Local testing** completed successfully
- [ ] **npm whoami** shows correct account

```bash
# Final command
npm publish
```

🎊 **Congratulations!** Your n8n custom nodes are now available to the community!

Remember to monitor issues, respond to users, and keep your package updated with the latest n8n features and security practices.