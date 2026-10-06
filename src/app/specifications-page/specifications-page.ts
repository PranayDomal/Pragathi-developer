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

interface SpecCard {
  title: string;
  icon: string[]; // SVG path shapes for the card icon
  rows: [label: string, value: string][];
}

interface SpecTab {
  id: string;
  label: string;
  cards: SpecCard[];
}

// A small rounded square (used for the flooring icon)
const sq = (x: number, y: number) =>
  `M${x + 1.5} ${y}h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5z`;

const BOLT = 'M13 2L4 14h7l-1 8 9-12h-7z';
const GLOBE = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z';

@Component({
  selector: 'app-specifications-page',
  imports: [],
  templateUrl: './specifications-page.html',
  styleUrl: './specifications-page.css',
})
export class SpecificationsPage implements AfterViewInit, OnDestroy {
  tabs: SpecTab[] = [
    {
      id: 'flat',
      label: 'Flat Specifications',
      cards: [
        {
          title: 'Flooring',
          icon: [sq(4, 4), sq(14, 4), sq(4, 14), sq(14, 14)],
          rows: [
            ['Living & Dining', 'Double-charged vitrified tiles, 800×800 mm, premium brand'],
            ['Master Bedroom', 'Vitrified tiles, 600×600 mm, anti-skid finish'],
            ['Other Bedrooms', 'Vitrified tiles, 600×600 mm'],
            ['Kitchen', 'Anti-skid ceramic tiles, 300×300 mm'],
            ['Toilets', 'Anti-skid ceramic tiles, 300×300 mm'],
            ['Balconies', 'Anti-skid vitrified tiles, 600×600 mm'],
            ['Staircase & Corridors', 'Granite / Kota stone'],
          ],
        },
        {
          title: 'Doors & Windows',
          icon: ['M6 4h12a2 2 0 0 1 2 2v3H4V6a2 2 0 0 1 2-2z', 'M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M10 13h4'],
          rows: [
            ['Main Door', 'Teak wood frame, flush door with veneer finish, digital/brass lock'],
            ['Internal Doors', 'Engineered hardwood frame, flush door with laminate finish'],
            ['Toilet Doors', 'WPC frame, waterproof flush door'],
            ['Windows', 'UPVC sliding / casement, single-glazed, with mosquito mesh'],
            ['Ventilators', 'Aluminium louvred ventilators'],
            ['Balcony Railings', 'MS powder-coated or toughened glass railing'],
          ],
        },
        {
          title: 'Kitchen',
          icon: [GLOBE, 'M12 17a3 3 0 0 0 3-3c0-2-3-3-3-6-1.5 1.5-3 3-3 6a3 3 0 0 0 3 3z'],
          rows: [
            ['Counter Platform', 'Black Galaxy granite / engineered stone'],
            ['Sink', 'SS sink, single bowl'],
            ['Wall Tiles (dado)', 'Ceramic tiles up to 2 ft above counter'],
            ['CP Fittings', 'Premium brand — Jaquar / Hindware / equivalent'],
            ['Water Provision', 'Hot & cold water provision for sink + RO + dishwasher'],
          ],
        },
        {
          title: 'Toilets & Bathrooms',
          icon: ['M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z', 'M6 12V7a2 2 0 0 1 4 0', 'M7 19l-1 2M17 19l1 2'],
          rows: [
            ['Sanitary Ware', 'Premium brand — Cera / Hindware / equivalent'],
            ['CP Fittings', 'Jaquar or equivalent — chrome finish'],
            ['Wall Tiles', 'Full-height ceramic tiles, 300×450 mm'],
            ['Floor Tiles', 'Anti-skid ceramic, 300×300 mm'],
            ['Shower Area', 'Overhead shower provision with glass partition in master bath'],
            ['Accessories', 'Towel rod, soap dispenser, mirror — provided'],
          ],
        },
        {
          title: 'Electrical',
          icon: [BOLT],
          rows: [
            ['Wiring', 'Finolex / Havells or equivalent — concealed'],
            ['Switches', 'Modular switches — Legrand / Schneider / equivalent'],
            ['MCB / DB', 'Individual MCB for each circuit; RCCB at main DB'],
            ['Points', 'Adequate power points in all rooms; AC provision in all bedrooms & living'],
            ['Internet', 'CAT6 cabling provision in living, master bedroom'],
            ['TV Points', 'Provision in living room and master bedroom'],
          ],
        },
        {
          title: 'Painting & Finishes',
          icon: ['M18 3l3 3-9 9-3-3z', 'M9 12c-2.5 0-4 2-4 4.5 0 1.2-1 2.2-2 2.5 3 1 8 .5 8-4.5z'],
          rows: [
            ['Internal Walls', '2 coats OBD / premium emulsion (Berger / Asian / equivalent)'],
            ['External Facade', 'Exterior weather-resistant paint / texture finish'],
            ['Ceiling', 'White OBD / premium distemper'],
            ['Kitchen Ceiling', 'Oil-bound distemper, moisture-resistant'],
          ],
        },
      ],
    },
    {
      id: 'building',
      label: 'Building Specifications',
      cards: [
        {
          title: 'Structure & Foundation',
          icon: ['M12 3l8 4.5v9L12 21l-8-4.5v-9z', 'M4 7.5l8 4.5 8-4.5', 'M12 12v9'],
          rows: [
            ['Design Standard', 'RCC framed structure, IS 456 compliant'],
            ['Seismic Zone', 'Zone II — earthquake-resistant design as per IS 1893'],
            ['Foundation', 'Raft / pile foundation as per soil report'],
            ['Columns & Slabs', 'M25 / M30 grade concrete; Fe 500 TMT steel'],
            ['Design Life', 'Minimum 75 years'],
          ],
        },
        {
          title: 'Masonry & Plastering',
          icon: ['M5 21V4h9v17', 'M14 9h5v12', 'M8 8h3M8 12h3M8 16h3M16 13h1M16 17h1', 'M3 21h18'],
          rows: [
            ['External Walls', '8-inch AAC / fly-ash brick masonry'],
            ['Internal Walls', '4-inch AAC / fly-ash brick partition walls'],
            ['Plastering', '12 mm sand-cement plaster internally; 15 mm polymer-modified externally'],
            ['Waterproofing', 'Crystalline waterproofing for terraces; integral for bathrooms'],
          ],
        },
        {
          title: 'Lifts & Vertical Transport',
          icon: ['M12 20V5', 'M6 11l6-6 6 6'],
          rows: [
            ['Number', '3 passenger lifts per tower + 1 service lift per tower'],
            ['Brand', 'Otis / Kone / Schindler or equivalent'],
            ['Capacity', '8–13 persons (630–1000 kg)'],
            ['Speed', '1.5 m/s passenger, 1.0 m/s service'],
            ['Features', 'ARD (Automatic Rescue Device), V3F energy-saving drive'],
            ['Car Parking', 'Stacker / mechanical parking system — 5 levels'],
          ],
        },
        {
          title: 'Power Backup',
          icon: [BOLT, 'M3 3l18 18'],
          rows: [
            ['DG Set Capacity', '100% backup for common areas, lifts, pumps'],
            ['Apartment Provision', '1–2 kW per apartment during power failure'],
            ['Fuel', 'Diesel; housed in a soundproofed enclosure'],
            ['AMF Panel', 'Auto-Mains Failure panel with auto-changeover'],
          ],
        },
        {
          title: 'Security Systems',
          icon: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M8.5 12l2.5 2.5 4.5-5'],
          rows: [
            ['CCTV', 'IP cameras at all entry/exit points, lift lobbies, common areas'],
            ['Access Control', 'Smart card / biometric access at main gate and podium'],
            ['Video Door Phone', 'Colour video door phone for each apartment'],
            ['Intercom', 'Internal intercom connecting all apartments to security desk'],
            ['Boom Barriers', 'Vehicle management at entry and exit'],
            ['Security Cabin', '24×7 manned security post'],
          ],
        },
        {
          title: 'Green Features & Sustainability',
          icon: [GLOBE, 'M3.5 14c3-1 5-.5 7 1.5s4.5 2.5 9.5.5', 'M8 6c1.5 2 1 4 3 5s4 0 6-2'],
          rows: [
            ['Rainwater Harvesting', 'Rooftop collection with percolation pits'],
            ['STP', 'Sewage Treatment Plant — treated water used for landscaping'],
            ['Solar Panels', 'Solar panels for common area lighting'],
            ['EV Charging', 'Provision for EV charging in parking podium'],
            ['Waste Management', 'Segregated wet & dry waste collection system'],
            ['Energy Efficiency', 'LED lighting in all common areas'],
          ],
        },
      ],
    },
  ];

  // The page always opens on Flat Specifications
  active = signal(0);
  cards = computed(() => this.tabs[this.active()].cards);

  private modal = inject(ModalState);

  select(index: number) {
    if (index === this.active()) return;
    this.active.set(index);
    // The new cards have just been drawn: pick them up and fade them in
    setTimeout(() => {
      this.collect();
      this.updateReveal();
    }, 30);
  }

  // Opens the Enquire Now pop-up
  openEnquiry(event: Event) {
    event.preventDefault();
    this.modal.show();
  }

  // ---------- Fade up from below ----------
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];

  // Height of the sticky header; content under it counts as hidden
  private readonly headerHeight = 110;

  private collect() {
    this.items = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
  }

  ngAfterViewInit() {
    this.collect();
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