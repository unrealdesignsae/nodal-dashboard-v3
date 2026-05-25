import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, isValidDashboardPasscode, createAuthCookieValue } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();

  if (!isValidDashboardPasscode(passcode)) {
    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, createAuthCookieValue(), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
