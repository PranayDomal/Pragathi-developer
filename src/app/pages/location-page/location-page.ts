import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';

@Component({
  selector: 'app-location-page',
  imports: [],
  templateUrl: './location-page.html',
  styleUrl: './location-page.css',
})
export class LocationPage implements AfterViewInit, OnDestroy {
  landmarks = [
    { name: 'Gandi Maisamma X Roads', time: '6 min' },
    { name: 'Gajularamaram', time: '7 min' },
    { name: 'ORR Exit No.5 (Dundigal)', time: '10 min' },
    { name: 'Bowrampet', time: '10 min' },
    { name: 'Bachupally', time: '12 min' },
    { name: "Rao's Cricket Ground", time: '12 min' },
    { name: 'Lulu Mall, Kukatpally', time: '20 min' },
    { name: 'Miyapur', time: '23 min' },
    { name: 'Medical Devices Park', time: '23 min' },
    { name: 'HITEC City', time: '27 min' },
    { name: 'Financial District', time: '40 min' },
  ];

  schools = [
    { name: 'The Creek International School', time: '6 min' },
    { name: 'Sri Sloka School', time: '7 min' },
    { name: 'Delhi Public School', time: '7 min' },
    { name: 'Ambitus World School', time: '8 min' },
    { name: 'Sri Veda Universe The School', time: '8 min' },
    { name: 'VNRVJIET College', time: '8 min' },
    { name: 'Oakridge International School', time: '9 min' },
    { name: 'Silver Oaks International School', time: '12 min' },
    { name: 'Sri Vatsal Gurukul Vidyalaya', time: '14 min' },
    { name: 'DRK College of Engineering', time: '15 min' },
    { name: 'BVRIT College', time: '16 min' },
    { name: 'Narayana IIT JEE College', time: '17 min' },
    { name: 'Gokaraju Rangaraju Institute of Engg. & Technology', time: '17 min' },
    { name: 'JNTU Kukatpally', time: '18 min' },
    { name: 'Sri Vidyanjali Primary School', time: '19 min' },
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