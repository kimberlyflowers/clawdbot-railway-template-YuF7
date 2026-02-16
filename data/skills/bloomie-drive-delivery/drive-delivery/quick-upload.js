const fs = require('fs');
const https = require('https');
const { google } = require('googleapis');

async function uploadToGoogleDrive() {
  try {
    console.log('Loading config...');
    const config = JSON.parse(fs.readFileSync('/data/workspace/drive-delivery/config.json', 'utf8'));
    console.log('Config loaded:', { folderId: config.folderId });
    
    console.log('Loading token...');
    const tokens = JSON.parse(fs.readFileSync('/data/workspace/drive-delivery/.drive-tokens.json', 'utf8'));
    console.log('Token loaded');
    
    const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, 'http://localhost:3000/oauth2callback');
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
    
    console.log('Creating Drive client...');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    console.log('Uploading file...');
    const res = await drive.files.create({
      requestBody: {
        name: 'Johnathon-Workspace-2026-02-14.tar.gz',
        parents: [config.folderId],
      },
      media: {
        mimeType: 'application/gzip',
        body: fs.createReadStream('/tmp/johnathon-workspace.tar.gz'),
      },
      fields: 'id, webViewLink',
    });
    
    console.log('File uploaded successfully!');
    console.log('Link:', res.data.webViewLink);
    console.log('File ID:', res.data.id);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

uploadToGoogleDrive();
