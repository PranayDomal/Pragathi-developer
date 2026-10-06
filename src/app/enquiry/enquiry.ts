import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { PhoneField } from '../phone-field/phone-field';
import { ModalState } from '../enquiry-modal/modal-state';

@Component({
  selector: 'app-enquiry',
  imports: [PhoneField],
  templateUrl: './enquiry.html',
  styleUrl: './enquiry.css',
})
export class Enquiry implements AfterViewInit, OnDestroy {
  // Shows the thank-you message after the form is submitted
  sent = signal(false);

  private modal = inject(ModalState);

  // Opens the Book a Site Visit pop-up
  openVisit(event: Event) {
    event.preventDefault();
    this.modal.showVisit();
  }

  // The browser checks the required fields before this runs.
  // There is no backend yet, so we only show a message and clear the form.
  onSubmit(event: Event) {
    event.preventDefault();
    this.sent.set(true);
    (event.target as HTMLFormElement).reset();
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