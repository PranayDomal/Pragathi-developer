import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricePage } from './price-page';

describe('PricePage', () => {
  let component: PricePage;
  let fixture: ComponentFixture<PricePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricePage],
    }).compileComponents();

    fixture = TestBed.createComponent(PricePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
