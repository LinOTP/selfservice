import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-step-actions',
  templateUrl: './step-actions.component.html',
  styleUrls: ['./step-actions.component.scss']
})
export class StepActionsComponent {
  @Input() awaitingResponse: boolean = false;
  @Input() disableSubmit: boolean = true;
  @Input() isDoneStep: boolean = false;
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
}
