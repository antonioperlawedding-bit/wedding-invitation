/**
 * One-time script to generate a Google OAuth2 refresh token with full Drive scope.
 *
 * The CMS needs "https://www.googleapis.com/auth/drive" scope (not drive.file)
 * so it can manage ALL files in the shared Drive folder — including ones uploaded
 * directly through the Google Drive UI.
 *
 * Usage:
 *   1. Make sure .env has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
 *   2. Run: node server/gen-refresh-token.js
 *   3. Open the URL it prints in your browser
 *   4. Sign in with the Google account that owns the Drive folder
 *   5. Paste the authorization code back into the terminal
 *   6. Copy the new GOOGLE_REFRESH_TOKEN into .env
 */

import 'dotenv/config';
import { google } from 'googleapis';
import readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
];

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('❌  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(
  clientId,
  clientSecret,
  'urn:ietf:wg:oauth:2.0:oob'          // out-of-band redirect for CLI
);

const url = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',                    // force new refresh token
  scope: SCOPES,
});

console.log('\n🔗  Open this URL in your browser:\n');
console.log(url);
console.log('\nSign in with the Google account that OWNS the wedding Drive folder.');
console.log('After granting access, copy the authorization code.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    console.log('\n✅  Success! Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    if (tokens.scope) console.log(`Scopes granted: ${tokens.scope}`);
  } catch (err) {
    console.error('\n❌  Failed to exchange code:', err.message);
  }
  rl.close();
});
