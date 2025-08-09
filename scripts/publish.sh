#!/bin/bash

# Publishing script for n8n custom nodes

set -e

echo "🚀 n8n Custom Nodes - Publishing Script"
echo "=========================================="
echo ""

# Check if logged into npm
echo "📝 Checking npm login status..."
npm whoami || {
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
}

echo "✅ Logged in as: $(npm whoami)"
echo ""

# Run quality checks
echo "🔍 Running quality checks..."
echo ""

echo "1️⃣ Linting..."
npm run lint || {
    echo "❌ Linting failed. Fix errors with: npm run lintfix"
    exit 1
}

echo "2️⃣ Running tests..."
npm test || {
    echo "❌ Tests failed. Please fix failing tests."
    exit 1
}

echo "3️⃣ Building..."
npm run build || {
    echo "❌ Build failed."
    exit 1
}

echo ""
echo "✅ All quality checks passed!"
echo ""

# Check package contents
echo "📦 Package contents:"
npm pack --dry-run 2>&1 | grep -E "(package size|unpacked size|total files)"
echo ""

# Verify requirements
echo "🔍 Verifying n8n requirements..."
echo ""

# Check package name
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [[ ! "$PACKAGE_NAME" =~ ^n8n-nodes- ]]; then
    echo "❌ Package name must start with 'n8n-nodes-'"
    exit 1
fi
echo "✅ Package name: $PACKAGE_NAME"

# Check keywords
KEYWORDS=$(node -p "require('./package.json').keywords")
if [[ ! "$KEYWORDS" =~ n8n-community-node-package ]]; then
    echo "❌ Keywords must include 'n8n-community-node-package'"
    exit 1
fi
echo "✅ Required keyword present"

# Check n8n section
N8N_SECTION=$(node -p "require('./package.json').n8n")
if [ "$N8N_SECTION" == "undefined" ]; then
    echo "❌ Missing 'n8n' section in package.json"
    exit 1
fi
echo "✅ n8n section present"

echo ""
echo "📋 Current version: $(node -p "require('./package.json').version")"
echo ""

# Ask for confirmation
read -p "🤔 Ready to publish to npm? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    exit 1
fi

# Publish
echo ""
echo "📤 Publishing to npm..."
npm publish

echo ""
echo "🎉 Successfully published!"
echo ""
echo "📋 Next steps:"
echo "1. Check package at: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "2. Wait 30-60 minutes for Community Nodes to update"
echo "3. Test installation in n8n: Settings → Community Nodes → Install"
echo "4. Create GitHub release with changelog"
echo ""
echo "✨ Congratulations! Your nodes are now available to the n8n community!"