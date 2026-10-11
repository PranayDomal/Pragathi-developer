import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PhoneField } from '../phone-field/phone-field';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-contact-page',
  imports: [PhoneField],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage implements AfterViewInit, OnDestroy {
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];
  private readonly headerHeight = 110;

  private api = inject(ApiService);

  sent = signal(false);
  sending = signal(false);
  already = signal(false);
  error = signal('');

  @ViewChild('contactPhone') contactPhone?: PhoneField;

  // Names must match the Configurations table in the database
  configs = ['Any', '2 BHK Apartment', '3 BHK Apartment', 'Sky Villa (Triplex)', 'Garden Villa (Duplex)', 'Corner Villa'];

  submit(e: Event, form: HTMLFormElement) {
    e.preventDefault();
    if (this.sending()) return;

    const data = new FormData(form);

    this.error.set('');
    this.sending.set(true);

    this.api
      .submit({
        name: String(data.get('name') ?? '').trim(),
        phone: this.contactPhone?.fullNumber() ?? '',
        email: String(data.get('email') ?? '').trim() || undefined,
        type: 'ContactMessage',
        configuration: String(data.get('configuration') ?? 'Any'),
        homeLoan: data.get('loan') === 'Yes',
        message: String(data.get('message') ?? '').trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.already.set(res.alreadyReceived);
          this.sending.set(false);
          this.sent.set(true);
          form.reset();
          setTimeout(() => this.sent.set(false), 4000);
        },
        error: (err: HttpErrorResponse) => {
          this.sending.set(false);
          this.error.set(this.errorText(err));
        },
      });
  }

  private errorText(err: HttpErrorResponse): string {
    if (err.status === 0) return "Can't reach the server. Please try again.";
    if (err.status === 429) return 'Too many attempts. Please wait a minute.';
    const errors = err.error?.errors;
    if (errors) return String(Object.values(errors).flat()[0]);
    return 'Something went wrong. Please try again.';
  }

  ngAfterViewInit() {
    this.items = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
    window.addEventListener('scroll', this.updateReveal, { passive: true });
    window.addEventListener('resize', this.updateReveal);
    setTimeout(this.updateReveal, 50);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.updateReveal);
    window.removeEventListener('resize', this.updateReveal);
  }

  private updateReveal = () => {
    const vh = window.innerHeight;
    this.items.forEach(el => {
      const r = el.getBoundingClientRect();
      const v = Math.min(r.bottom, vh) - Math.max(r.top, this.headerHeight);
      el.classList.toggle('visible', v > el.offsetHeight * 0.25);
    });
  };
}