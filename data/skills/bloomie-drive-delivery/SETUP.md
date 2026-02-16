# Setup Guide

There are two approaches depending on your account type:

## 🔐 For Personal Gmail Accounts → Use OAuth2

**Recommended approach for personal Gmail.**

Follow: [SETUP_OAUTH2.md](SETUP_OAUTH2.md)

This lets you use your own Google Drive quota and works without Shared Drives.

## 🏢 For Google Workspace Accounts → Use Service Account (Optional)

If you have a Workspace account with Shared Drives, you can use the service account approach for server-side automation.

See deprecated docs in [SETUP_SERVICE_ACCOUNT.md](SETUP_SERVICE_ACCOUNT.md) (if upgrading from an older version).

## Quick Start (Personal Gmail)

1. **Create OAuth2 credentials** — See step 1 in SETUP_OAUTH2.md
2. **Update config.json** — Add clientId, clientSecret, folderId
3. **Run authorization** — `node scripts/oauth-setup.js`
4. **Test** — `node test.js`

## FAQs

**Q: Why not use service account?**
- Service accounts can't write to personal Drive folders (Google limitation)
- OAuth2 uses your quota instead, no restrictions

**Q: Is my password stored?**
- No. You authorize once, we store a refresh token (not your password)

**Q: Is it secure?**
- Yes. Refresh token is stored locally with `600` permissions (owner-only read/write)
- Never transmitted to external servers

**Q: Can I revoke access?**
- Yes. Delete `.drive-tokens.json` and run the setup again, or revoke in Google account settings

## Next Steps

👉 Open [SETUP_OAUTH2.md](SETUP_OAUTH2.md) and follow the steps.
