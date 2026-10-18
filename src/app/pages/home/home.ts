import { Component } from '@angular/core';
import { Hero } from '../../sections/hero/hero';
import { Highlights } from '../../sections/highlights/highlights';
import { Overview } from '../../sections/overview/overview';
import { WhyChoose } from '../../sections/why-choose/why-choose';
import { Audience } from '../../sections/audience/audience';
import { Clubhouse } from '../../sections/clubhouse/clubhouse';
import { MasterPlan } from '../../sections/master-plan/master-plan';
import { Landscape } from '../../sections/landscape/landscape';
import { Connectivity } from '../../sections/connectivity/connectivity';
import { ProgressVideo } from '../../sections/progress-video/progress-video';
import { Enquiry } from '../../sections/enquiry/enquiry';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    Highlights,
    Overview,
    WhyChoose,
    Audience,
    Clubhouse,
    MasterPlan,
    Landscape,
    Connectivity,
    ProgressVideo,
    Enquiry,
  ],
  templateUrl: './home.html',
})
export class Home {}