import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api.service';
import { clearAdminSession, isAdminSessionValid, saveAdminSession } from './admin-session';

export type LoginResult = 'ok' | 'wrong' | 'busy' | 'unreachable';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private http = inject(HttpClient);

  async login(id: string, password: string): Promise<LoginResult> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ token: string; expiresAt: string }>(`${API_BASE}/admin/login`, { id, password }),
      );
      saveAdminSession(res.token, res.expiresAt);
      return 'ok';
    } catch (e) {
      const status = (e as HttpErrorResponse).status;
      if (status === 401 || status === 404) return 'wrong';
      if (status === 429) return 'busy';
      return 'unreachable';
    }
  }

  isLoggedIn(): boolean {
    return isAdminSessionValid();
  }

  logout(): void {
    clearAdminSession();
  }
}