const TOKEN_KEY = 'gw_admin_token';
const EXPIRES_KEY = 'gw_admin_expires';

export function saveAdminSession(token: string, expiresAt: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EXPIRES_KEY, expiresAt);
  } catch {}
}

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
  } catch {}
}

export function isAdminSessionValid(): boolean {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expires = sessionStorage.getItem(EXPIRES_KEY);
    return !!token && !!expires && new Date(expires).getTime() > Date.now();
  } catch {
    return false;
  }
}