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
  imports: [],
  templateUrl: './price-page.html',
  styleUrl: './price-page.css',
})
export class PricePage implements AfterViewInit, OnDestroy {
  plans = [
    { title: '2 BHK Apartments', sub: 'Blocks A, B & C', price: 'On Request', size: 'TBA', variants: '3 variants' },
    { title: '3 BHK Apartments', sub: 'Blocks A, B & C', price: 'On Request', size: 'TBA', variants: '3 variants' },
    { title: 'Sky & Garden Villas', sub: 'Triplex · Duplex · Corner', price: 'On Request', size: 'TBA', variants: '8 variants' },
  ];

  taxes = [
    { value: 5, name: 'GST' },
    { value: 5.5, name: 'Stamp Duty' },
    { value: 0.5, name: 'Registration' },
    { value: 1.5, name: 'Transfer Duty' },
  ];

  // 5 + 5.5 + 0.5 + 1.5 = 12.50
  totalTax = this.taxes.reduce((sum, t) => sum + t.value, 0).toFixed(2);

  // ---------- EMI calculator (sliders) ----------
  // These ends must match the min / max written on the sliders in price-page.html
  private readonly loanMin = 500000; // ₹ 5,00,000
  private readonly loanMax = 50000000; // ₹ 5,00,00,000
  private readonly yearsMin = 5;
  private readonly yearsMax = 30;
  private readonly rateMin = 6;
  private readonly rateMax = 14;

  loan = signal(7500000); // ₹ 75,00,000
  years = signal(20);
  rate = signal(8.5);

  // How far along each slider is (0 to 1); the CSS uses it to colour the filled part
  loanPos = computed(() => (this.loan() - this.loanMin) / (this.loanMax - this.loanMin));
  yearsPos = computed(() => (this.years() - this.yearsMin) / (this.yearsMax - this.yearsMin));
  ratePos = computed(() => (this.rate() - this.rateMin) / (this.rateMax - this.rateMin));

  private inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  // Monthly EMI = P × r × (1+r)^n / ((1+r)^n − 1)
  emi = computed(() => {
    const p = this.loan();
    const n = this.years() * 12;
    const r = this.rate() / 1200;
    const f = Math.pow(1 + r, n);
    return (p * r * f) / (f - 1);
  });

  totalPayable = computed(() => this.emi() * this.years() * 12);
  totalInterest = computed(() => this.totalPayable() - this.loan());

  // 7500000 -> "₹ 75,00,000"
  money(value: number) {
    return '₹ ' + this.inr.format(Math.round(value));
  }

  onLoan(event: Event) {
    this.loan.set(Number((event.target as HTMLInputElement).value));
  }

  onYears(event: Event) {
    this.years.set(Number((event.target as HTMLInputElement).value));
  }

  onRate(event: Event) {
    this.rate.set(Number((event.target as HTMLInputElement).value));
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