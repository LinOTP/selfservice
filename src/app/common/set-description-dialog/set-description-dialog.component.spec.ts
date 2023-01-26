import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { OperationsService } from '../../api/operations.service';
import { SetDescriptionDialogComponent } from './set-description-dialog.component';

describe('SetDecriptionDialogComponent', () => {
  let component: SetDescriptionDialogComponent;
  let fixture: ComponentFixture<SetDescriptionDialogComponent>;
  let operationsService: OperationsService;
  const token = Fixtures.activeHotpToken;
  let matDialogRef: MatDialogRef<SetDescriptionDialogComponent>;

  beforeEach(async () => {
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
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    operationsService = TestBed.inject(OperationsService);
    matDialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(SetDescriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setDescription and close dialog if successful', () => {
    component.form.setValue({ description: 'descr' });
    fixture.detectChanges();
    operationsService.setDescription = jasmine.createSpy('setDescription').and.returnValue(of(true));

    component.submit();
    expect(operationsService.setDescription).toHaveBeenCalledWith(token.serial, 'descr');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
  });
});
