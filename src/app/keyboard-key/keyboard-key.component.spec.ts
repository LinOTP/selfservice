import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialModule } from '@app/material.module';

import { KeyboardKeyComponent } from './keyboard-key.component';

describe('KeyboardKeyComponent', () => {
  let component: KeyboardKeyComponent;
  let fixture: ComponentFixture<KeyboardKeyComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      declarations: [
        KeyboardKeyComponent,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
