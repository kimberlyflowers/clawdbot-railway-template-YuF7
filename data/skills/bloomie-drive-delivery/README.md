# Drive Delivery Skill

Upload files to Google Drive and get shareable URLs instantly. Works with personal Gmail accounts using OAuth2.

## What's Included

- **SKILL.md** — The skill definition (use this to register with OpenClaw)
- **SETUP.md** — Quick setup guide
- **SETUP_OAUTH2.md** — Detailed OAuth2 configuration
- **scripts/oauth-setup.js** — Authorization flow (run once)
- **scripts/upload.js** — Upload engine (use repeatedly)
- **config.json** — Your OAuth2 credentials and folder ID
- **test.js** — Test script to verify everything works

## Key Features

✅ **Works with personal Gmail** — No Shared Drive needed  
✅ **OAuth2 authorization** — Grant permission once, upload forever  
✅ **No service account quotas** — Uses your own Drive quota  
✅ **Instant shareable links** — Get Drive URLs immediately  
✅ **Any file type** — PDF, images, docs, sheets, videos, etc.  

## Quick Start (3 steps)

### 1. Create OAuth2 Credentials

Follow the first step in [SETUP_OAUTH2.md](SETUP_OAUTH2.md):
- Go to Google Cloud Console
- Create OAuth2 Desktop credentials
- Copy Client ID and Client Secret

### 2. Update config.json

```json
{
  "clientId": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
  "clientSecret": "YOUR_CLIENT_SECRET_HERE",
  "folderId": "1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1"
}
```

### 3. Authorize

```bash
npm install
node scripts/oauth-setup.js
```

Follow the browser prompt to grant permission. That's it — you're authorized!

### 4. Test

```bash
node test.js
```

You should see a test file appear in your Drive folder.

## Usage

```javascript
const { uploadToDrive } = require('./scripts/upload.js');

const result = await uploadToDrive('./my-report.pdf', 'Q4 Report.pdf');
console.log(result.url); // https://drive.google.com/file/d/FILE_ID/view
```

Returns:
```javascript
{
  fileId: "abc123...",
  url: "https://drive.google.com/file/d/abc123.../view",
  webViewLink: "https://drive.google.com/file/d/abc123.../view?usp=sharing",
  filename: "Q4 Report.pdf",
  mimeType: "application/pdf"
}
```

## File Structure

```
drive-delivery/
├── SKILL.md                 ← Skill definition
├── SETUP.md                 ← Quick setup
├── SETUP_OAUTH2.md          ← Detailed OAuth2 guide
├── config.json              ← Your credentials (git-ignored)
├── package.json             ← Dependencies
├── test.js                  ← Test script
└── scripts/
    ├── upload.js            ← Main upload module
    └── oauth-setup.js       ← Authorization flow
```

## Security

- **Client Secret** — Keep private, don't commit to git
- **Refresh Token** (.drive-tokens.json) — Automatically created, git-ignored
- **File permissions** — Token saved with `600` permissions (owner-only)

## Next Step

👉 Follow [SETUP_OAUTH2.md](SETUP_OAUTH2.md) to create your OAuth2 credentials and authorize.

---

**Questions?** See [SETUP.md](SETUP.md) or [SETUP_OAUTH2.md](SETUP_OAUTH2.md) for troubleshooting.
