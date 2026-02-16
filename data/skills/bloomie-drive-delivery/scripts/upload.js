/**
 * Google Drive Upload Script (OAuth2)
 * Uploads files to your Google Drive folder using OAuth2 user credentials
 */

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Load config
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`config.json not found at ${configPath}. See SETUP.md for instructions.`);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.clientId || !config.clientSecret || !config.folderId) {
      throw new Error('config.json must have clientId, clientSecret, and folderId');
    }
    return config;
  } catch (err) {
    throw new Error(`Failed to load config.json: ${err.message}`);
  }
}

// Load refresh token
function loadRefreshToken() {
  const tokenPath = path.join(__dirname, '..', '.drive-tokens.json');
  if (!fs.existsSync(tokenPath)) {
    throw new Error(
      `Refresh token not found. Run: node scripts/oauth-setup.js to authorize first.\n` +
      `Token should be saved to: ${tokenPath}`
    );
  }

  try {
    const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    if (!data.refresh_token) {
      throw new Error('Invalid token file — missing refresh_token');
    }
    return data.refresh_token;
  } catch (err) {
    throw new Error(`Failed to load refresh token: ${err.message}`);
  }
}

/**
 * Get a fresh access token using refresh token
 */
async function getAccessToken(clientId, clientSecret, refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  return data.access_token;
}

/**
 * Upload a file to Google Drive using OAuth2
 * @param {string} localFilePath - Path to local file to upload
 * @param {string} [customFilename] - Optional custom filename for Drive (defaults to original filename)
 * @returns {Promise<{fileId: string, url: string, webViewLink: string}>}
 */
async function uploadToDrive(localFilePath, customFilename = null) {
  try {
    // Validate local file
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found: ${localFilePath}`);
    }

    // Load config and credentials
    const config = loadConfig();
    const refreshToken = loadRefreshToken();

    console.log(`📁 Target folder ID: ${config.folderId}`);

    // Get access token
    const accessToken = await getAccessToken(config.clientId, config.clientSecret, refreshToken);
    console.log(`🔐 Got access token`);

    // Determine filename
    const filename = customFilename || path.basename(localFilePath);

    // Detect MIME type
    const mimeType = mime.lookup(localFilePath) || 'application/octet-stream';

    // Read file content
    const fileContent = fs.readFileSync(localFilePath);

    // Create multipart form data
    const boundary = '===============' + Date.now() + '===============';
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    // File metadata (JSON)
    const metadata = {
      name: filename,
      mimeType: mimeType,
      parents: [config.folderId],
    };

    // Build multipart body
    const body = [
      delimiter,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${mimeType}`,
      'Content-Transfer-Encoding: base64',
      '',
      fileContent.toString('base64'),
      closeDelimiter,
    ].join('\n');

    // Upload via REST API
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: body,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed (HTTP ${uploadResponse.status}): ${error}`);
    }

    const result = await uploadResponse.json();
    const fileId = result.id;

    console.log(`✅ Upload successful: ${filename}`);

    return {
      fileId,
      url: `https://drive.google.com/file/d/${fileId}/view`,
      webViewLink: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      filename,
      mimeType,
    };
  } catch (err) {
    throw new Error(`Upload failed: ${err.message}`);
  }
}

module.exports = { uploadToDrive };
