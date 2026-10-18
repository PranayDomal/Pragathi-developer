# Pragathi Developers – Frontend (Green Woods)

Angular copy of https://www.pragathidevelopers.in/ ("Green Woods"), plus a role-based admin panel.

- **Live site:** https://pragathi-developer.vercel.app
- **Backend:** see the `Pragathi-developer-api` repo (microservices behind a Gateway)

## Tech

Angular 22 (standalone components, signals, `@if` / `@for` control flow, functional guards and interceptors), TypeScript, plain CSS. Hosted on Vercel; Vercel deploys the `main` branch.

## Run locally

```bash
npm install
ng serve
```

Open http://localhost:4200.

The API address comes from `src/environments/`:

| File | Used for | `apiUrl` |
|---|---|---|
| `environment.development.ts` | `ng serve` (your computer) | `http://localhost:5080/api` (local Gateway) |
| `environment.ts` | production build (Vercel) | `https://pragathi-gateway.onrender.com/api` |

To work against the local backend, start the Gateway and services first (see the backend README).
After changing an environment file, restart `ng serve`.

## What's in the site

- Public pages: Green Woods, floor plans, specifications, amenities, progress videos, price, contact, brochure, enquire form.
- Forms (enquiry, site visit, configurations, activities) are saved through the API as leads.
- Floating contact widgets on public pages (hidden on the admin page).

## Admin panel (`/admin`)

Sign in from the Admin login popup. The panel has tabs for **Leads, Activities, Visits, Configurations**, and **Users** (Superuser only), with a search bar that filters whichever table is open.

| Role | Can do |
|---|---|
| Viewer | View only (no Edit/Delete buttons) |
| Editor | View, edit and delete records |
| Superuser | Everything above, plus manage users (add, change role, switch off/on, reset password, delete) |

Behaviours:

- Wrong ID/password, a switched-off account, an unreachable server and a busy server each show their own message.
- The session lasts 2 hours and is kept in `sessionStorage` (cleared when the tab closes).
- Leaving `/admin` or pressing **Sign out** asks for confirmation ("Sign out!") because it ends the session.

## Project structure

```
src/app/
  core/services/   admin-session, admin-auth, admin-http (interceptor + guards), users, ...
  layout/          header, footer, shell
  pages/           routed pages (home, admin, ...)
  sections/        page sections
  shared/          reusable pieces
src/environments/  API address per environment
```

## Notes

- The backend runs on Render's free plan, so after a quiet period the first request (especially the first admin login) can take 1 to 1.5 minutes while services wake up. Wait for it, or open the backend health pages first.
- Don't commit secrets. The frontend holds none; all keys live in the backend's environment settings.