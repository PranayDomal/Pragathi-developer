import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingWidgets } from './floating-widgets';

describe('FloatingWidgets', () => {
  let component: FloatingWidgets;
  let fixture: ComponentFixture<FloatingWidgets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingWidgets],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWidgets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
