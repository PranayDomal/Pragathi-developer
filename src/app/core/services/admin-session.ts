const TOKEN_KEY = 'gw_admin_token';
const EXPIRES_KEY = 'gw_admin_expires';
const ROLE_KEY = 'gw_admin_role';
const NAME_KEY = 'gw_admin_name';

export type AdminRole = 'Viewer' | 'Editor' | 'Superuser';

export function saveAdminSession(token: string, expiresAt: string, role: string, name: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EXPIRES_KEY, expiresAt);
    sessionStorage.setItem(ROLE_KEY, role);
    sessionStorage.setItem(NAME_KEY, name);
  } catch {}
}

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAdminRole(): AdminRole | null {
  try {
    const r = sessionStorage.getItem(ROLE_KEY);
    return r === 'Viewer' || r === 'Editor' || r === 'Superuser' ? r : null;
  } catch {
    return null;
  }
}

export function getAdminName(): string {
  try {
    return sessionStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(NAME_KEY);
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