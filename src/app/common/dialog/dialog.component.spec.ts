import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MaterialModule } from '@app/material.module';

import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [DialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpy('close')
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {} // TODO: Add any data you wish to test if it is passed/used correctly
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
