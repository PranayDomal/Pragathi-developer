import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Enquiry } from './enquiry';

describe('Enquiry', () => {
  let component: Enquiry;
  let fixture: ComponentFixture<Enquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enquiry],
    }).compileComponents();

    fixture = TestBed.createComponent(Enquiry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
