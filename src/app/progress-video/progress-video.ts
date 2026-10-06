import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-progress-video',
  imports: [],
  templateUrl: './progress-video.html',
  styleUrl: './progress-video.css',
})
export class ProgressVideo implements AfterViewInit, OnDestroy {
  tabs = [
    { name: 'Overall', pct: 52, note: 'Overall — Mivan Structure Complete' },
    { name: 'Tower A', pct: 50, note: 'Tower A — Structure Progress' },
    { name: 'Tower B', pct: 80, note: 'Tower B — Structure Progress' },
    { name: 'Tower C', pct: 25, note: 'Tower C — Structure Progress' },
  ];

  selected = signal(0);
  current = computed(() => this.tabs[this.selected()]);

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