import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EnrollPushComponent } from './enroll-push.component';
import { MaterialModule } from '../../material.module';

describe('EnrollPushComponent', () => {
  let component: EnrollPushComponent;
  let fixture: ComponentFixture<EnrollPushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPushComponent,
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
