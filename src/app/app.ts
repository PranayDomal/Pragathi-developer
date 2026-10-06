import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { EnquiryModal } from './enquiry-modal/enquiry-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, EnquiryModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private lastPath = '';

  constructor() {
    // After every page change:
    // - a different page starts at the very top (instantly, no long slide)
    // - clicking the logo while already on that page slides back to the top
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const [path, fragment] = (e as NavigationEnd).urlAfterRedirects.split('#');
        const samePath = path === this.lastPath;

        if (!samePath) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else if (!fragment) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        this.lastPath = path;
      });
  }
}