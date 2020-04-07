import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { OperationsService } from '../../api/operations.service';
import { NotificationService } from '../notification.service';
import { SetDescriptionDialogComponent } from './set-description-dialog.component';

class Page extends TestingPage<SetDescriptionDialogComponent> {

  public getDisabledSubmitButton() {
    return this.query('[type="submit"] [disabled]');
  }
}

describe('SetDecriptionDialogComponent', () => {
  let component: SetDescriptionDialogComponent;
  let fixture: ComponentFixture<SetDescriptionDialogComponent>;
  let operationsService: OperationsService;
  let notificationService: NotificationService;
  const token = Fixtures.activeHotpToken;
  let page: Page;
  let matDialogRef: MatDialogRef<SetDescriptionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [SetDescriptionDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: token
        },
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        I18nMock,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    operationsService = TestBed.get(OperationsService);
    notificationService = TestBed.get(NotificationService);
    matDialogRef = TestBed.get(MatDialogRef);

    fixture = TestBed.createComponent(SetDescriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setDescription and close dialog if successful', () => {
    component.form.setValue({ description: 'descr' });
    fixture.detectChanges();
    operationsService.setDescription = jasmine.createSpy('setDescription').and.returnValue(of({ success: true }));

    component.submit();
    expect(operationsService.setDescription).toHaveBeenCalledWith(token.serial, 'descr');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should display a notification message if submission fails', () => {
    component.form.setValue({ description: 'descr' });
    fixture.detectChanges();
    operationsService.setDescription = jasmine.createSpy('setDescription').and.returnValue(of({ success: false }));

    component.submit();
    expect(notificationService.message).toHaveBeenCalledWith('Token description could not be changed. Please try again.');
  });

});
