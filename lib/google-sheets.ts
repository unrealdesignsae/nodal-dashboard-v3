import { sheets } from '@googleapis/sheets';
import { JWT } from 'google-auth-library';

export async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY');
  }
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return sheets({ version: 'v4', auth });
}

export async function readSheetRange(spreadsheetId: string, range: string) {
  const client = await getSheetsClient();
  const response = await client.spreadsheets.values.get({ spreadsheetId, range });
  return response.data.values ?? [];
}
