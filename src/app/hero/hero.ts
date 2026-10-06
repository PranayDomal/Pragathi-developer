import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit, AfterViewInit, OnDestroy {
  slides = [
    { src: 'assets/img/hero/night-view.webp', alt: 'Green Woods Bachupally night view' },
    { src: 'assets/img/hero/elevation-cam03.webp', alt: 'Green Woods tower elevation' },
    { src: 'assets/img/hero/elevation-cam04.webp', alt: 'Green Woods community elevation' },
  ];

  current = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];

  // Height of the sticky header; text going under it counts as "hidden"
  private readonly headerHeight = 110;

  ngOnInit() {
    this.startTimer();
  }

  ngAfterViewInit() {
    this.items = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
    window.addEventListener('scroll', this.updateReveal, { passive: true });
    window.addEventListener('resize', this.updateReveal);
    // Run once after the first paint so the page-load animation plays
    setTimeout(this.updateReveal, 50);
  }

  ngOnDestroy() {
    this.stopTimer();
    window.removeEventListener('scroll', this.updateReveal);
    window.removeEventListener('resize', this.updateReveal);
  }

  // Shows an element when at least 25% of it is visible below the header
  private updateReveal = () => {
    const viewportHeight = window.innerHeight;
    this.items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const height = el.offsetHeight;
      const visiblePart = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, this.headerHeight);
      el.classList.toggle('visible', visiblePart > height * 0.25);
    });
  };

  next() {
    this.current.set((this.current() + 1) % this.slides.length);
    this.startTimer();
  }

  prev() {
    this.current.set((this.current() - 1 + this.slides.length) % this.slides.length);
    this.startTimer();
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
}