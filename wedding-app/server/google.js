import { google } from 'googleapis';

let _oauth2Client = null;

export function getOAuth2Client() {
  if (_oauth2Client) return _oauth2Client;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  _oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  _oauth2Client.setCredentials({ refresh_token: refreshToken });
  return _oauth2Client;
}

export function getGmail() {
  const auth = getOAuth2Client();
  if (!auth) return null;
  return google.gmail({ version: 'v1', auth });
}

export function getDrive() {
  const auth = getOAuth2Client();
  if (!auth) return null;
  return google.drive({ version: 'v3', auth });
}
