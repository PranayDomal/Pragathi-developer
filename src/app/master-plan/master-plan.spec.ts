import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterPlan } from './master-plan';

describe('MasterPlan', () => {
  let component: MasterPlan;
  let fixture: ComponentFixture<MasterPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
