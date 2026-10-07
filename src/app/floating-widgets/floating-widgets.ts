import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { ModalState } from '../enquiry-modal/modal-state';

interface Msg {
  from: 'bot' | 'user';
  text: string;
}
type Step = 'name' | 'config' | 'budget' | 'timeline' | 'phone' | 'time' | 'done';

@Component({
  selector: 'app-floating-widgets',
  imports: [],
  templateUrl: './floating-widgets.html',
  styleUrl: './floating-widgets.css',
})
export class FloatingWidgets {
  private modal = inject(ModalState);

  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;
  @ViewChild('box') box?: ElementRef<HTMLInputElement>;

  readonly whatsappUrl =
    'https://wa.me/917569397676?text=' +
    encodeURIComponent("Hi Pragathi Developers, I'm interested in Green Woods, Bachupally.");

  open = signal(false);
  seen = signal(false);
  busy = signal(false);
  step = signal<Step>('name');
  messages = signal<Msg[]>([]);

  private readonly options: Partial<Record<Step, string[]>> = {
    config: ['2 BHK Apartment', '3 BHK Apartment', 'Sky Villa (Triplex)', 'Garden Villa (Duplex)', 'Corner Villa', 'Just exploring'],
    budget: ['₹90L – ₹1.2 Cr', '₹1.2 – ₹1.8 Cr', '₹1.8 Cr+', 'Not sure yet'],
    timeline: ['Immediately', 'Within 3 months', 'Within 6 months', 'Just exploring'],
    time: ['Morning', 'Afternoon', 'Evening', 'Weekend'],
  };

  chips = computed(() => this.options[this.step()] ?? []);
  isText = computed(() => this.step() === 'name' || this.step() === 'phone');
  isDone = computed(() => this.step() === 'done');

  toggle() {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.seen.set(true);
      if (this.messages().length === 0) this.start();
      this.afterUpdate();
    }
  }

  close() {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) this.close();
  }

  openEnquiry() {
    this.modal.show();
  }

  /** Start (or restart) the fixed conversation */
  start() {
    this.busy.set(false);
    this.step.set('name');
    this.messages.set([
      { from: 'bot', text: 'Hi 👋 Welcome to Green Woods, Bachupally. Mind sharing your name so we can serve you better?' },
    ]);
    this.afterUpdate();
  }

  send(e: Event, input: HTMLInputElement) {
    e.preventDefault();
    const value = input.value.trim();
    if (!value || this.busy()) return;
    input.value = '';
    this.reply(value);
  }

  reply(text: string) {
    if (this.busy()) return;
    this.messages.update(m => [...m, { from: 'user', text }]);
    this.busy.set(true);
    this.afterUpdate();

    setTimeout(() => {
      const s = this.step();
      let bot = '';
      let next: Step = s;

      switch (s) {
        case 'name':
          bot = `Nice to meet you, ${text}. Which configuration interests you the most?`;
          next = 'config';
          break;
        case 'config':
          bot = "Great choice. What's your budget range?";
          next = 'budget';
          break;
        case 'budget':
          bot = 'Got it. When are you planning to buy?';
          next = 'timeline';
          break;
        case 'timeline':
          bot = "Perfect. What's the best phone number for our team to reach you on?";
          next = 'phone';
          break;
        case 'phone': {
          const digits = text.replace(/\D/g, '');
          if (digits.length < 7 || digits.length > 15) {
            bot = "That doesn't look like a valid number. Could you re-enter it?";
          } else {
            bot = 'Thank you! When is the best time to call you?';
            next = 'time';
          }
          break;
        }
        case 'time':
          bot =
            'Awesome — we have everything we need. A Green Woods sales associate will call you back at the time you chose. Meanwhile, feel free to browse our floor plans, master plan, or book a site visit. Welcome aboard! 🌳';
          next = 'done';
          break;
      }

      this.messages.update(m => [...m, { from: 'bot', text: bot }]);
      this.step.set(next);
      this.busy.set(false);
      this.afterUpdate();
    }, 500);
  }

  /** scroll messages to the bottom and focus the text box when it is shown */
  private afterUpdate() {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.box?.nativeElement.focus();
    }, 60);
  }
}