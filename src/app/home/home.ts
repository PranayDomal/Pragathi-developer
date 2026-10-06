import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Highlights } from '../highlights/highlights';
import { Overview } from '../overview/overview';
import { WhyChoose } from '../why-choose/why-choose';
import { Audience } from '../audience/audience';
import { Clubhouse } from '../clubhouse/clubhouse';
import { MasterPlan } from '../master-plan/master-plan';
import { Landscape } from '../landscape/landscape';
import { Connectivity } from '../connectivity/connectivity';
import { ProgressVideo } from '../progress-video/progress-video';
import { Enquiry } from '../enquiry/enquiry';

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