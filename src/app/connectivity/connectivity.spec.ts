import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Connectivity } from './connectivity';

describe('Connectivity', () => {
  let component: Connectivity;
  let fixture: ComponentFixture<Connectivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Connectivity],
    }).compileComponents();

    fixture = TestBed.createComponent(Connectivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
