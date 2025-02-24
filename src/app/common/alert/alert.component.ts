import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-warning',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() msgTmpl: TemplateRef<any>;
  @Input() type: 'info' | 'warning' | 'error' = 'warning'
}
