/**
 * Test script for drive-delivery with OAuth2
 * Verifies configuration and uploads a test file
 */

const fs = require('fs');
const path = require('path');
const { uploadToDrive } = require('./scripts/upload.js');

async function runTest() {
  console.log('🧪 Testing drive-delivery (OAuth2)...\n');

  // Test 1: Check config
  console.log('1️⃣ Checking configuration...');
  try {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    console.log(`   ✓ Config loaded`);
    console.log(`   - Client ID: ${config.clientId.substring(0, 20)}...`);
    console.log(`   - Folder ID: ${config.folderId}`);

    if (config.clientId.includes('YOUR_') || config.clientSecret.includes('YOUR_')) {
      throw new Error('config.json still has placeholder values — update it with your actual credentials');
    }

    console.log(`   ✓ Config looks good\n`);
  } catch (err) {
    console.error(`   ✗ Config error: ${err.message}\n`);
    process.exit(1);
  }

  // Test 2: Check dependencies
  console.log('2️⃣ Checking dependencies...');
  try {
    require('mime-types');
    console.log(`   ✓ All dependencies installed\n`);
  } catch (err) {
    console.error(`   ✗ Missing dependency: ${err.message}`);
    console.error(`   Run: npm install\n`);
    process.exit(1);
  }

  // Test 3: Check refresh token
  console.log('3️⃣ Checking authorization...');
  const tokenPath = path.join(__dirname, '.drive-tokens.json');
  if (!fs.existsSync(tokenPath)) {
    console.error(`   ✗ Refresh token not found`);
    console.error(`   \n📋 You need to authorize first:\n`);
    console.error(`      node scripts/oauth-setup.js\n`);
    process.exit(1);
  }
  console.log(`   ✓ Refresh token found\n`);

  // Test 4: Create and upload a test file
  console.log('4️⃣ Creating and uploading test file...');
  const testFile = path.join(__dirname, 'test-file.txt');
  const testContent = `Test file created at ${new Date().toISOString()}\n\nIf you see this, the drive-delivery skill is working!`;

  try {
    fs.writeFileSync(testFile, testContent);
    console.log(`   ✓ Test file created: ${testFile}`);

    const result = await uploadToDrive(testFile, 'drive-delivery-test.txt');

    console.log(`\n📊 Results:`);
    console.log(`   File ID: ${result.fileId}`);
    console.log(`   Filename: ${result.filename}`);
    console.log(`   MIME Type: ${result.mimeType}`);
    console.log(`   \n📎 View link: ${result.url}`);
    console.log(`   📎 Share link: ${result.webViewLink}`);

    // Clean up test file
    fs.unlinkSync(testFile);
    console.log(`\n✅ Test passed! drive-delivery is ready to use.`);
  } catch (err) {
    console.error(`   ✗ Upload failed: ${err.message}\n`);
    if (testFile && fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    process.exit(1);
  }
}

runTest();
