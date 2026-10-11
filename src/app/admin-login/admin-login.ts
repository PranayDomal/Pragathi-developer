import { Component, ElementRef, HostListener, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_FLAG, AdminLoginState } from './admin-login-state';

// DEV MODE ONLY: checked in the browser, not on the server
const DEV_ID = 'admin';
const DEV_PASSWORD = 'admin';

@Component({
  selector: 'app-admin-login',
  imports: [],
  templateUrl: './admin-login.html',
  styleUrl: '../enquiry-modal/enquiry-modal.css', // same look as Enquire Now
})
export class AdminLogin implements OnDestroy {
  state = inject(AdminLoginState);
  private router = inject(Router);

  error = signal('');

  @ViewChild('idInput') idInput?: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const open = this.state.isOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        setTimeout(() => this.idInput?.nativeElement.focus(), 60);
      }
    });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  close() {
    this.state.hide();
    this.error.set('');
  }

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.state.isOpen()) this.close();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const id = String(data.get('id') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (id === DEV_ID && password === DEV_PASSWORD) {
      sessionStorage.setItem(ADMIN_FLAG, '1');
      this.close();
      this.router.navigateByUrl('/admin');
    } else {
      this.error.set('Wrong ID or password.');
    }
  }
}