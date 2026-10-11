# Green Woods by Pragathi Developers (Angular frontend)

A recreation of the Green Woods project website by Pragathi Developers (Pragathi Nagar, Bachupally, Hyderabad), built as an internship project. The site collects enquiries, site visit bookings, floor plan and brochure downloads, contact messages and chat conversations, and sends them to a backend API.

- **Live site:** https://pragathi-developer.vercel.app
- **Backend API:** [Pragathi-developer-api](https://github.com/PranayDomal/Pragathi-developer-api) (.NET 8 on Render, PostgreSQL on Neon)

## Features

- Full site with a header and footer: Green Woods, Floor Plans, Specifications, Amenities, Progress Videos, Price and Contact
- **Enquire Now** window for enquiries and **Book a Site Visit** with date, time slot and number of visitors
- **Floor Plans:** pick a home type, enter your details, and the plan downloads
- **Brochure:** opens the Enquire Now window first, then downloads the PDF (`assets/brochure/Green-Woods-Brochure.pdf`)
- **Contact page** form and a **Reserve Your Home** form on the home page
- **Chat concierge** that asks a few questions and saves the conversation
- Floating buttons for chat, brochure and WhatsApp
- **Admin page** (sign-in with ID and password) to view, edit and delete the saved records

## Tech stack

- Angular 22 (standalone components, signals, router)
- TypeScript and plain CSS
- `HttpClient` with a functional interceptor for the admin token
- Hosted on Vercel, redeploying on every push to `main`

## Project structure

```
src/
  app/
    header/, floating-widgets/, enquiry-modal/   Shared parts of the page
    admin-login/                                  Sign-in window for admin
    admin-page/                                   Admin tables (view, edit, delete)
    services/
      api.service.ts          Sends form submissions to POST /api/leads
      admin.service.ts        Admin API calls (list, update, delete)
      admin-auth.service.ts   Admin login with the API
      admin-session.ts        Stores the admin token for the browser tab
      admin-http.ts           Adds the token to admin requests and guards /admin
  environments/
    environment.ts              Live settings (production API address)
    environment.development.ts  Local settings (http://localhost:5080/api)
  assets/                        Images and the brochure PDF
```

## Getting started

Requirements: Node.js and npm.

```bash
npm install
ng serve
```

Open `http://localhost:4200`. For forms to save, run the backend API locally on `http://localhost:5080` (see the API repo). Without it, the forms show "Can't reach the server".

### API address

The API address is set in the environment files, so the code never contains it directly:

| File | Used for | `apiUrl` |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` | `http://localhost:5080/api` |
| `src/environments/environment.ts` | production build | `https://pragathi-api.onrender.com/api` |

If you host your own API, change the address in `environment.ts`, and add your site address to `Cors__Origins__0` on the API.

## Build

```bash
ng build
```

The result is in the `dist/` folder.

## Deployment

The repo is connected to Vercel. Each push to `main` builds and publishes the site automatically. The backend and database are hosted separately (Render and Neon), and the API's allowed website address (`Cors__Origins__0`) must match the Vercel address exactly, with no trailing `/`.

Note: the free backend sleeps when idle, so the first form submission or admin sign-in after a quiet period can take up to a minute.

## Admin page

- Open the shield button on the site and sign in with the admin ID and password. These are set on the API server and are not stored in this repo.
- The token is kept only for the current browser tab and expires after 2 hours.
- Opening `/admin` without signing in redirects to the home page, and the API refuses admin requests without a valid token.
- The home types (Configurations) are read-only.