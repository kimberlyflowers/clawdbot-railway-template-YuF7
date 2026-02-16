/**
 * OAuth2 Setup Script
 * Generates authorization URL and exchanges auth code for refresh token
 * Run this once to grant the app permission to upload to your Drive
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load config
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`config.json not found at ${configPath}`);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.clientId || !config.clientSecret) {
      throw new Error('config.json must have clientId and clientSecret for OAuth2');
    }
    return config;
  } catch (err) {
    throw new Error(`Failed to load config.json: ${err.message}`);
  }
}

/**
 * Generate OAuth2 authorization URL
 * User visits this URL and grants permission
 */
function getAuthorizationUrl(clientId, redirectUri) {
  const state = crypto.randomBytes(32).toString('hex');
  const scope = 'https://www.googleapis.com/auth/drive.file';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scope);
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');
  url.searchParams.append('state', state);

  return { url: url.toString(), state };
}

/**
 * Exchange authorization code for refresh token
 */
async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Save refresh token to file
 */
function saveRefreshToken(refreshToken, tokenPath) {
  const tokenData = {
    refresh_token: refreshToken,
    saved_at: new Date().toISOString(),
  };

  fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
  fs.chmodSync(tokenPath, 0o600); // Only readable by owner
}

/**
 * Main setup flow
 */
async function runSetup() {
  try {
    console.log('🔐 Google Drive OAuth2 Setup\n');

    const config = loadConfig();
    const redirectUri = 'urn:ietf:wg:oauth:2.0:oob'; // Out-of-band (manual code entry)
    const tokenPath = path.join(__dirname, '..', '.drive-tokens.json');

    // Step 1: Generate auth URL
    console.log('Step 1️⃣ : Generating authorization URL...\n');
    const { url } = getAuthorizationUrl(config.clientId, redirectUri);
    
    console.log('📱 Open this URL in your browser and grant permission:\n');
    console.log(url);
    console.log('\n');

    // Step 2: Get auth code from user
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question('📋 Paste the authorization code here: ', resolve);
    });
    rl.close();

    if (!code || code.trim().length === 0) {
      throw new Error('No authorization code provided');
    }

    // Step 3: Exchange code for refresh token
    console.log('\nStep 2️⃣ : Exchanging code for refresh token...\n');
    const tokens = await exchangeCodeForToken(code.trim(), config.clientId, config.clientSecret, redirectUri);

    if (!tokens.refresh_token) {
      throw new Error('No refresh token in response — authorization may have failed');
    }

    // Step 4: Save refresh token
    console.log('Step 3️⃣ : Saving refresh token...\n');
    saveRefreshToken(tokens.refresh_token, tokenPath);
    console.log(`✅ Refresh token saved to: ${tokenPath}`);
    console.log(`   Keep this file secure — it grants access to your Drive\n`);

    console.log('🎉 Setup complete! You can now upload files to your Drive.\n');
    console.log('Next: Run `node scripts/upload.js` to upload a file, or use it from your app.\n');

  } catch (err) {
    console.error(`❌ Setup failed: ${err.message}\n`);
    process.exit(1);
  }
}

// Run setup if executed directly
if (require.main === module) {
  runSetup();
}

module.exports = { getAuthorizationUrl, exchangeCodeForToken, saveRefreshToken };
