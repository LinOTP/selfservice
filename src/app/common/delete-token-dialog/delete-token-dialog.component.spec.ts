import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "@app/material.module";
import { LockableActionDialogContentComponent } from "../lockable-action-dialog-content/lockable-action-dialog.content.component";
import { DeleteTokenDialogComponent } from "./delete-token-dialog.component";

describe('DeleteDialogComponent', () => {
  let component: DeleteTokenDialogComponent;
  let fixture: ComponentFixture<DeleteTokenDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MaterialModule, ReactiveFormsModule],
      declarations: [DeleteTokenDialogComponent, LockableActionDialogContentComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpy('close')
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            token: { enabled: true },
            lockingEvaluator: {
              checkDeleteWillLockAuth: () => false,
              isUsersAuthLocked: () => false
            }
          }
        },
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
});
