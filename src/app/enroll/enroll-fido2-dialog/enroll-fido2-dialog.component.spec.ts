import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollFIDO2DialogComponent } from './enroll-fido2-dialog.component';

describe('EnrollFIDO2DialogComponent', () => {
  let component: EnrollFIDO2DialogComponent;
  let fixture: ComponentFixture<EnrollFIDO2DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollFIDO2DialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollFIDO2DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
