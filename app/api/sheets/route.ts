import { NextResponse } from 'next/server';
import { EMBEDDED_SHEET_DATA, SHEET_ID } from '@/lib/sheet-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    sheetId: process.env.GOOGLE_SHEET_ID || SHEET_ID,
    tabs: Object.keys(EMBEDDED_SHEET_DATA),
    embedded: true,
    data: EMBEDDED_SHEET_DATA,
  });
}
