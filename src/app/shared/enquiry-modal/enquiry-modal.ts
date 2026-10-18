import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ModalState } from './modal-state';
import { PhoneField } from '../phone-field/phone-field';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, SubmitRequest } from '../../core/services/api.service';


@Component({
  selector: 'app-enquiry-modal',
  imports: [PhoneField],
  templateUrl: './enquiry-modal.html',
  styleUrl: './enquiry-modal.css',
})
export class EnquiryModal implements OnDestroy {
  modal = inject(ModalState);

  // Shows the thank-you message after the form is submitted
  sent = signal(false);

  private api = inject(ApiService);

  sending = signal(false);
  error = signal('');
  already = signal(false);

  @ViewChild('enqPhone') enqPhone?: PhoneField;

  @ViewChild('visitPhone') visitPhone?: PhoneField;

 // Which of the three forms is showing
  isVisit = computed(() => this.modal.mode() === 'visit');
  isBrochure = computed(() => this.modal.mode() === 'brochure');
 
  private pick(visit: string, brochure: string, enquiry: string): string {
    const m = this.modal.mode();
    return m === 'visit' ? visit : m === 'brochure' ? brochure : enquiry;
  }

  title = computed(() => this.pick('Book a Site Visit', 'Enquire Now', 'Enquire Now'));

  subtitle = computed(() =>
    this.pick(
      "Pick a date and time — we'll confirm via SMS & WhatsApp.",
      'Get a callback within 24 hours from our sales team.',
      'Get a callback within 24 hours from our sales team.',
    ),
  );

  doneTitle = computed(() =>
    this.pick('Visit request received!', 'Thank you!', 'Thank you!'),
  );

  doneText = computed(() =>
    this.pick(
      "We'll confirm your visit by WhatsApp and SMS shortly.",
      'Our sales team may also reach out to you shortly.',
      'Our sales team will contact you within 24 hours.',
    ),
  );

  // Earliest date that can be picked: today, in the visitor's own time zone
  get today() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  constructor() {
    // Runs whenever the pop-up opens or closes
    effect(() => {
      const open = this.modal.isOpen();
      // Stop the page behind from scrolling while the pop-up is open
      document.body.style.overflow = open ? 'hidden' : '';
      // Put the cursor in the Name field
      if (open) {
        setTimeout(() => this.nameInput?.nativeElement.focus(), 60);
      }
    });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  close() {
    this.modal.hide();
    this.sent.set(false);
    this.already.set(false);
    this.error.set('');
  }

  // Clicking the dark area outside the card closes the pop-up
  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Esc closes the pop-up
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.modal.isOpen()) {
      this.close();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.sending()) return;

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const visit = this.isVisit();
    const brochure = this.isBrochure();

    const body: SubmitRequest = {
      name: String(data.get('name') ?? '').trim(),
      phone: (visit ? this.visitPhone : this.enqPhone)?.fullNumber() ?? '',
      email: String(data.get('email') ?? '').trim() || undefined,
      type: visit ? 'SiteVisit' : brochure ? 'BrochureDownload' : 'Enquiry',
      configuration: String(data.get(visit ? 'bhk' : 'configuration') ?? 'Any'),
      homeLoan: data.get('loan') === 'Yes',
    };

    if (visit) {
      body.visitDetails = {
        preferredDate: String(data.get('date') ?? ''),
        timeSlot: String(data.get('time') ?? ''),
        visitors: parseInt(String(data.get('visitors') ?? '1'), 10) || 1,
      };
    }
      this.error.set('');
      this.sending.set(true);

      this.api.submit(body).subscribe({
        next: (res) => {
          this.already.set(res.alreadyReceived);
          this.sending.set(false);
          if (brochure) this.downloadBrochure();
          this.sent.set(true);
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

  private downloadBrochure() {
    const a = document.createElement('a');
    a.href = 'assets/brochure/Green-Woods-Brochure.pdf';
    a.download = 'Green-Woods-Brochure.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}