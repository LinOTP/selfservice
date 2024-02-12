import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "@app/material.module";
import { MockComponent } from "@testing/mock-component";
import { LockableActionDialogContentComponent } from "../lockable-action-dialog-content/lockable-action-dialog.content.component";
import { DisableTokenDialogComponent } from "./disable-token-dialog.component";

describe('DisableTokenDialogComponent', () => {
  let component: DisableTokenDialogComponent
  let fixture: ComponentFixture<DisableTokenDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MaterialModule, ReactiveFormsModule],
      declarations: [
        DisableTokenDialogComponent,
        LockableActionDialogContentComponent,
        MockComponent({ selector: 'app-token-dialog-header', inputs: ['token'] }),
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpy('close')
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            canEnable: true,
            confirmationRequired: false
          }
        },
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
});
