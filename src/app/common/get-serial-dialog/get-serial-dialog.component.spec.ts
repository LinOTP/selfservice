import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../notification.service';
import { GetSerialDialogComponent } from './get-serial-dialog.component';

describe('GetSerialDialogComponent', () => {
  let component: GetSerialDialogComponent;
  let fixture: ComponentFixture<GetSerialDialogComponent>;
  let tokenService: TokenService;
  let notificationService: NotificationService;
  let matDialogRef: MatDialogRef<GetSerialDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [GetSerialDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    tokenService = TestBed.inject(TokenService);
    notificationService = TestBed.inject(NotificationService);
    matDialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(GetSerialDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSerialByOTP and close dialog if successful', () => {
    component.form.setValue({ otp: '1234' });
    fixture.detectChanges();
    tokenService.getSerialByOTP = jasmine.createSpy('getSerialByOTP').and.returnValue(of('serial'));

    component.submit();
    expect(tokenService.getSerialByOTP).toHaveBeenCalledWith('1234');
    expect(matDialogRef.close).toHaveBeenCalledWith('serial');
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should display a notification message if submission fails', () => {
    component.form.setValue({ otp: '1234' });
    fixture.detectChanges();
    tokenService.getSerialByOTP = jasmine.createSpy('getSerialByOTP').and.returnValue(of(null));

    component.submit();
    expect(notificationService.message).toHaveBeenCalledWith('Token serial could not be retrieved. Please try again.');
  });

});
