import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, signal } from '@angular/core';

interface Photo {
  src: string;
  caption: string;
}

interface Category {
  id: string;
  label: string;
  photos: Photo[];
}

@Component({
  selector: 'app-gallery-page',
  imports: [],
  templateUrl: './gallery-page.html',
  styleUrl: './gallery-page.css',
})
export class GalleryPage implements AfterViewInit, OnDestroy {
  categories: Category[] = [
    {
      id: 'exterior',
      label: 'Exterior',
      photos: [
        { src: 'assets/img/hero/night-view.webp', caption: 'Bachupally night view' },
        { src: 'assets/img/hero/elevation-cam03.webp', caption: 'Elevation CAM03' },
        { src: 'assets/img/hero/elevation-cam04.webp', caption: 'Elevation CAM04' },
      ],
    },
    {
      id: 'landscape',
      label: 'Landscape',
      photos: [
        { src: 'assets/img/landscape/buddha.webp', caption: 'Buddha Landscape' },
        { src: 'assets/img/landscape/8-garden.webp', caption: '8-Shaped Garden' },
        { src: 'assets/img/landscape/podium.webp', caption: 'Podium Landscape' },
        { src: 'assets/img/landscape/seating.webp', caption: 'Designer Seating' },
        { src: 'assets/img/landscape/cam05.webp', caption: 'Landscape CAM05' },
        { src: 'assets/img/landscape/cam06.webp', caption: 'Landscape CAM06' },
      ],
    },
    {
      id: 'clubhouse',
      label: 'Clubhouse',
      photos: [
        { src: 'assets/img/clubhouse/pool.webp', caption: 'Clubhouse Pool' },
        { src: 'assets/img/clubhouse/club-cam.jpg', caption: 'Clubhouse Exterior' },
      ],
    },
    {
      id: 'interiors',
      label: 'Interiors',
      photos: [
        { src: 'assets/img/interiors/living-dining.webp', caption: 'Living & Dining' },
        { src: 'assets/img/interiors/kitchen.webp', caption: 'Modular Kitchen' },
        { src: 'assets/img/interiors/bedroom.webp', caption: 'Master Bedroom' },
        { src: 'assets/img/interiors/lift-lobby.webp', caption: 'Lift Lobby' },
      ],
    },
  ];

  // The page always opens on Exterior (the first category)
  active = signal(0);
  photos = computed(() => this.categories[this.active()].photos);

  // True only until the first tab change. While true, the Exterior photos
  // play their fade-and-pop. After that, no tab animates.
  intro = signal(true);

  select(index: number) {
    if (index === this.active()) return;
    this.intro.set(false);
    this.active.set(index);
  }

  // ---------- Heading animation (fade up) ----------
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