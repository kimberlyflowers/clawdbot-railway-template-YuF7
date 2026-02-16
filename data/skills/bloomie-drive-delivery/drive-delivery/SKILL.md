---
name: bloomie-drive-delivery
description: Bloomie file delivery skill — Upload files to Google Drive using OAuth2 and return shareable URLs. Use when you need to deliver files—specify the local file path (and optional filename) and get back a direct Drive link. Works with personal Gmail accounts. After initial OAuth2 authorization, no further user interaction needed. Supports all file types (docs, images, PDFs, spreadsheets, etc.).
---

# Drive Delivery

Upload files to Google Drive and get shareable links instantly.

## Quick Start

```javascript
const { uploadToDrive } = require('./upload.js');

// Upload a file
const result = await uploadToDrive(
  '/path/to/local/file.pdf',
  'My Document.pdf'  // optional: custom filename
);

console.log(result.url); // https://drive.google.com/file/d/FILE_ID/view
```

## Setup

1. Create OAuth2 credentials in Google Cloud Console
2. Update `config.json` with your credentials
3. Run `node scripts/oauth-setup.js` to authorize (one-time)
4. Ready to upload!

See [SETUP.md](SETUP.md) for detailed instructions.

## How to Use

**Before first use:**
1. Follow [SETUP.md](SETUP.md) to configure your service account credentials
2. Update `config.json` with your service account JSON path and folder ID

**Upload a file:**
```javascript
const { uploadToDrive } = require('./scripts/upload.js');

const result = await uploadToDrive(
  './report.pdf',           // local file path (required)
  'Q4 Report.pdf'          // custom filename (optional)
);

// Returns:
// {
//   fileId: 'abc123...',
//   url: 'https://drive.google.com/file/d/abc123.../view',
//   webViewLink: 'https://drive.google.com/file/d/abc123.../view?usp=sharing'
// }
```

## Features

- **OAuth2 auth** — Authorize once, upload forever (no service account quotas)
- **Personal Gmail support** — Works with regular Google Drive, not just Workspace
- **Auto MIME detection** — Automatically detects file type
- **Instant links** — Returns both view and sharing URLs
- **Any file type** — PDFs, images, docs, sheets, etc.
- **Secure tokens** — Refresh token stored locally with restricted permissions

## Error Handling

The script throws descriptive errors if:
- Refresh token is missing (need to run oauth-setup.js first)
- OAuth credentials in config.json are invalid
- File doesn't exist locally
- Upload fails

Handle errors in your code:
```javascript
try {
  const result = await uploadToDrive('./file.pdf');
} catch (err) {
  console.error('Upload failed:', err.message);
}
```

If you get "Refresh token not found", run:
```bash
node scripts/oauth-setup.js
```

## Integration

To use this from other scripts or agents:

```javascript
const { uploadToDrive } = require('/path/to/drive-delivery/scripts/upload.js');

// Then call uploadToDrive(localPath, optionalFilename)
```

## Troubleshooting

**"Refresh token not found"** → Run `node scripts/oauth-setup.js` to authorize first

**"Invalid client"** → Check clientId/clientSecret in config.json are correct (no placeholders)

**"ENOENT: no such file"** → Local file path is wrong or file doesn't exist

**"Upload failed (HTTP 403)"** → You may not have permission to write to the folder

See [SETUP.md](SETUP.md) and [SETUP_OAUTH2.md](SETUP_OAUTH2.md) for detailed troubleshooting.
