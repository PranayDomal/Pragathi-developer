import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PhoneField } from '../../shared/phone-field/phone-field';
import { ModalState } from '../../shared/enquiry-modal/modal-state';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-enquiry',
  imports: [PhoneField],
  templateUrl: './enquiry.html',
  styleUrl: './enquiry.css',
})
export class Enquiry implements AfterViewInit, OnDestroy {

  private api = inject(ApiService);

  sent = signal(false);
  sending = signal(false);
  already = signal(false);
  error = signal('');

@ViewChild('homePhone') homePhone?: PhoneField;

  private modal = inject(ModalState);

  // Opens the Book a Site Visit pop-up
  openVisit(event: Event) {
    event.preventDefault();
    this.modal.showVisit();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.sending()) return;

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    // Budget and best time have no database column, so they go in front of the message
    const parts: string[] = [];
    const budget = String(data.get('budget') ?? '');
    const time = String(data.get('time') ?? '');
    const note = String(data.get('message') ?? '').trim();
    if (budget && budget !== 'Not Sure') parts.push(`Budget: ${budget}`);
    if (time && time !== 'Anytime') parts.push(`Best time to call: ${time}`);
    if (note) parts.push(note);

    this.error.set('');
    this.sending.set(true);

    this.api
      .submit({
        name: String(data.get('name') ?? '').trim(),
        phone: this.homePhone?.fullNumber() ?? '',
        email: String(data.get('email') ?? '').trim() || undefined,
        type: 'Enquiry',
        configuration: String(data.get('interest') ?? 'Any'),
        homeLoan: data.get('loan') === 'Yes',
        message: parts.join('\n') || undefined,
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

  // ---------- Scroll animation ----------
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];

  // Height of the sticky header; content under it counts as hidden
  private readonly headerHeight = 110;

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

  // Shows a block when at least 25% of it is visible below the header
  private updateReveal = () => {
    const viewportHeight = window.innerHeight;
    this.items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const visiblePart =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, this.headerHeight);
      el.classList.toggle('visible', visiblePart > el.offsetHeight * 0.25);
    });
  };
}