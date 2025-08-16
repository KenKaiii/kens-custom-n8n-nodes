#!/usr/bin/env node

/**
 * SuperCode Node Environment Setup
 * Detects Node.js version and selects appropriate bundle for compatibility
 */

/* eslint-env node */

const fs = require('fs');
const path = require('path');

function setupEnvironment() {
	const nodeVersion = process.version;
	const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

	console.log(`[SuperCode] 🔍 Detected Node.js ${nodeVersion} (major: ${majorVersion})`);

	// Define bundle mapping
	let bundleFile;
	let bundleDescription;

	if (majorVersion >= 20) {
		bundleFile = 'SuperCodeNode.node.v20.bundled.js';
		bundleDescription = 'Modern Node.js 20+ optimized bundle';
	} else if (majorVersion >= 18) {
		bundleFile = 'SuperCodeNode.node.v18.bundled.js';
		bundleDescription = 'Node.js 18 compatible bundle';
	} else if (majorVersion >= 16) {
		bundleFile = 'SuperCodeNode.node.v16.bundled.js';
		bundleDescription = 'Node.js 16 compatible bundle';
	} else {
		console.warn(`[SuperCode] ⚠️  Node.js ${nodeVersion} is not officially supported`);
		console.warn(`[SuperCode] ⚠️  Minimum required: Node.js 16.0.0`);
		console.warn(`[SuperCode] ⚠️  Using fallback bundle - functionality may be limited`);
		bundleFile = 'SuperCodeNode.node.v16.bundled.js';
		bundleDescription = 'Fallback bundle for unsupported Node.js version';
	}

	// Define paths
	const srcPath = path.join(__dirname, '..', 'dist', bundleFile);
	const destPath = path.join(__dirname, '..', 'dist', 'SuperCodeNode.node.bundled.js');
	const toolSrcPath = path.join(
		__dirname,
		'..',
		'dist',
		bundleFile.replace('SuperCodeNode', 'SuperCodeTool'),
	);
	const toolDestPath = path.join(__dirname, '..', 'dist', 'SuperCodeTool.node.bundled.js');

	console.log(`[SuperCode] 🎯 Selected: ${bundleDescription}`);

	// Setup SuperCodeNode bundle
	if (fs.existsSync(srcPath)) {
		try {
			fs.copyFileSync(srcPath, destPath);
			console.log(`[SuperCode] ✅ SuperCodeNode bundle activated: ${bundleFile}`);
		} catch (error) {
			console.error(`[SuperCode] ❌ Failed to copy SuperCodeNode bundle: ${error.message}`);
			process.exit(1);
		}
	} else {
		console.error(`[SuperCode] ❌ Bundle not found: ${bundleFile}`);
		console.error(`[SuperCode] 💡 Available bundles:`);

		// List available bundles
		const distDir = path.join(__dirname, '..', 'dist');
		try {
			const files = fs.readdirSync(distDir);
			const bundles = files.filter((f) => f.includes('.bundled.js') && f.includes('.v'));
			bundles.forEach((bundle) => console.error(`[SuperCode]    - ${bundle}`));
		} catch (error) {
			console.error(`[SuperCode] Could not list available bundles: ${error.message}`);
		}

		// Try to use default bundle as fallback
		const defaultBundle = path.join(distDir, 'SuperCodeNode.node.bundled.js');
		if (fs.existsSync(defaultBundle)) {
			console.warn(`[SuperCode] ⚠️  Using existing default bundle as fallback`);
		} else {
			console.error(`[SuperCode] ❌ No fallback bundle available`);
			process.exit(1);
		}
	}

	// Setup SuperCodeTool bundle (if exists)
	if (fs.existsSync(toolSrcPath)) {
		try {
			fs.copyFileSync(toolSrcPath, toolDestPath);
			console.log(`[SuperCode] ✅ SuperCodeTool bundle activated`);
		} catch (error) {
			console.warn(`[SuperCode] ⚠️  Could not setup SuperCodeTool bundle: ${error.message}`);
		}
	}

	// Verify bundle size
	try {
		const stats = fs.statSync(destPath);
		const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
		console.log(`[SuperCode] 📊 Bundle size: ${sizeMB}MB`);

		if (stats.size < 1024 * 1024) {
			// Less than 1MB
			console.warn(`[SuperCode] ⚠️  Bundle seems unusually small (${sizeMB}MB)`);
			console.warn(`[SuperCode] ⚠️  Expected: ~8-9MB for full library bundle`);
		}
	} catch (error) {
		console.warn(`[SuperCode] ⚠️  Could not verify bundle size: ${error.message}`);
	}

	console.log(`[SuperCode] 🎉 Environment setup complete!`);
	console.log(`[SuperCode] 📚 42+ JavaScript libraries available globally`);
	console.log(`[SuperCode] 🔗 Libraries: lodash, axios, dayjs, joi, crypto, xlsx, yaml, etc.`);
	console.log(`[SuperCode] 🚀 Ready for n8n workflows!`);
}

// Run setup
try {
	setupEnvironment();
} catch (error) {
	console.error(`[SuperCode] ❌ Environment setup failed: ${error.message}`);
	console.error(error.stack);
	process.exit(1);
}
