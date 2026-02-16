const { uploadToDrive } = require('./scripts/upload.js');

async function uploadWorkspace() {
  try {
    console.log('Uploading Johnathon workspace...');
    const result = await uploadToDrive('/tmp/johnathon-workspace.tar.gz', 'Johnathon-Workspace-2026-02-14.tar.gz');
    
    console.log('\n✅ Upload successful!');
    console.log(`File ID: ${result.fileId}`);
    console.log(`Share link: ${result.webViewLink}`);
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  }
}

uploadWorkspace();
