import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api.service';
import {
  clearAdminSession, getAdminName, getAdminRole, isAdminSessionValid, saveAdminSession, AdminRole,
} from './admin-session';


export type LoginResult = 'ok' | 'wrong' | 'disabled' | 'busy' | 'unreachable';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private http = inject(HttpClient);

  async login(id: string, password: string): Promise<LoginResult> {
    try {
          const res = await firstValueFrom(
            this.http.post<{ token: string; expiresAt: string; role: string; name: string }>(
              `${API_BASE}/admin/login`,
              { id, password },
            ),
          );
          saveAdminSession(res.token, res.expiresAt, res.role, res.name);
        return 'ok';
        } catch (e) {
          const status = (e as HttpErrorResponse).status;
          if (status === 403) return 'disabled';
          if (status === 401 || status === 404) return 'wrong';
          if (status === 429) return 'busy';
          return 'unreachable';
        }
  }

  isLoggedIn(): boolean {
    return isAdminSessionValid();
  }


    role(): AdminRole | null {
    return getAdminRole();
  }

  name(): string {
    return getAdminName();
  }

  // Viewer: false. Editor and Superuser: true.
  canEdit(): boolean {
    const r = getAdminRole();
    return r === 'Editor' || r === 'Superuser';
  }

  isSuperuser(): boolean {
    return getAdminRole() === 'Superuser';
  }


  logout(): void {
    clearAdminSession();
  }
}