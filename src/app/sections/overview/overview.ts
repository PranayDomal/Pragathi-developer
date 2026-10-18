import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements AfterViewInit, OnDestroy {
  stats = [
    { value: '3.05', label: 'Acres', word: false },
    { value: '3', label: 'Towers', word: false },
    { value: '27', label: 'Floors / Tower', word: false },
    { value: '477', label: '2 & 3 BHK Apartments', word: false },
    { value: 'Duplex', label: 'Garden Villas', word: true },
    { value: 'Triplex', label: 'Sky Villas', word: true },
    { value: '7', label: 'Level Clubhouse', word: false },
    { value: '5', label: 'Level Car Parking', word: false },
    { value: '60%', label: 'Open Spaces', word: false },
  ];

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