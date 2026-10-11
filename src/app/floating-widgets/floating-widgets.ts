import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { ModalState } from '../enquiry-modal/modal-state';
import { ApiService } from '../services/api.service';
import { AdminLoginState } from '../admin-login/admin-login-state';
import { environment } from '../../environments/environment';

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
  private api = inject(ApiService);
  private adminLogin = inject(AdminLoginState);
  readonly showAdmin = !environment.production;

  private answers = { name: '', config: '', budget: '', timeline: '', phone: '', time: '' };

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

  openBrochure() {
    this.modal.showBrochure();
  }

  // Admin login pop-up
    openAdmin() {
    this.adminLogin.show();
  }


  /** Start (or restart) the fixed conversation */
  start() {
    this.answers = { name: '', config: '', budget: '', timeline: '', phone: '', time: '' };
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
          if (text.length < 2) {
            bot = 'Could you share your full name?';
          } else {
            this.answers.name = text.slice(0, 100);
            bot = `Nice to meet you, ${text}. Which configuration interests you the most?`;
            next = 'config';
          }
          break;
        case 'config':
          this.answers.config = text;
          bot = "Great choice. What's your budget range?";
          next = 'budget';
          break;
        case 'budget':
          this.answers.budget = text;
          bot = 'Got it. When are you planning to buy?';
          next = 'timeline';
          break;
        case 'timeline':
          this.answers.timeline = text;
          bot = "Perfect. What's the best phone number for our team to reach you on?";
          next = 'phone';
          break;
        case 'phone': {
          const phone = this.toE164(text);
          if (!phone) {
            bot = "That doesn't look like a valid number. Please enter a 10-digit mobile number, or include your country code (for example +971…).";
          } else {
            this.answers.phone = phone;
            bot = 'Thank you! When is the best time to call you?';
            next = 'time';
          }
          break;
        }
        case 'time':
          this.answers.time = text;
          this.save();      // save() posts the final bot message itself
          return;
      }

      this.messages.update(m => [...m, { from: 'bot', text: bot }]);
      this.step.set(next);
      this.busy.set(false);
      this.afterUpdate();
    }, 500);
  }

  // "98765 43210" -> "+919876543210"; "+971 50 123 4567" -> "+971501234567"
  private toE164(text: string): string | null {
    const t = text.trim();
    const digits = t.replace(/\D/g, '');
    if (t.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? '+' + digits : null;
    const d = digits.replace(/^0+/, '').replace(/^91(?=\d{10}$)/, '');
    return /^[6-9]\d{9}$/.test(d) ? '+91' + d : null;
  }

  private save() {
    const a = this.answers;
    const message = [
      `Budget: ${a.budget}`,
      `Timeline: ${a.timeline}`,
      `Best time to call: ${a.time}`,
    ].join('\n');

    this.api
      .submit({
        name: a.name,
        phone: a.phone,
        type: 'Chat',
        configuration: a.config === 'Just exploring' ? 'Any' : a.config,
        message,
      })
      .subscribe({
        next: (res) =>
          this.finish(
            res.alreadyReceived
              ? 'Thanks — we already have your details, and our team will call you soon. Meanwhile, feel free to browse our floor plans or book a site visit. 🌳'
              : 'Awesome — we have everything we need. A Green Woods sales associate will call you back at the time you chose. Meanwhile, feel free to browse our floor plans, master plan, or book a site visit. Welcome aboard! 🌳',
          ),
        error: () => {
          this.messages.update(m => [
            ...m,
            { from: 'bot', text: "Sorry, we couldn't save your details just now. Please pick a time again to retry." },
          ]);
          this.busy.set(false);
          this.afterUpdate();
        },
      });
  }

  private finish(text: string) {
    this.messages.update(m => [...m, { from: 'bot', text }]);
    this.step.set('done');
    this.busy.set(false);
    this.afterUpdate();
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