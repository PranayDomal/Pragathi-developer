import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clubhouse } from './clubhouse';

describe('Clubhouse', () => {
  let component: Clubhouse;
  let fixture: ComponentFixture<Clubhouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clubhouse],
    }).compileComponents();

    fixture = TestBed.createComponent(Clubhouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
