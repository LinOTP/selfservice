import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-wait-indicator',
  templateUrl: './button-wait-indicator.component.html',
  styleUrls: ['./button-wait-indicator.component.scss']
})
export class ButtonWaitIndicatorComponent {

  @Input() public show = false;

  constructor() { }

}
