import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { spyOnClass } from '@testing/spyOnClass';

import { TokenService } from '@api/token.service';
import { MaterialModule } from '@app/material.module';
import { CapitalizePipe } from '@common/pipes/capitalize.pipe';

import { EnrollmentGridComponent } from './enrollment-grid.component';


describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
        NgxPermissionsAllowStubDirective,
      ],
      declarations: [
        EnrollmentGridComponent,
        CapitalizePipe,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
