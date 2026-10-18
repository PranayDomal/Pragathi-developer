import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { EnquiryModal } from './shared/enquiry-modal/enquiry-modal';
import { FloatingWidgets } from './layout/floating-widgets/floating-widgets';
import { AdminLogin } from './admin/admin-login/admin-login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, EnquiryModal, FloatingWidgets, AdminLogin],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private lastPath = '';

  // true while the admin panel is open (the floating buttons are hidden there)
  isAdmin = signal(false);

  constructor() {
    // After every page change:
    // - a different page starts at the very top (instantly, no long slide)
    // - clicking the logo while already on that page slides back to the top
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const [path, fragment] = (e as NavigationEnd).urlAfterRedirects.split('#');
        const samePath = path === this.lastPath;

        this.isAdmin.set(path.startsWith('/admin'));

        if (!samePath) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else if (!fragment) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        this.lastPath = path;
      });
  }
}