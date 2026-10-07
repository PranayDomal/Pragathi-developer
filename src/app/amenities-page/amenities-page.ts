import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { ModalState } from '../enquiry-modal/modal-state';

interface Amenity {
  name: string;
  featured?: boolean;
  image?: string;
}
interface Category {
  title: string;
  items: Amenity[];
}

const IMG = 'assets/img/';

@Component({
  selector: 'app-amenities-page',
  imports: [],
  templateUrl: './amenities-page.html',
  styleUrl: './amenities-page.css',
})
export class AmenitiesPage implements AfterViewInit, OnDestroy {
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private modal = inject(ModalState);
  private items: HTMLElement[] = [];
  private readonly headerHeight = 110;

  categories: Category[] = [
    {
      title: 'Wellness',
      items: [
        { name: 'Buddha Landscape', featured: true, image: IMG + 'landscape/buddha.webp' },
        { name: 'Centralized A/c Gym', featured: true },
        { name: 'Outdoor Yoga' },
        { name: 'Meditation Garden' },
      ],
    },
    {
      title: 'Sports',
      items: [
        { name: 'Basketball Court', featured: true },
        { name: 'Multi-purpose Sports Court', featured: true },
        { name: 'Badminton Court' },
        { name: 'Squash Court' },
        { name: 'Table Tennis' },
        { name: 'Cricket Net' },
      ],
    },
    {
      title: 'Recreation',
      items: [
        { name: 'Party Deck Area', featured: true, image: IMG + 'landscape/cam06.webp' },
        { name: 'Terrace Swimming Pool with Deck', featured: true, image: IMG + 'clubhouse/pool.webp' },
        { name: 'Event Space', featured: true, image: IMG + 'clubhouse/club-cam.jpg' },
        { name: 'Indoor Games Enclave', featured: true },
        { name: 'Home Theatre', featured: true },
        { name: 'Multi Purpose Hall', featured: true },
      ],
    },
    {
      title: 'Business',
      items: [
        { name: 'A/c Business Lounges', featured: true, image: IMG + 'interiors/living-dining.webp' },
        { name: 'Conference Rooms', featured: true, image: IMG + 'interiors/lift-lobby.webp' },
        { name: 'Library & Study Spaces', featured: true },
        { name: 'Co-working Pods' },
        { name: 'High-speed Wi-Fi Zones' },
      ],
    },
    {
      title: 'Kids',
      items: [
        { name: 'Children Play Area', featured: true },
        { name: 'Kids Pool', featured: true },
        { name: 'Sand Pit' },
        { name: 'Hobby Pavilion' },
        { name: 'Graffiti Wall' },
        { name: 'Skating Rink' },
        { name: 'Mini Amphitheatre' },
      ],
    },
    {
      title: 'Outdoor & Landscape',
      items: [
        { name: 'Designer Seating Areas', featured: true, image: IMG + 'landscape/seating.webp' },
        { name: 'Podium Landscape', featured: true, image: IMG + 'landscape/podium.webp' },
        { name: 'Spacious Outdoors', featured: true, image: IMG + 'landscape/cam05.webp' },
        { name: '8-Shaped Garden', featured: true, image: IMG + 'landscape/8-garden.webp' },
        { name: 'Designer Landscaping' },
        { name: 'Designer Walkways' },
        { name: 'Pergola Zones' },
      ],
    },
    {
      title: 'Convenience',
      items: [
        { name: 'Two Guest Suites', featured: true, image: IMG + 'interiors/bedroom.webp' },
        { name: 'Super Market', featured: true },
        { name: 'Maintenance Office' },
      ],
    },
  ];

  total = this.categories.reduce((n, c) => n + c.items.length, 0);

  openEnquiry() {
    this.modal.show();
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