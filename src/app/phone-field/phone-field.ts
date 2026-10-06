import { Component, ElementRef, HostListener, ViewChild, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-phone-field',
  imports: [],
  templateUrl: './phone-field.html',
  styleUrl: './phone-field.css',
})
export class PhoneField {
  // Settings the parent can pass in
  inputId = input('phone');
  required = input(true);

  countries = [
    { name: 'India', dial: '+91', iso: 'in' },
    { name: 'United Arab Emirates', dial: '+971', iso: 'ae' },
    { name: 'United States', dial: '+1', iso: 'us' },
    { name: 'United Kingdom', dial: '+44', iso: 'gb' },
    { name: 'Canada', dial: '+1', iso: 'ca' },
    { name: 'Australia', dial: '+61', iso: 'au' },
    { name: 'Singapore', dial: '+65', iso: 'sg' },
    { name: 'Saudi Arabia', dial: '+966', iso: 'sa' },
    { name: 'Qatar', dial: '+974', iso: 'qa' },
    { name: 'Kuwait', dial: '+965', iso: 'kw' },
    { name: 'Oman', dial: '+968', iso: 'om' },
    { name: 'Bahrain', dial: '+973', iso: 'bh' },
    { name: 'Germany', dial: '+49', iso: 'de' },
    { name: 'France', dial: '+33', iso: 'fr' },
    { name: 'New Zealand', dial: '+64', iso: 'nz' },
    { name: 'Malaysia', dial: '+60', iso: 'my' },
  ];

  open = signal(false);
  query = signal('');
  selected = signal(this.countries[0]);

  // Countries that match what was typed in the search box (name or dial code)
  filtered = computed(() => {
    const q = this.query().trim().toLowerCase().replace('+', '');
    if (!q) return this.countries;
    return this.countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.replace('+', '').includes(q),
    );
  });

  @ViewChild('searchBox') searchBox?: ElementRef<HTMLInputElement>;

  flagUrl(iso: string) {
    return `https://flagcdn.com/w40/${iso}.png`;
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) {
      this.query.set('');
      // Wait for the panel to appear, then put the cursor in the search box
      setTimeout(() => this.searchBox?.nativeElement.focus());
    }
  }

  choose(country: { name: string; dial: string; iso: string }) {
    this.selected.set(country);
    this.open.set(false);
  }

  onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }

  // Clicking anywhere outside the picker closes it
  @HostListener('document:click')
  closePicker() {
    this.open.set(false);
  }
}