import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ModalState } from '../enquiry-modal/modal-state';

@Component({
  selector: 'app-why-choose',
  imports: [],
  templateUrl: './why-choose.html',
  styleUrl: './why-choose.css',
})
export class WhyChoose implements OnInit, AfterViewInit, OnDestroy {
  slides = [
    { src: 'assets/img/hero/elevation-cam03.webp', alt: 'Green Woods tower elevation' },
    { src: 'assets/img/hero/night-view.webp', alt: 'Green Woods night view' },
    { src: 'assets/img/landscape/podium.webp', alt: 'Green Woods podium landscape' },
    { src: 'assets/img/landscape/buddha.webp', alt: 'Green Woods Buddha landscape' },
    { src: 'assets/img/landscape/8-garden.webp', alt: 'Green Woods 8-shaped garden' },
  ];

  points = [
    '1100-Acre Urban Reserve Forest as your neighbour',
    '60% Open Spaces — wellness, recreation, outdoor living',
    '3 Iconic Towers (G+27 Floors) redefining the Bachupally skyline',
    '477 Smartly Planned 2 BHK & 3 BHK Residences',
    '7-Level Exclusive Clubhouse with 60+ amenities',
    'Balconies on All 4 Sides — wake to sunrise, unwind at sunset, with forest views in every direction',
    'RERA Approved — TG-RERA P02200007121',
  ];

  current = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private modal = inject(ModalState);
  private items: HTMLElement[] = [];

  // Height of the sticky header; content under it counts as hidden
  private readonly headerHeight = 110;

  // Opens the Enquire Now pop-up
  openEnquiry(event: Event) {
    event.preventDefault();
    this.modal.show();
  }

  ngOnInit() {
    this.startTimer();
  }

  ngAfterViewInit() {
    this.items = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
    window.addEventListener('scroll', this.updateReveal, { passive: true });
    window.addEventListener('resize', this.updateReveal);
    setTimeout(this.updateReveal, 50);
  }

  ngOnDestroy() {
    this.stopTimer();
    window.removeEventListener('scroll', this.updateReveal);
    window.removeEventListener('resize', this.updateReveal);
  }

  go(index: number) {
    this.current.set(index);
    this.startTimer();
  }

  next() {
    this.go((this.current() + 1) % this.slides.length);
  }

  prev() {
    this.go((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.current.set((this.current() + 1) % this.slides.length);
    }, 5000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
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