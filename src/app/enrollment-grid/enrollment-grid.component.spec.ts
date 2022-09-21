import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';


import { spyOnClass } from '../../testing/spyOnClass';

import { MaterialModule } from '../material.module';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';

import { TokenService } from '../api/token.service';

import { EnrollmentGridComponent } from './enrollment-grid.component';


describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
      ],
      declarations: [
        EnrollmentGridComponent,
        NgxPermissionsAllowStubDirective,
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
