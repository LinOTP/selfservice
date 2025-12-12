import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { of } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { spyOnClass } from '@testing/spyOnClass';

import { OperationsService } from '@api/operations.service';
import { MaterialModule } from '@app/material.module';

import { MockComponent } from '@testing/mock-component';
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
        MockComponent({ selector: 'app-token-dialog-header', inputs: ['token'] }),
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] })
      ],
      declarations: [
        SetDescriptionDialogComponent,
      ],
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
