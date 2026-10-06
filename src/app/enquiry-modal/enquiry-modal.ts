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

  // Which of the two forms is showing
  isVisit = computed(() => this.modal.mode() === 'visit');

  title = computed(() => (this.isVisit() ? 'Book a Site Visit' : 'Enquire Now'));

  subtitle = computed(() =>
    this.isVisit()
      ? "Pick a date and time — we'll confirm via SMS & WhatsApp."
      : 'Get a callback within 24 hours from our sales team.',
  );

  doneTitle = computed(() => (this.isVisit() ? 'Visit request received!' : 'Thank you!'));

  doneText = computed(() =>
    this.isVisit()
      ? "We'll confirm your visit by WhatsApp and SMS shortly."
      : 'Our sales team will contact you within 24 hours.',
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

  // The browser checks the required fields before this runs.
  // There is no backend yet, so we only show a message and clear the form.
  onSubmit(event: Event) {
    event.preventDefault();
    this.sent.set(true);
    (event.target as HTMLFormElement).reset();
  }
}