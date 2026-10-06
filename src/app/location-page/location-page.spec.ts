import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationPage } from './location-page';

describe('LocationPage', () => {
  let component: LocationPage;
  let fixture: ComponentFixture<LocationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
