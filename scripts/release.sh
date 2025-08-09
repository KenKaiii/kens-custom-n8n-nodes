#!/bin/bash

# Release script for n8n custom nodes

set -e

echo "🚀 n8n Custom Nodes Release Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 Current version: $CURRENT_VERSION"

# Ask for new version
echo ""
read -p "📝 Enter new version (or press enter to keep current): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION=$CURRENT_VERSION
else
    # Update package.json with new version
    npm version $NEW_VERSION --no-git-tag-version
    echo "✅ Updated package.json to version $NEW_VERSION"
fi

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -f *.tgz

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run tests
echo ""
echo "🧪 Running tests..."
npm test || {
    echo "❌ Tests failed. Please fix the issues before releasing."
    exit 1
}

# Run linter
echo ""
echo "🔍 Running linter..."
npm run lint || {
    echo "❌ Linting failed. Run 'npm run lintfix' to fix issues."
    exit 1
}

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

# Create package
echo ""
echo "📦 Creating package..."
npm pack

# Get package filename
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_FILE="$PACKAGE_NAME-$NEW_VERSION.tgz"

echo ""
echo "✅ Package created: $PACKAGE_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Test the package locally:"
echo "   cd ~/.n8n/custom && npm install /path/to/$PACKAGE_FILE"
echo ""
echo "2. Commit and tag the release:"
echo "   git add package.json package-lock.json"
echo "   git commit -m \"Release v$NEW_VERSION\""
echo "   git tag v$NEW_VERSION"
echo "   git push origin main --tags"
echo ""
echo "3. Publish to npm:"
echo "   npm publish"
echo ""
echo "4. Create GitHub release:"
echo "   - Go to your GitHub repository releases page"
echo "   - Click 'Create a new release'"
echo "   - Select tag v$NEW_VERSION"
echo "   - Upload $PACKAGE_FILE"
echo ""
echo "🎉 Release preparation complete!"