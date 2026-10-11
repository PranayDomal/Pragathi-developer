import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const API_BASE = environment.apiUrl;

export type ActivityType =
  | 'Enquiry'
  | 'SiteVisit'
  | 'FloorPlanDownload'
  | 'BrochureDownload'
  | 'ContactMessage'
  | 'Chat';

export interface SubmitRequest {
  name: string;
  phone: string;              // full international form, e.g. +919876543210
  email?: string;
  type: ActivityType;
  configuration?: string;     // must match a seeded name, e.g. "2 BHK Apartment"
  homeLoan?: boolean;
  message?: string;
  detail?: string;
  visitDetails?: {
    preferredDate: string;    // "YYYY-MM-DD"
    timeSlot: string;
    visitors: number;
  };
}

export interface SubmitResponse {
  leadId: number;
  alreadyReceived: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  submit(body: SubmitRequest): Observable<SubmitResponse> {
    return this.http.post<SubmitResponse>(`${API_BASE}/leads`, body);
  }
}