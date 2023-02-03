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
import { SetPinDialogComponent } from '../common/set-pin-dialog/set-pin-dialog.component';
import { DialogComponent } from '../common/dialog/dialog.component';
import { TokenType } from '@linotp/data-models';
import { LoginService } from '../login/login.service';
import { TestDialogComponent } from '../test/test-dialog.component';
import { TokenService } from '../api/token.service';

class MockComponent extends EnrollDialogBaseComponent { }

describe('EnrollDialogBaseComponent with testing permissions', () => {
    let component: MockComponent;
    let fixture: ComponentFixture<MockComponent>;

    let operationsService: jasmine.SpyObj<OperationsService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let permissionsService: jasmine.SpyObj<NgxPermissionsService>;
    let loginService: jasmine.SpyObj<LoginService>;

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
                    provide: TokenService,
                    useValue: spyOnClass(TokenService)
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
                    provide: LoginService,
                    useValue: spyOnClass(LoginService)
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
                    useValue: { tokenType: TokenType.HOTP },
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
        loginService = getInjectedStub(LoginService);

        dialogRef = getInjectedStub<MatDialogRef<MockComponent>>(MatDialogRef);
        dialog = getInjectedStub(MatDialog);

        loginService.hasPermission$.and.returnValue(of(true));

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
        expect(component.closeLabel).toEqual('Test');
        expect(component.testAfterEnrollment).toEqual(true);
    });

    describe('close', () => {
        it('should not return anything', () => {
            fixture.detectChanges();

            component.close();
            expect(dialogRef.close).toHaveBeenCalledWith();
        });
    });

    describe('finalizeEnrollment', () => {
        it(`should open the TestDialog`, () => {
            fixture.detectChanges();

            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            fixture.detectChanges();

            dialogRef.afterClosed.and.returnValue(of({}));
            dialog.open.and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<TestDialogComponent>);

            component.finalizeEnrollment();
            expect(dialogRef.close).toHaveBeenCalledWith();
            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(dialog.open).toHaveBeenCalledOnceWith(TestDialogComponent, {
                width: '650px',
                data: component.enrolledToken
            });
        });
    });

    describe('cancel', () => {
        it('should delete enrolled token if the user has permissions and close dialog', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            operationsService.deleteToken.and.returnValue(of(true));
            dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<DialogComponent>);


            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            fixture.detectChanges();

            component.cancel();
            tick();

            expect(operationsService.deleteToken).toHaveBeenCalledWith('serial');
            expect(notificationService.message).toHaveBeenCalledWith('Incomplete token was deleted');
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not delete enrolled token if the user has no permissions and close dialog with false', fakeAsync(() => {
            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(false)));
            dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<DialogComponent>);

            fixture.detectChanges();

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(notificationService.message).not.toHaveBeenCalled();
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not call delete token if no token was enrolled', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<DialogComponent>);

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));

        it('should not call delete token nor close dialog if user does not confirm', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            dialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<DialogComponent>);

            component.cancel();
            tick();

            expect(operationsService.deleteToken).not.toHaveBeenCalled();
            expect(dialogRef.close).not.toHaveBeenCalled();
        }));

        it('should close dialog if user confirms but delete fails', fakeAsync(() => {
            permissionsService.hasPermission.and.returnValue(new Promise(resolve => resolve(true)));
            dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<DialogComponent>);
            operationsService.deleteToken.and.returnValue(of(false));

            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            fixture.detectChanges();

            component.cancel();
            tick();

            expect(operationsService.deleteToken).toHaveBeenCalledWith('serial');
            expect(notificationService.message).not.toHaveBeenCalledWith('Incomplete token was deleted');
            expect(dialogRef.close).toHaveBeenCalledWith();
        }));
    });

    describe('setPin', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should set pin of token and output message', fakeAsync(() => {
            dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<SetPinDialogComponent>);

            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            component.setPin();
            tick();

            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(notificationService.message).toHaveBeenCalledWith('PIN set');
        }));

        it('should not do anything if the user closes the dialog', fakeAsync(() => {
            dialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<SetPinDialogComponent>);

            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            component.setPin();
            tick();

            expect(dialog.open).toHaveBeenCalledTimes(1);
            expect(notificationService.message).not.toHaveBeenCalled();
        }));
    });

});

describe('EnrollDialogBaseComponent without testing permissions', () => {
    let component: MockComponent;
    let fixture: ComponentFixture<MockComponent>;

    let loginService: jasmine.SpyObj<LoginService>;

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
                    provide: TokenService,
                    useValue: spyOnClass(TokenService)
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
                    provide: LoginService,
                    useValue: spyOnClass(LoginService)
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
                    useValue: { tokenType: TokenType.HOTP },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MockComponent);
        component = fixture.componentInstance;

        loginService = getInjectedStub(LoginService);

        dialogRef = getInjectedStub<MatDialogRef<MockComponent>>(MatDialogRef);
        dialog = getInjectedStub(MatDialog);

        loginService.hasPermission$.and.returnValue(of(false));

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
        expect(component.closeLabel).toEqual('Close');
        expect(component.testAfterEnrollment).toEqual(false);
    });

    describe('finalizeEnrollment', () => {
        it(`should not open the TestDialog`, () => {
            fixture.detectChanges();

            component.enrolledToken = { serial: 'serial', type: TokenType.HOTP };
            fixture.detectChanges();

            dialogRef.afterClosed.and.returnValue(of({}));

            component.finalizeEnrollment();
            expect(dialog.open).not.toHaveBeenCalled();
            expect(dialogRef.close).toHaveBeenCalledWith();
        });
    });
});
