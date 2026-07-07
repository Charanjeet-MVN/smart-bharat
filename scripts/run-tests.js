const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Smart Bharat Test Suite...');

let testCount = 0;
let successCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    console.log(`✅ Test #${testCount} passed: ${message}`);
    successCount++;
  } else {
    console.error(`❌ Test #${testCount} FAILED: ${message}`);
    process.exit(1);
  }
}

// Test 1: Check required environment variables placeholders or variables
console.log('\n--- Checking Config and Environment ---');
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

assert(fs.existsSync(envExamplePath), 'env.example file exists');
assert(fs.existsSync(envPath), '.env file exists');

// Test 2: Check required file paths for 3-page setup
console.log('\n--- Checking File Architecture ---');
const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/ask/page.tsx',
  'app/report/page.tsx',
  'app/wall/page.tsx',
  'app/schemes/page.tsx',
  'lib/supabase.ts',
  'lib/gemini.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  assert(fs.existsSync(filePath), `Required file: ${file} exists`);
});

// Test 3: Check that Clerk and Prisma are deleted
console.log('\n--- Verifying Clerk/Prisma Removal ---');
const deletedFiles = [
  'prisma/schema.prisma',
  'lib/prisma.ts',
  'proxy.ts'
];

deletedFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  assert(!fs.existsSync(filePath), `Deleted file: ${file} is removed`);
});

console.log(`\n🎉 Test Suite finished. ${successCount}/${testCount} tests passed successfully.\n`);
process.exit(0);
