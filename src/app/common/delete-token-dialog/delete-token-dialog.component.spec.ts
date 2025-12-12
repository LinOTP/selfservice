import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { OperationsService } from "@app/api/operations.service";
import { MaterialModule } from "@app/material.module";
import { MockComponent } from "@testing/mock-component";
import { delay, of } from "rxjs";
import { LockableActionDialogContentComponent } from "../lockable-action-dialog-content/lockable-action-dialog.content.component";
import { DeleteTokenDialogComponent } from "./delete-token-dialog.component";

describe('DeleteDialogComponent', () => {
  describe("Template tests", () => {
    let component: DeleteTokenDialogComponent;
    let fixture: ComponentFixture<DeleteTokenDialogComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [CommonModule, MaterialModule, ReactiveFormsModule,
          MockComponent({ selector: 'app-token-dialog-header', inputs: ['token'] }),
          MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] })
        ],
        declarations: [
          DeleteTokenDialogComponent,
          LockableActionDialogContentComponent,
        ],
        providers: [
          {
            provide: MatDialogRef,
            useClass: MatDialogRefStub
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: getDialogDataMock()
          },
          {
            provide: OperationsService,
            useValue: {
              deleteToken: () => of(true).pipe(delay(200))
            }
          }
        ]
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DeleteTokenDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have enabled button when no confirmation required', waitForAsync(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.confirmationRequired).toBeFalse();
        expect(component.confirmCtrl.value).toBeTrue();

        const submitBtn = fixture.nativeElement.querySelector('.submit-button');
        expect(submitBtn.disabled).toBeFalse();
      })
    }));

    it('should enable button when action confirmed', waitForAsync(() => {
      component.confirmationRequired = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.confirmCtrl.value).toBeFalse();

        let submitBtn = fixture.nativeElement.querySelector('.submit-button');
        expect(submitBtn.disabled).toBeTrue();

        component.confirmCtrl.setValue(true);
        fixture.detectChanges();
        submitBtn = fixture.nativeElement.querySelector('.submit-button');
        expect(submitBtn.disabled).toBeFalse();
      })
    }));

    it("should disable button during request", fakeAsync(() => {
      component.confirmationRequired = false;
      fixture.detectChanges();
      let submitBtn = fixture.nativeElement.querySelector('.submit-button');
      expect(submitBtn.disabled).toBeFalse()
      component.deleteToken()
      fixture.detectChanges()
      expect(submitBtn.disabled).toBeTrue()
      tick(500)
      fixture.detectChanges()
      expect(submitBtn.disabled).toBeFalse()
    }))
  })

  describe("Component tests", () => {
    it("should close dialog with positive result when token is deleted", () => {
      const operationsService = new OperationsServiceStub(true);
      const dialogRef = new MatDialogRefStub();
      const comp = new DeleteTokenDialogComponent(dialogRef as any, getDialogDataMock() as any, operationsService as any)
      comp.deleteToken();
      expect(dialogRef.value).toBeTrue();
    })

    it("should not close dialog when token delete action was not successful", () => {
      const operationsService = new OperationsServiceStub(false);
      const dialogRef = new MatDialogRefStub();
      const comp = new DeleteTokenDialogComponent(dialogRef as any, getDialogDataMock() as any, operationsService as any)
      comp.deleteToken();
      expect(dialogRef.value).toBeNull();
      expect(comp.awaitingResponse).toBeFalse()
    })
  })
})

function getDialogDataMock() {
  return {
    token: { enabled: true },
    lockingEvaluator: {
      checkDeleteWillLockAuth: () => false,
      isUsersAuthLocked: () => false
    }
  }
}

class MatDialogRefStub {
  value: boolean | null = null
  close(value) {
    this.value = value;
  }
}

class OperationsServiceStub {
  constructor(public result: boolean) { }
  deleteToken(serial: string) {
    return of(this.result);
  }
}