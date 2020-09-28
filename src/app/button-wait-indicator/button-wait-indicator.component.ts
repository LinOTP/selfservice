import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button-wait-indicator',
  templateUrl: './button-wait-indicator.component.html',
  styleUrls: ['./button-wait-indicator.component.scss']
})
export class ButtonWaitIndicatorComponent implements OnInit {

  @Input() public show = false;

  constructor() { }

  ngOnInit(): void {
  }

}
