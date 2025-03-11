import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { GetSerialDialogComponent } from '@common/get-serial-dialog/get-serial-dialog.component';


@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent extends EnrollDialogBase implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  @ViewChild('serialInput') public serialInput: ElementRef;

  ngOnInit() {
    this.createTokenForm.addControl('serial', this.formBuilder.control('', Validators.required));
    super.ngOnInit();
  }

  /**
   * Submit token serial to token service for self-assignment. If successful,
   * display a success message, otherwise display an error message and the possibility
   * to retry the assignment process without leaving the dialog.
   */
  public assignToken() {
    const serial = this.createTokenForm.get('serial').value;
    const description = this.createTokenForm.get('description').value;
    let pin = '';
    if (this.setOtpPinPolicyEnabled) {
      pin = this.createTokenForm.get('pinForm').get('pin').value
    }
    this.enrollmentService.assign(serial, description, pin).subscribe(result => {
      if (result.success) {
        this.enrolledToken = { serial: serial, type: 'assign', description: description };
        this.stepper.steps.get(this.stepper.selectedIndex).completed = true;
        this.stepper.next();
      } else {
        this.notificationService.errorMessage($localize`Token assignment failed.`);
      }
    });
  }

  public getSerial() {
    this.subscriptions.push(
      this.dialog.open(GetSerialDialogComponent).afterClosed().subscribe(serial => {
        if (!serial) return;
        this.notificationService.message($localize`Serial number retrieved.`);
        this.createTokenForm.controls.serial.setValue(serial);
        this.serialInput.nativeElement.focus();
      })
    )
  }

}
