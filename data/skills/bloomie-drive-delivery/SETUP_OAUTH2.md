# OAuth2 Setup Guide

This guide walks you through setting up Google Drive OAuth2 for personal Gmail accounts.

## Step 1: Create OAuth2 Credentials in Google Cloud Console

### 1.1 Open Google Cloud Console
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Select your **bloom-ecosystem** project (same one from before)

### 1.2 Create OAuth2 Credentials
- Go to **APIs & Services** → **Credentials**
- Click **+ Create Credentials** → **OAuth 2.0 Client ID**
- If prompted, first click **Configure Consent Screen**:
  - Choose **External**
  - Fill in app name: "OpenClaw Drive Delivery"
  - Add your email as a test user
  - Save and continue (don't worry about optional fields)

### 1.3 Create the Client ID
- Back on Credentials page, click **+ Create Credentials** → **OAuth 2.0 Client ID**
- Choose **Desktop application**
- Name it: "OpenClaw Drive Delivery CLI"
- Click **Create**

### 1.4 Copy Your Credentials
- You'll see your new Client ID — click the download icon or the entry to expand
- Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- Copy the **Client Secret** (looks like a random string)
- Keep these safe — you'll paste them next

## Step 2: Update config.json

In `/data/workspace/drive-delivery/config.json`, replace the service account setup with:

```json
{
  "clientId": "YOUR_CLIENT_ID_HERE",
  "clientSecret": "YOUR_CLIENT_SECRET_HERE",
  "folderId": "1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1"
}
```

Example (with real values):
```json
{
  "clientId": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
  "clientSecret": "GOCSPX-abcdefghijklmnop123456",
  "folderId": "1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1"
}
```

## Step 3: Authorize the App

Run the OAuth2 setup script:

```bash
cd /data/workspace/drive-delivery
node scripts/oauth-setup.js
```

**What happens:**
1. Script generates an authorization URL
2. You open it in your browser
3. Google asks you to grant permission
4. You get an authorization code
5. Paste the code back into the terminal
6. Script saves a refresh token locally

The refresh token is saved to `.drive-tokens.json` (automatically ignored in git).

## Step 4: Test It

```bash
node test.js
```

You should see your test file uploaded to your Google Drive folder.

## Security Notes

- **Client Secret** — Keep private, don't commit to git
- **Refresh Token** (.drive-tokens.json) — Keep private, don't share
- **File permissions** — The refresh token is automatically saved with `600` permissions (only readable by you)

## Troubleshooting

### Error: "Refresh token not found"
- Run `node scripts/oauth-setup.js` to authorize first
- Make sure you completed all steps and pasted the auth code

### Error: "Invalid authorization code"
- The code expires in 10 minutes — if it took too long, run the setup again
- Copy the full code (no spaces)

### Error: "Client not authorized"
- Make sure your email is added as a test user in the OAuth Consent Screen
- Go to Google Cloud Console → APIs & Services → OAuth consent screen → Test users

### Error: "Invalid client"
- Check that clientId and clientSecret in config.json are correct
- Make sure you copied the full strings (no extra spaces)

## Resetting / Re-authorizing

If you want to revoke access or re-authorize:

1. Delete `.drive-tokens.json`
2. Run `node scripts/oauth-setup.js` again
3. Google will ask you to grant permission again

## How It Works

1. **First time:** You authorize the app and get a refresh token
2. **Every upload:** Script uses refresh token to get a temporary access token
3. **The access token:** Used to upload the file to your Drive
4. **Your quota:** Used (not a service account), so no quota issues!

## Switching Back to Service Account (Optional)

If you later get a Shared Drive, you can switch back to service account auth. Just update config.json and upload.js. But OAuth2 is the right approach for personal Gmail.
