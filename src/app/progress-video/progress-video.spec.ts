import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressVideo } from './progress-video';

describe('ProgressVideo', () => {
  let component: ProgressVideo;
  let fixture: ComponentFixture<ProgressVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressVideo],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressVideo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
