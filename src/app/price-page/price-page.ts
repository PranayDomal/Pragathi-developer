import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ModalState } from '../enquiry-modal/modal-state';

@Component({
  selector: 'app-price-page',
  standalone: true,
  imports: [],
  templateUrl: './price-page.html',
  styleUrl: './price-page.css',
})
export class PricePage implements AfterViewInit, OnDestroy {
  plans = [
    { title: '2 BHK Apartments', sub: 'BLOCKS A, B & C', price: 'On Request', size: 'TBA', variants: '3 variants' },
    { title: '3 BHK Apartments', sub: 'BLOCKS A, B & C', price: 'On Request', size: 'TBA', variants: '3 variants' },
    { title: 'Sky & Garden Villas', sub: 'TRIPLEX · DUPLEX · CORNER', price: 'On Request', size: 'TBA', variants: '8 variants' },
  ];

  taxes = [
    { value: 5, name: 'GST' },
    { value: 5.5, name: 'STAMP DUTY' },
    { value: 0.5, name: 'REGISTRATION' },
    { value: 1.5, name: 'TRANSFER DUTY' },
  ];

  totalTax = this.taxes.reduce((sum, t) => sum + t.value, 0).toFixed(2);

  // ---------- EMI calculator ----------
  // Initial default values matching the original screenshot
  loan = signal(7500000); // Default ₹ 75,00,000
  years = signal(20);      // Default 20 years
  rate = signal(8.5);      // Default 8.5%

  private inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  // Monthly EMI = P × r × (1+r)^n / ((1+r)^n − 1)
  emi = computed(() => {
    const p = this.loan();
    const n = this.years() * 12;
    const r = this.rate() / 1200;
    if (!(p > 0) || !(n > 0) || !(r >= 0)) return null;
    if (r === 0) return p / n;
    const f = Math.pow(1 + r, n);
    return (p * r * f) / (f - 1);
  });

  totalPayable = computed(() => {
    const e = this.emi();
    return e === null ? null : e * this.years() * 12;
  });

  totalInterest = computed(() => {
    const t = this.totalPayable();
    return t === null ? null : t - this.loan();
  });

  show(value: number | null) {
    return value === null ? '₹ —' : '₹ ' + this.inr.format(Math.round(value));
  }

  formatLoanDisplay(val: number): string {
    return this.inr.format(val);
  }

  onLoan(event: Event) {
    const input = event.target as HTMLInputElement;
    this.loan.set(Number(input.value));
  }

  onYears(event: Event) {
    const input = event.target as HTMLInputElement;
    this.years.set(Number(input.value));
  }

  onRate(event: Event) {
    const input = event.target as HTMLInputElement;
    this.rate.set(Number(input.value));
  }

  // ---------- Enquire Now pop-up ----------
  private modal = inject(ModalState);

  openEnquiry(event?: Event) {
    event?.preventDefault();
    this.modal.show();
  }

  // ---------- Fade up from below ----------
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];
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