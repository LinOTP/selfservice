import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { OperationsService } from "@app/api/operations.service";
import { MaterialModule } from "@app/material.module";
import { MockComponent } from "@testing/mock-component";
import { delay, of } from "rxjs";
import { LockableActionDialogContentComponent } from "../lockable-action-dialog-content/lockable-action-dialog.content.component";
import { DisableTokenDialogComponent } from "./disable-token-dialog.component";

describe('DisableTokenDialogComponent', () => {
  describe("Template tests", () => {
    let component: DisableTokenDialogComponent
    let fixture: ComponentFixture<DisableTokenDialogComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [CommonModule, MaterialModule, ReactiveFormsModule,
          MockComponent({ selector: 'app-token-dialog-header', inputs: ['token'] }),
          MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] })
        ],
        declarations: [
          DisableTokenDialogComponent,
          LockableActionDialogContentComponent
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
              disable: () => of(true).pipe(delay(200))
            }
          }
        ]
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DisableTokenDialogComponent);
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

    it('should show standard confirmation message if user can enable', waitForAsync(() => {
      component.confirmationRequired = true;
      component.canEnable = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const confirmMessage = fixture.nativeElement.querySelector('.standard-confirmation-message');
        expect(confirmMessage).toBeTruthy();

        const standardMessage = fixture.nativeElement.querySelector('.non-enable-confirmation-message');
        expect(standardMessage).toBeFalsy();
      })
    }))

    it('should show standard confirmation message if user cannot enable', waitForAsync(() => {
      component.confirmationRequired = true;
      component.canEnable = false;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const confirmMessage = fixture.nativeElement.querySelector('.non-enable-confirmation-message');
        expect(confirmMessage).toBeTruthy();

        const standardMessage = fixture.nativeElement.querySelector('.standard-confirmation-message');
        expect(standardMessage).toBeFalsy();
      })
    }))

    it("should disable button during request", fakeAsync(() => {
      component.confirmationRequired = false;
      fixture.detectChanges();
      let submitBtn = fixture.nativeElement.querySelector('.submit-button');
      expect(submitBtn.disabled).toBeFalse()
      component.disableToken()
      fixture.detectChanges()
      expect(submitBtn.disabled).toBeTrue()
      tick(500)
      fixture.detectChanges()
      expect(submitBtn.disabled).toBeFalse()
    }))
  })

  describe("Component tests", () => {
    it("should close dialog with positive result when token is disabled", () => {
      const operationsService = new OperationsServiceStub(true);
      const dialogRef = new MatDialogRefStub();
      const comp = new DisableTokenDialogComponent(dialogRef as any, getDialogDataMock() as any, operationsService as any)
      comp.disableToken();
      expect(dialogRef.value).toBeTrue();
    })

    it("should not close dialog when token disable action was not successful", () => {
      const operationsService = new OperationsServiceStub(false);
      const dialogRef = new MatDialogRefStub();
      const comp = new DisableTokenDialogComponent(dialogRef as any, getDialogDataMock() as any, operationsService as any)
      comp.disableToken();
      expect(dialogRef.value).toBeNull();
      expect(comp.awaitingResponse).toBeFalse()
    })
  })
});


class MatDialogRefStub {
  value: boolean | null = null
  close(value) {
    this.value = value;
  }
}

class OperationsServiceStub {
  constructor(public result: boolean) { }
  disable(token: any) {
    return of(this.result);
  }
}

function getDialogDataMock() {
  return {
    token: {},
    canEnable: true,
    confirmationRequired: false,
  }
}