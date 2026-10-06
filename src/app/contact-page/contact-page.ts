import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { PhoneField } from '../phone-field/phone-field';

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

  sent = signal(false);
  configs = ['Any', '2 BHK', '3 BHK', 'Sky Villa (Triplex)', 'Garden Villa (Duplex)', 'Corner Villa'];

  submit(e: Event, form: HTMLFormElement) {
    e.preventDefault();
    this.sent.set(true);
    form.reset();
    setTimeout(() => this.sent.set(false), 4000);
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