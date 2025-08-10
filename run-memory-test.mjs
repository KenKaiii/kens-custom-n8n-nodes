// Wrapper to run the memory test as an ES module to support top-level await
import { execSync } from 'child_process';
import fs from 'fs';

// Read the test file and wrap it in an async IIFE
const testCode = fs.readFileSync('./COMPREHENSIVE-MEMORY-PERFORMANCE-TEST.js', 'utf8');

// Wrap in async IIFE for top-level await support
const wrappedCode = `
(async () => {
  ${testCode}
})().then(result => {
  console.log('\\n🎉 Test completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\\n❌ Test failed:', error.message);
  process.exit(1);
});
`;

fs.writeFileSync('./temp-memory-test.js', wrappedCode);

try {
  execSync('node temp-memory-test.js', { stdio: 'inherit' });
} finally {
  // Clean up temp file
  if (fs.existsSync('./temp-memory-test.js')) {
    fs.unlinkSync('./temp-memory-test.js');
  }
}