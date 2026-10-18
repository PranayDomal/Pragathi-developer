import { Component, ElementRef, HostListener, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminLoginState } from './admin-login-state';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [],
  templateUrl: './admin-login.html',
  styleUrl: '../../shared/enquiry-modal/enquiry-modal.css', // same look as Enquire Now
})
export class AdminLogin implements OnDestroy {
  state = inject(AdminLoginState);
  private router = inject(Router);

  private auth = inject(AdminAuthService);
  busy = signal(false);

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

     async onSubmit(event: Event) {
      event.preventDefault();
      if (this.busy()) return;

      const data = new FormData(event.target as HTMLFormElement);
      const id = String(data.get('id') ?? '').trim();
      const password = String(data.get('password') ?? '');

      this.busy.set(true);
      this.error.set('');
      const result = await this.auth.login(id, password);
      this.busy.set(false);

      if (result === 'ok') {
        this.close();
        this.router.navigateByUrl('/admin');
      } else if (result === 'wrong') {
        this.error.set('Wrong ID or password.');
      } else if (result === 'disabled') {
        this.error.set('This account is switched off. Please contact your administrator.');
      } else if (result === 'busy') {
        this.error.set('Too many attempts. Please wait a minute and try again.');
      } else {
        this.error.set("Can't reach the server. It may be waking up, so please try again in a moment.");
      }
    }
}