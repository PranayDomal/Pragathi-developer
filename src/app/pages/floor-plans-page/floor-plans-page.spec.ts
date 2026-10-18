import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloorPlansPage } from './floor-plans-page';

describe('FloorPlansPage', () => {
  let component: FloorPlansPage;
  let fixture: ComponentFixture<FloorPlansPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorPlansPage],
    }).compileComponents();

    fixture = TestBed.createComponent(FloorPlansPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
