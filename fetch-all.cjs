
const { sheets } = require('@googleapis/sheets');
const { JWT } = require('google-auth-library');
const fs = require('fs');

const SHEET_ID = "1iFUyaMhrA_HutzpgV88imc9peWfH_4ovyjLIFj33E-U";
const TAB_NAMES = [
  "OVERVIEW", "Sheet1", "AUDIO", "LIGHTING", "VIDEO - LED",
  "LASER", "SFX - PYRO", "POWER", "RIGGING", "BACKLINE", "BROADCAST", "STAGING"
];

async function main() {
  const auth = new JWT({
    email: "nodal-v2@nodal-dahsboard.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDH6RqAPwJ0E10p\nL++8TUcQbXTpER+fDPs22oFfVseW6ntNkTCJDJ33FCgpzLjUBLL9L7jLFgi9owWf\nZ5XQfhaXiB4r49hQKa/EKUhxHz5MYn3Kh9wZBMRnez+XUcHDKIBd2q7iMxq/dRBZ\ngCgDi5RX3EhDc87Jyi5vVbMe9YlOtAfGOQDJ1fTBw0DweDMT8e/S9a1kZ7iNGkzN\nSacYtzjKTug4DBKQlr9pfXgEVVvzg00tNQ1yuZtP6LFsmuyYwFj9cojOQMEUg/J1\nlstixJT2LUpCZgN/OkvQk4vpX4HCTCCD9ahwnTgXAKdhTA5uZXdZpPpMbpvd9JsS\nOa81Aqi1AgMBAAECggEAQ3CrJQqcrEYADq4CRVcYmz0hzKKfNUvuz8GFFYG0EYCH\nGlLZudJM1Bazue47iCMRswJPaAvF5RvDANS0IML4oiQkcZAK4Hg/uIBo1OjCXoh3\ngUS2BqaqD3Lvr/+/yzO1onPsvZiZ9G7slhT66r9CyyUgJ8lAwKh5Y8vYgqA4sxjF\njo4bfjJT1H2wcSZE4ocTp3X/2nPUDO5xQ+oU9ovufd/EMO+pX2OJTOH3gqWyBVg5\nIHMl/OP/+zjv2yEQdhA3DWeOupN1tY2HQCdpbFSio3nvXfbavNYrCWv5o7TSkuMb\nkAPZMOCDEY38R4cDetpXaf0xBjjIhhB5mXMWWkn/nQKBgQD5Wg8KBAszQm7ivn6D\npjTJbMptQlf7axTih/R0FIYhuIuQu/yaGqbimOtAyuuqoxljI/Dof4NPo0V0u0PN\ne0XqnC8LRj65mKRXQOe6OBbbM5Lyx7FRQ966qdB+eIm+Jnl/ELaC5QFVg8fe7rrG\nQGur/VI7H4jKAzBS48mRKG6rhwKBgQDNPZXkJmu6CuiIlnkH2SVkweDr2xvs9+/3\n8oEVyKFwzxCnaAHfjEMnY+M6ucCHAQZ628TlzzCijIqnamKZ38oDI8KyFjgNs5+i\ndTqlKSw0DmRxfKYHcf0Mk6Cjltrm5KuAAjUvtAvU13TJiqX/JwTTeUOCOAEUY6Rc\n0OgODd7w4wKBgQCuCmT62a2znofk7Y9Cdkzb1npH3omoa6pNHxXJu9WPTc7kO8Hp\nEfcvrApv0/K/zE1Y/GoW7YGKoWxGOLrvfj5jrZXMacA4LMlwOVZEjQevAgVsPWOP\nVC7u3L4wuBN0TEh7HwA0xoCy3mMwQDLPU4GTryGpMK56SdV91Y4IKk9smwKBgD2F\nkXHTZoVdEbknyd3lZIUgbMimZGeTJrafVbxu6J3FJAvabH1TMSoUkh+fYKvXTdb0\nG8B7a+u9zy5CAI55e7eXN5xkdqb8ygRLuamafuqXydoO8EHZFG55rjR7WuDNeO8l\nOkYzZTyG3TYwvnOOga7WcbsOCJzRBYrhAD5+P+7bAoGBAI8ShZFDqvMdpRfGRtNJ\n3Q0/M5yarP7CqsuMowpkgzJfzwg3IT+3LLLJCidXAlwSbAWxVBpK1rBcsZvFHKxx\nqYHZE44KjigfLXpE5nuX2aN8ygPjfI62K861uWEvxWwYTINy8248RCk5o7sG/K/V\nCaktxgXR27tU23XiibAS+Lh4\n-----END PRIVATE KEY-----\n",
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = sheets({ version: 'v4', auth });
  const allData = {};

  for (const tab of TAB_NAMES) {
    try {
      const r = await client.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: tab + "!A1:Z300",
        valueRenderOption: "FORMATTED_VALUE",
      });
      const rows = r.data.values ?? [];
      allData[tab] = rows;
      
      // Find max cols
      let maxCols = 0;
      for (const row of rows) maxCols = Math.max(maxCols, row.length);
      console.log(tab + ": " + rows.length + " rows, " + maxCols + " cols");
    } catch(e) {
      console.log(tab + ": ERROR " + e.message);
      allData[tab] = [];
    }
  }
  
  fs.writeFileSync('/tmp/sheet-raw.json', JSON.stringify(allData, null, 2));
  console.log("Done.");
}
main().catch(e => { console.error(e.message); process.exit(1); });
