import { inject } from '@angular/core';
import { CanActivateFn, Router, CanDeactivateFn } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_BASE } from './api.service';
import { clearAdminSession, getAdminToken, isAdminSessionValid } from './admin-session';

// Adds "Authorization: Bearer <token>" to admin API calls.
// If the API says 401 (token wrong or expired), log out and go to the home page.
export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const isAdminCall = req.url.startsWith(`${API_BASE}/admin/`) && !req.url.endsWith('/admin/login');
  if (!isAdminCall) return next(req);

  const token = getAdminToken();
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err) => {
      if (err.status === 401) {
        clearAdminSession();
        router.navigateByUrl('/');
      }
      return throwError(() => err);
    }),
  );
};

// Opening /admin without a valid login sends you to the home page.
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  return isAdminSessionValid() ? true : router.createUrlTree(['/']);
};

export const SIGN_OUT_WARNING = 'Sign out!\n\nYou will be signed out of the admin panel. Continue?';

// Leaving the admin page (any link, back button...) means signing out. Ask first.
export const adminLeaveGuard: CanDeactivateFn<unknown> = () => {
  if (!isAdminSessionValid()) return true; // already signed out, nothing to ask
  if (!confirm(SIGN_OUT_WARNING)) return false; // Cancel: stay here
  clearAdminSession();
  return true;
};