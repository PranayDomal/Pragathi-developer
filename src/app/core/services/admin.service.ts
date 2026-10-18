import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.service';

export type TableName = 'leads' | 'activities' | 'visits' | 'configurations';

// DEV MODE: talks to the Development-only /api/admin endpoints
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private url = `${API_BASE}/admin`;

  list<T>(table: TableName): Observable<T[]> {
    return this.http.get<T[]>(`${this.url}/${table}`);
  }

  update(table: TableName, id: number, body: unknown): Observable<void> {
    return this.http.put<void>(`${this.url}/${table}/${id}`, body);
  }

  remove(table: TableName, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${table}/${id}`);
  }
}