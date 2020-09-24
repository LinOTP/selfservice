import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardKeyComponent } from './keyboard-key.component';
import { MaterialModule } from '../material.module';

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
