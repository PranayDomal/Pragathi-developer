import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecificationsPage } from './specifications-page';

describe('SpecificationsPage', () => {
  let component: SpecificationsPage;
  let fixture: ComponentFixture<SpecificationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificationsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecificationsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
