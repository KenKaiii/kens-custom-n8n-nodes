#!/usr/bin/env node

/**
 * Workflow Context Validation Script
 * 
 * This script validates that the SuperCodeNode has been properly updated
 * with n8n workflow context support by inspecting the compiled code.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SuperCode Workflow Context Validation\n');

// Check if the built files exist
const builtFiles = [
  'dist/SuperCodeNode.node.bundled.js',
  'dist/SuperCodeNode.node.v16.bundled.js', 
  'dist/SuperCodeNode.node.v18.bundled.js',
  'dist/SuperCodeNode.node.v20.bundled.js'
];

let validationResults = {
  buildFiles: {},
  contextFeatures: {},
  testFiles: {}
};

console.log('📦 Checking built files...');
builtFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  validationResults.buildFiles[file] = exists;
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check source code for workflow context features
console.log('\n🔗 Checking source code for workflow context features...');
const sourceFile = path.join(__dirname, 'nodes/SuperCodeNode/SuperCodeNode.node.ts');

if (fs.existsSync(sourceFile)) {
  const sourceCode = fs.readFileSync(sourceFile, 'utf8');
  
  const contextFeatures = [
    {
      name: 'getWorkflowDataProxy',
      pattern: /\.\.\.executionContext\.getWorkflowDataProxy\(0\)/,
      description: 'Workflow data proxy with $() function'
    },
    {
      name: '$getNodeParameter',
      pattern: /\$getNodeParameter:\s*executionContext\.getNodeParameter\.bind\(executionContext\)/,
      description: 'Node parameter access function'
    },
    {
      name: '$getWorkflowStaticData',
      pattern: /\$getWorkflowStaticData:\s*executionContext\.getWorkflowStaticData\.bind\(executionContext\)/,
      description: 'Workflow static data access function'
    },
    {
      name: 'helpers',
      pattern: /helpers:\s*executionContext\.helpers/,
      description: 'n8n helpers object with HTTP methods'
    }
  ];

  contextFeatures.forEach(feature => {
    const found = feature.pattern.test(sourceCode);
    validationResults.contextFeatures[feature.name] = found;
    console.log(`  ${found ? '✅' : '❌'} ${feature.name}: ${feature.description}`);
  });
} else {
  console.log('  ❌ Source file not found');
}

// Check test files
console.log('\n🧪 Checking test files...');
const testFiles = [
  'test-cases/test-workflow-context.js',
  'test-cases/test-simple-valid.js'
];

testFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  validationResults.testFiles[file] = exists;
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Summary
console.log('\n📊 Validation Summary:');
const allBuildsExist = Object.values(validationResults.buildFiles).every(exists => exists);
const allContextFeaturesPresent = Object.values(validationResults.contextFeatures).every(present => present);
const allTestFilesExist = Object.values(validationResults.testFiles).every(exists => exists);

console.log(`  Build Files: ${allBuildsExist ? '✅ All present' : '❌ Missing files'}`);
console.log(`  Context Features: ${allContextFeaturesPresent ? '✅ All implemented' : '❌ Missing features'}`);
console.log(`  Test Files: ${allTestFilesExist ? '✅ All present' : '❌ Missing files'}`);

const overallSuccess = allBuildsExist && allContextFeaturesPresent && allTestFilesExist;
console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ SUCCESS - Workflow context integration complete!' : '❌ ISSUES DETECTED'}`);

if (overallSuccess) {
  console.log('\n🚀 Next Steps:');
  console.log('  1. Test in n8n workflow with multiple nodes');
  console.log('  2. Verify $() function accesses previous node data');
  console.log('  3. Test $getNodeParameter() with actual node parameters');
  console.log('  4. Verify helpers.httpRequest() functionality');
}

// Return results for programmatic use
if (require.main === module) {
  process.exit(overallSuccess ? 0 : 1);
}

module.exports = validationResults;