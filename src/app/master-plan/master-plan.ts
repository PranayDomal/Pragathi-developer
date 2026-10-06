import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-master-plan',
  imports: [RouterLink],
  templateUrl: './master-plan.html',
  styleUrl: './master-plan.css',
})
export class MasterPlan implements AfterViewInit, OnDestroy {
  // x and y are the marker positions as a % of the map image
  items = [
    { n: 1, label: 'Main Entry & Drop-off Plaza', x: 74, y: 60 },
    { n: 2, label: 'Tower A', x: 34, y: 40 },
    { n: 3, label: 'Tower B', x: 55, y: 27 },
    { n: 4, label: 'Tower C', x: 58, y: 46 },
    { n: 5, label: '7-Level Exclusive Clubhouse', x: 29, y: 24 },
    { n: 6, label: 'Terrace Swimming Pool & Deck', x: 36, y: 24 },
    { n: 7, label: '8-Shaped Garden', x: 76, y: 47 },
    { n: 8, label: 'Buddha Landscape', x: 66, y: 30 },
    { n: 9, label: 'Designer Walkways & Seating', x: 55, y: 40 },
    { n: 10, label: 'Children Play Area', x: 44, y: 38 },
    { n: 11, label: 'Basketball Court', x: 42, y: 48 },
    { n: 12, label: 'Outdoor Yoga Lawn', x: 45, y: 34 },
    { n: 13, label: 'Amphitheater', x: 53, y: 12 },
    { n: 14, label: 'Skating Rink', x: 49, y: 15 },
  ];

   // Number picked by clicking (for touch screens)
  active = signal<number | null>(null);

  // Number the mouse is currently over
  hover = signal<number | null>(null);

  // The number to highlight: the hovered one wins, otherwise the clicked one
  shown = computed(() => this.hover() ?? this.active());

  
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items$: HTMLElement[] = [];

  // Height of the sticky header; content under it counts as hidden
  private readonly headerHeight = 110;

  select(n: number) {
    this.active.set(this.active() === n ? null : n);
  }

  ngAfterViewInit() {
    this.items$ = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
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
    this.items$.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const visiblePart =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, this.headerHeight);
      el.classList.toggle('visible', visiblePart > el.offsetHeight * 0.25);
    });
  };
}