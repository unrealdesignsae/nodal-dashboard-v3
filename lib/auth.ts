export const AUTH_COOKIE = 'nodal_auth';

export function isValidDashboardPasscode(passcode: string | null | undefined) {
  return passcode === '2403';
}

export function createAuthCookieValue() {
  return 'authenticated';
}

export function isAuthenticatedCookie(value: string | null | undefined) {
  return value === createAuthCookieValue();
}
