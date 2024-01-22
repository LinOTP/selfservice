import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { LockableActionDialogContentComponent } from "./lockable-action-dialog.content.component";

describe("LockableActionDialogContentComponent", () => {
  let component: LockableActionDialogContentComponent
  let fixture: ComponentFixture<LockableActionDialogContentComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [LockableActionDialogContentComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockableActionDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should show standard message if no confirmation is required", waitForAsync(() => {
    component.state = { isLocked: false, confirmationRequired: false }
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const standardMessage = fixture.nativeElement.querySelector('.standard-message');
      expect(standardMessage).toBeTruthy();

      const confirmMessage = fixture.nativeElement.querySelector('.confirmation-message');
      expect(confirmMessage).toBeFalsy();
    })
  }))

  it("should show confirmation message if confirmation is required", waitForAsync(() => {
    component.state = { isLocked: false, confirmationRequired: true }
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const confirmMessage = fixture.nativeElement.querySelector('.confirmation-message');
      expect(confirmMessage).toBeTruthy();

      const standardMessage = fixture.nativeElement.querySelector('.standard-message');
      expect(standardMessage).toBeFalsy();
    })
  }))

  it("should show locked message if locked and confirmation required", waitForAsync(() => {
    component.state = { isLocked: true, confirmationRequired: true }
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const lockedMessage = fixture.nativeElement.querySelector('.locked-status-message');
      expect(lockedMessage).toBeTruthy();

      const standardMessage = fixture.nativeElement.querySelector('.standard-message');
      expect(standardMessage).toBeFalsy();

      const confirmMessage = fixture.nativeElement.querySelector('.confirmation-message');
      expect(confirmMessage).toBeFalsy();
    })
  }))

  it("should show standard message if not locked and no confirmation required", waitForAsync(() => {
    component.state = { isLocked: true, confirmationRequired: false }
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const lockedMessage = fixture.nativeElement.querySelector('.locked-status-message');
      expect(lockedMessage).toBeFalsy();

      const standardMessage = fixture.nativeElement.querySelector('.standard-message');
      expect(standardMessage).toBeTruthy();
    })
  }))
})