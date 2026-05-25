# Nodal EC26 Advancing Dashboard

Futuristic Next.js dashboard for Nodal Technical Consultancy's EC26 Electric Castle Mainstage advancing workbook.

## What it includes

- Main KPI/analytics dashboard
- All workbook pages as Excel-style tab pages
- Search and row filters per sheet
- Nodal logo and brand fonts from the provided ZIP
- Static embedded data snapshot for reliable builds
- Optional live Google Sheets API routes for production refreshes

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Vercel environment variables

Required for live Google Sheets API reads:

```env
GOOGLE_SHEET_ID=1iFUyaMhrA_HutzpgV88imc9peWfH_4ovyjLIFj33E-U
GOOGLE_PROJECT_ID=effective-time-346417
GOOGLE_SERVICE_ACCOUNT_EMAIL=nodal-dashboard-reader@effective-time-346417.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The app ships with an embedded data snapshot, so it will still render without env vars. Add the env vars when you want API routes to pull live sheet values.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
vercel env add GOOGLE_SHEET_ID
vercel env add GOOGLE_PROJECT_ID
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel --prod
```

Security: rotate/delete the service account key after deployment if it was shared during build.
