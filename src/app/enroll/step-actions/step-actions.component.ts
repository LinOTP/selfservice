import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-step-actions',
  templateUrl: './step-actions.component.html',
  styleUrls: ['./step-actions.component.scss'],
  standalone: false
})
export class StepActionsComponent {
  @Input() awaitingResponse: boolean = false;
  @Input() disableSubmit: boolean = true;
  @Input() isDoneStep: boolean = false;
  @Input() focusCancelButton: boolean = false;
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
}
