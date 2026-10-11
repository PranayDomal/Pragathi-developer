import { Injectable, signal } from '@angular/core';

// Remembers "admin signed in" for this browser tab only (dev mode)
export const ADMIN_FLAG = 'gw_admin';

@Injectable({ providedIn: 'root' })
export class AdminLoginState {
  isOpen = signal(false);

  show() {
    this.isOpen.set(true);
  }

  hide() {
    this.isOpen.set(false);
  }
}