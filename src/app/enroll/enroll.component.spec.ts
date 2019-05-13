import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollComponent } from './enroll.component';
import { MaterialModule } from '../material.module';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TokenService } from '../api/token.service';

describe('EnrollComponent', () => {
  let component: EnrollComponent;
  let fixture: ComponentFixture<EnrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
      ],
      declarations: [
        EnrollComponent
      ],
      providers: [
        {
          provide: TokenService,
          useValue: { tokenTypes: [] }
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
