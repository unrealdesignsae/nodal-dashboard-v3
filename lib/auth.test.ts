import { describe, expect, it } from 'vitest';
import { createAuthCookieValue, isAuthenticatedCookie, isValidDashboardPasscode } from './auth';

describe('dashboard password layer', () => {
  it('accepts passcode 2403', () => {
    expect(isValidDashboardPasscode('2403')).toBe(true);
  });

  it('rejects any other passcode', () => {
    expect(isValidDashboardPasscode('2404')).toBe(false);
    expect(isValidDashboardPasscode('')).toBe(false);
    expect(isValidDashboardPasscode(undefined)).toBe(false);
  });

  it('recognizes the issued auth cookie value', () => {
    const cookie = createAuthCookieValue();
    expect(isAuthenticatedCookie(cookie)).toBe(true);
    expect(isAuthenticatedCookie('wrong')).toBe(false);
  });
});
