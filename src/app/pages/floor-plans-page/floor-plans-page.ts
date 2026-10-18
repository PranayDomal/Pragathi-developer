import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PhoneField } from '../../shared/phone-field/phone-field';
import { ApiService } from '../../core/services/api.service';

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

  private api = inject(ApiService);

  sending = signal(false);
  already = signal(false);
  error = signal('');

  @ViewChild('fpPhone') fpPhone?: PhoneField;

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
    if (this.sending()) return;

    const data = new FormData(form);
    const plan = String(data.get('plan') ?? '');
    const loan = data.get('loan');

    this.error.set('');
    this.sending.set(true);

    this.api
      .submit({
        name: String(data.get('name') ?? '').trim(),
        phone: this.fpPhone?.fullNumber() ?? '',
        email: String(data.get('email') ?? '').trim() || undefined,
        type: 'FloorPlanDownload',
        configuration: this.configurationFor(plan),
        homeLoan: loan === null ? undefined : loan === 'Yes',
        detail: plan,
      })
      .subscribe({
        next: (res) => {
          this.already.set(res.alreadyReceived);
          this.sending.set(false);
          this.download(plan);
          this.sent.set(true);
          form.reset();
          this.selected.set('');
          setTimeout(() => this.sent.set(false), 4000);
        },
        error: (err: HttpErrorResponse) => {
          this.sending.set(false);
          this.error.set(this.errorText(err));
        },
      });
  }

  // Maps a plan name to the configuration names stored in the database
  private configurationFor(plan: string): string {
    if (plan.includes('2BHK')) return '2 BHK Apartment';
    if (plan.includes('3BHK')) return '3 BHK Apartment';
    if (plan.startsWith('SKY-VILLA')) return 'Sky Villa (Triplex)';
    if (plan.startsWith('GARDEN-VILLA')) return 'Garden Villa (Duplex)';
    if (plan.startsWith('CORNER-VILLA')) return 'Corner Villa';
    return 'Any';
  }

  private download(planName: string) {
    const plan = this.allPlans.find((p) => p.name === planName);
    if (!plan) return;
    const ext = plan.image.split('.').pop() ?? 'png';
    const a = document.createElement('a');
    a.href = plan.image;
    a.download = `${plan.name}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private errorText(err: HttpErrorResponse): string {
    if (err.status === 0) return "Can't reach the server. Please try again.";
    if (err.status === 429) return 'Too many attempts. Please wait a minute.';
    const errors = err.error?.errors;
    if (errors) return String(Object.values(errors).flat()[0]);
    return 'Something went wrong. Please try again.';
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