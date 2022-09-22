import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-keyboard-key',
  templateUrl: './keyboard-key.component.html',
  styleUrls: ['./keyboard-key.component.scss']
})
export class KeyboardKeyComponent {

  @Input() icon: string; // usage via mat-icon
  @Input() symbol: string; // usage via unicode symbol

  constructor() { }

}
