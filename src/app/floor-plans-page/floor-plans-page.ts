import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PhoneField } from '../phone-field/phone-field';

interface Plan {
  name: string;
  specs: string;
  image: string;
  facing?: 'EAST' | 'WEST';
}
interface Group {
  title: string;
  plans: Plan[];
}

const BASE = 'assets/img/floor-plans/';

@Component({
  selector: 'app-floor-plans-page',
  imports: [RouterLink, PhoneField],
  templateUrl: './floor-plans-page.html',
  styleUrl: './floor-plans-page.css',
})
export class FloorPlansPage implements AfterViewInit, OnDestroy {
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private items: HTMLElement[] = [];
  private readonly headerHeight = 110;

  selected = signal('');
  sent = signal(false);

  groups: Group[] = [
    {
      title: 'Apartments (Blocks A, B, C)',
      plans: [
        { name: 'BLOCK-A-2BHK', specs: '2 BR · 2 Bath · 2 Balconies', image: BASE + 'blockA.png' },
        { name: 'BLOCK-A-3BHK', specs: '3 BR · 3 Bath · 3 Balconies', image: BASE + 'blockA.png' },
        { name: 'BLOCK-B-2BHK', specs: '2 BR · 2 Bath · 2 Balconies', image: BASE + 'blockB.png' },
        { name: 'BLOCK-B-3BHK', specs: '3 BR · 3 Bath · 3 Balconies', image: BASE + 'blockB.png' },
        { name: 'BLOCK-C-2BHK', specs: '2 BR · 2 Bath · 2 Balconies', image: BASE + 'blockC.png' },
        { name: 'BLOCK-C-3BHK', specs: '3 BR · 3 Bath · 3 Balconies', image: BASE + 'blockC.png' },
      ],
    },
    {
      title: 'Sky Villas (Triplex)',
      plans: [
        { name: 'SKY-VILLA-E1', specs: '4 BR · 5 Bath · 4 Balconies', image: BASE + 'skyvillas.png', facing: 'EAST' },
        { name: 'SKY-VILLA-E2', specs: '4 BR · 5 Bath · 4 Balconies', image: BASE + 'skyvillas.png', facing: 'EAST' },
        { name: 'SKY-VILLA-W1', specs: '4 BR · 5 Bath · 4 Balconies', image: BASE + 'skyvillas.png', facing: 'WEST' },
        { name: 'SKY-VILLA-W2', specs: '4 BR · 5 Bath · 4 Balconies', image: BASE + 'skyvillas.png', facing: 'WEST' },
      ],
    },
    {
      title: 'Garden Villas (Duplex)',
      plans: [
        { name: 'GARDEN-VILLA-E', specs: '3 BR · 4 Bath · 3 Balconies', image: BASE + 'gardenvillas.png', facing: 'EAST' },
        { name: 'GARDEN-VILLA-W', specs: '3 BR · 4 Bath · 3 Balconies', image: BASE + 'gardenvillas.png', facing: 'WEST' },
      ],
    },
    {
      title: 'Corner Villas',
      plans: [
        { name: 'CORNER-VILLA-E', specs: '3 BR · 4 Bath · 3 Balconies', image: BASE + 'cornervillas.png', facing: 'EAST' },
        { name: 'CORNER-VILLA-W', specs: '3 BR · 4 Bath · 3 Balconies', image: BASE + 'cornervillas.png', facing: 'WEST' },
      ],
    },
  ];

  /** "Download this plan": preselect the unit and slide down to the form */
  choose(name: string) {
    this.selected.set(name);
    document.getElementById('download-floor-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

    label(p: Plan): string {
    return p.facing ? `${p.name} — ${p.facing === 'EAST' ? 'East' : 'West'} facing` : p.name;
  }

  allPlans = this.groups.flatMap(g => g.plans);

  onSelect(e: Event) {
    this.selected.set((e.target as HTMLSelectElement).value);
  }

  submit(e: Event, form: HTMLFormElement) {
    e.preventDefault();
    this.sent.set(true);
    form.reset();
    this.selected.set('');
    setTimeout(() => this.sent.set(false), 4000);
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