import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdmissionConfiguration } from './admission-configuration';

describe('AdmissionConfiguration', () => {
  let component: AdmissionConfiguration;
  let fixture: ComponentFixture<AdmissionConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionConfiguration],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionConfiguration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
