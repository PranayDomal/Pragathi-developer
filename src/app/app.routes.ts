import { Routes } from '@angular/router';
import { Home } from './home/home';
import { LocationPage } from './location-page/location-page';
import { GalleryPage } from './gallery-page/gallery-page';
import { SpecificationsPage } from './specifications-page/specifications-page';
import { PricePage } from './price-page/price-page';
import { FloorPlansPage } from './floor-plans-page/floor-plans-page';
import { ContactPage } from './contact-page/contact-page';


export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home | Green Woods — Pragathi Developers',
  },
  {
    path: 'location',
    component: LocationPage,
    title: 'Location & Connectivity | Green Woods — Pragathi Developers',
  },
  {
    path: 'gallery',
    component: GalleryPage,
    title: 'Gallery | Green Woods — Pragathi Developers',
  },
  {
    path: 'specifications',
    component: SpecificationsPage,
    title: 'Specifications | Green Woods — Pragathi Developers',
  },
  {
    path: 'price',
    component: PricePage,
    title: 'Price & Payment Plan | Green Woods — Pragathi Developers',
  },

  { 
    path: 'floor-plans', component: FloorPlansPage, title: 'Floor Plans | Green Woods — Pragathi Developers' 
  },

  { path: 'contact', component: ContactPage, title: 'Contact Us | Green Woods — Pragathi Developers' 

  },

  // Any unknown address goes back to the home page
  { path: '**', redirectTo: '' },
];