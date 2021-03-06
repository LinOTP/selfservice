import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { NgxPermissionsService } from 'ngx-permissions';

import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';

import { MaterialModule } from '../material.module';
import { EnrollmentService } from '../api/enrollment.service';
import { OperationsService } from '../api/operations.service';
import { NotificationService } from '../common/notification.service';

import { EnrollDialogBaseComponent } from './enroll-dialog-base.component';
import { of } from 'rxjs';

class MockComponent extends EnrollDialogBaseComponent { }

describe('EnrollDialogBaseComponent', () => {
    let component: MockComponent;
    let fixture: ComponentFixture<MockComponent>;

    let operationsService: jasmine.SpyObj<OperationsService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let permissionsService: jasmine.SpyObj<NgxPermissionsService>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<MockComponent>>;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [
                EnrollDialogBaseComponent,
                MockComponent,
            ],
            imports: [
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                {
                    provide: OperationsService,
                    useValue: spyOnClass(OperationsService)
                },
                {
                    provide: EnrollmentService,
                    useValue: spyOnClass(EnrollmentService)
                },
                {
                    provide: NotificationService,
                    useValue: spyOnClass(NotificationService)
                },
                {
                    provide: MatDialog,
                    useValue: spyOnClass(MatDialog),
                },
                {
                    provide: MatDialogRef,
                    useValue: spyOnClass(MatDialogRef),
                },
                {
                    provide: NgxPermissionsService,
                    useValue: spyOnClass(NgxPermissionsService)
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { closeLabel: null },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MockComponent);
        component = fixture.componentInstance;

        operationsService = getInjectedStub(OperationsService);
        notificationService = getInjectedStub(NotificationService);
        permissionsService = getInjectedStub(NgxPermissionsService);

        dialogRef = getInjectedStub<MatDialogRef<MockComponent>>(MatDialogRef);
        dialog = getInjectedStub(MatDialog);

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('close', () => {
        it('should not return anything', () => {
            fixture.detectChanges();

            component.close();
            expect(dialogRef.close).toHaveBeenCalledWith();
        });
    });

    describe('closeAndReturnSerial', () => {
        it('should return token serial', () => {
            fixture.detectChanges();

            component.enrolledToken = { serial: 'serial' };
            fixture.detectChanges();

            component.closeAndReturnSerial();
            expect(dialogRef.close).toHaveBeenCalledWith('serial');
        });
    });

    describe('cancel', () => {

        it('should delete enrolled token if the user has permissions and close dialog', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            operationsService.deleteToken.and.returnValue(of(true));
            dialog.open.and.returnValue({ afterClosed: () => of(true) });


            component.enrolledToken = { serial: 'serial' };
            fixture.detectChanges();

            component.cancel();
            tick();

            expect(operationsService.deleteToken).toHaveBeenCalledWith('serial');
            expect(notificationService.message).toHaveBeenCalledWith('Incomplete token was deleted');
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not delete enrolled token if the user has no permissions and close dialog with false', fakeAsync(() => {
            component.enrolledToken = { serial: 'serial' };
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));
            dialog.open.and.returnValue({ afterClosed: () => of(true) });

            fixture.detectChanges();

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(notificationService.message).not.toHaveBeenCalled();
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not call delete token if no token was enrolled', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            dialog.open.and.returnValue({ afterClosed: () => of(true) });

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not call delete token nor close dialog if user does not confirm', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            dialog.open.and.returnValue({ afterClosed: () => of(false) });

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(dialogRef.close).not.toHaveBeenCalled();
        }));
    });

    describe('setPin', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should set pin of token and output message', fakeAsync(() => {
            dialog.open.and.returnValue({ afterClosed: () => of(true) });

            component.enrolledToken = { serial: 'serial' };
            component.setPin();
            tick();

            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(notificationService.message).toHaveBeenCalledWith('PIN set');
        }));

        it('should not do anything if the user closes the dialog', fakeAsync(() => {
            dialog.open.and.returnValue({ afterClosed: () => of(false) });

            component.enrolledToken = { serial: 'serial' };
            component.setPin();
            tick();

            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(notificationService.message).not.toHaveBeenCalled();
        }));
    });

});
