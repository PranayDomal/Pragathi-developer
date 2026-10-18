import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LocationPage } from './pages/location-page/location-page';
import { GalleryPage } from './pages/gallery-page/gallery-page';
import { SpecificationsPage } from './pages/specifications-page/specifications-page';
import { PricePage } from './pages/price-page/price-page';
import { FloorPlansPage } from './pages/floor-plans-page/floor-plans-page';
import { ContactPage } from './pages/contact-page/contact-page';
import { AmenitiesPage } from './pages/amenities-page/amenities-page';
import { AdminPage } from './admin/admin-page/admin-page';
import { adminGuard } from './core/services/admin-http';


export const routes: Routes = [

    { 
      path: 'admin', component: AdminPage, title: 'Admin | Green Woods', canActivate: [adminGuard]
    },

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
  { 
    path: 'amenities', component: AmenitiesPage, title: 'Amenities — 60+ Modern Lifestyle Amenities | Green Woods' 
  },
  // Any unknown address goes back to the home page
  { path: '**', redirectTo: '' },
];