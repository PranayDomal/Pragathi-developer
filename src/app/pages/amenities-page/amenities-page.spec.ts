import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmenitiesPage } from './amenities-page';

describe('AmenitiesPage', () => {
  let component: AmenitiesPage;
  let fixture: ComponentFixture<AmenitiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenitiesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AmenitiesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
