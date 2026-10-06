import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalState } from '../enquiry-modal/modal-state';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private modal = inject(ModalState);

  // Opens the Enquire Now pop-up (used by both the Brochure and Enquire buttons)
  openEnquiry(event: Event) {
    event.preventDefault();
    this.modal.show();
  }
}