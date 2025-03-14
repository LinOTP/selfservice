import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeInputComponent } from './qr-code-input.component';
import { MaterialModule } from "@app/material.module";

describe('QrCodeInputComponent', () => {
  let component: QrCodeInputComponent;
  let fixture: ComponentFixture<QrCodeInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [QrCodeInputComponent]
    });
    fixture = TestBed.createComponent(QrCodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
