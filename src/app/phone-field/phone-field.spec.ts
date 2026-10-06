import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneField } from './phone-field';

describe('PhoneField', () => {
  let component: PhoneField;
  let fixture: ComponentFixture<PhoneField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneField],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
