import { Injectable, computed, signal } from '@angular/core';

export type ModalMode = 'enquiry' | 'visit';

// One shared "which pop-up is open?" switch for the whole site
@Injectable({ providedIn: 'root' })
export class ModalState {
  // null means closed
  mode = signal<ModalMode | null>(null);
  isOpen = computed(() => this.mode() !== null);

  // Enquire Now pop-up (the header buttons and Why Choose use this one)
  show() {
    this.mode.set('enquiry');
  }

  // Book a Site Visit pop-up
  showVisit() {
    this.mode.set('visit');
  }

  hide() {
    this.mode.set(null);
  }
}