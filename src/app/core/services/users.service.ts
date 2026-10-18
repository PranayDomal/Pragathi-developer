import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.service';

export type UserRole = 'Viewer' | 'Editor' | 'Superuser';

export interface AdminUser {
  id: number;
  loginId: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private url = `${API_BASE}/admin/users`;

  list(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.url);
  }

  create(body: { loginId: string; name: string; password: string; role: UserRole }): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.url, body);
  }

  update(id: number, body: { name?: string; password?: string; role?: UserRole; isActive?: boolean }): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.url}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}